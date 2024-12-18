import type { CurrentElementEntity, ElementsEntity, ShopifyHandleEntity } from 'app/entities';
import { TemplateEngine } from './template-engine';
import { LIMITED_SIZE_CLASS, ONE_KB, SECTION_DATA_GLOBAL_ATTR, SECTION_SPACING } from './consts';
import { getChildrenElements } from './get-children-elements';
import { getScriptContent, scriptEncode } from './handle-script';
import { wrapperEnd, wrapperStart } from './wrapper';
import { addLiquidAssign } from './add-liquid-assign';
import { each } from 'app/utils/each';
import { isSection } from 'app/utils/is-section';
import { objectValues } from 'app/utils/object-values';

export interface ElementStringifyArgs {
  /**
   * Các handle của shopify (product, collection...)
   * Mục đích để tạo ra đoạn code assign liquid cho các trường hợp tại trang product, collection...
   */
  handles?: ShopifyHandleEntity;
  /**
   * Các element từ bảng elements
   */
  rootElements: ElementsEntity.Entities;
  /**
   * Các element được sử dụng trong page
   */
  elements: CurrentElementEntity.Elements;
  /**
   * Chế độ cho editor
   */
  designMode?: boolean;
  /**
   * Xem đây có phải là chế độ preview hay không
   */
  previewMode?: boolean;
  /**
   * Settings của toàn bộ page
   */
  globalSettings?: Record<string, any>;
  /**
   * Settings của từng page
   */
  pageSettings?: Record<string, any>;
  /**
   * Biên dịch code này cho shopify hay editor
   */
  type?: 'shopify' | 'editor';
  /**
   * Thêm order chỉ dành cho page chứ section không cần
   */
  pageOrder?: string[];
  /**
   * Id này là duy nhất của page, section, block
   */
  dataId?: string;
  /**
   * Plan
   */
  plan?: string;
}

export interface ChunkArgs {
  /**
   * HTML cần chunk
   */
  html: string;
  /**
   * Kích thước tối đa của mỗi phần
   * @default 250KB (250 * 1024 bytes)
   */
  size?: number;
  /**
   * Thông báo lỗi nếu có
   */
  errorMessage?: string;
}

interface FilterResultItem {
  html: string;
  index: number;
}

const GLOBAL_REGEXP = new RegExp(`${SECTION_DATA_GLOBAL_ATTR}=["']true["']`, 'g');

export class Serializer {
  static toHtml({
    rootElements,
    elements,
    designMode,
    previewMode,
    globalSettings,
    pageSettings,
    type = 'shopify',
    handles,
    pageOrder,
    dataId,
    plan,
  }: ElementStringifyArgs) {
    function handleChild(childId: string, index: number) {
      const child = elements[childId]!;
      if (child.type === 'element') {
        return `${elementStringifyRecursively(child, index)}\n`;
      }
      if (child.type === 'wrapper') {
        return `${elementStringifyRecursively(child, index)}\n`;
      }
      return '\n';
    }

    function elementStringifyRecursively(element: CurrentElementEntity.Element, index: number): string {
      const rootElement = rootElements[element.elementId];
      const forShopify = type === 'shopify';

      // Nếu trường hợp element không tồn tại hoặc đã bị xoá khỏi bảng element gốc
      // Thì sẽ trả về string rỗng
      if (!rootElement) {
        return '';
      }

      // Nếu element này ẩn thì sẽ trả về string rỗng
      // Chỉ cần check cho trường hợp đẩy lên shop sau này
      if (forShopify && element.hide) {
        return '';
      }

      const template = addLiquidAssign(rootElement?.template || element.template || '', element, rootElements, handles);

      const script = getScriptContent(TemplateEngine.removeStyle(template));

      const html = TemplateEngine[forShopify ? 'compile' : '$compile']({
        index,
        template: forShopify
          ? TemplateEngine.removeStyle(TemplateEngine.removeScript(template))
          : scriptEncode(script) + TemplateEngine.removeScript(template),
        element,
        designMode,
        previewMode,
        dataId,
        plan,
        children: getChildrenElements(element, elements),
        parent: element.parent ? elements[element.parent] : undefined,
        globalSettings,
        pageSettings,
        rootElements,
        script,
        throwOnError: false,
        startSignal: wrapperStart(forShopify, element.id),
        endSignal: wrapperEnd(forShopify),
      });

      if (element.type === 'element') {
        return html;
      }

      const children = element.children.map(handleChild);

      if (forShopify) {
        return (
          html
            // Trường hợp cho $children có dạng $children[0], $children[1], ...
            .replace(/\$children\[\d+\]/g, (val: any) => {
              const i = Number(val.replace(/\$children\[/g, '').replace(/\]/g, ''));
              return children[i];
            })
            // Trường hợp cho $children không phải dạng $children[0], $children[1], ...
            .replace(/\$children(?!\[)/g, children.join(''))
        );
      }

      return (
        html
          // Trường hợp cho $children có dạng $children[0], $children[1], ...
          .replace(/\$children\[\d+\]/g, (val: any) => {
            const i = Number(val.replace(/\$children\[/g, '').replace(/\]/g, ''));
            return `${val}${children[i]}`;
          })
          // Trường hợp cho $children không phải dạng $children[0], $children[1], ...
          .replace(/\$children(?!\[)/g, `$children\n${children.join('')}`)
      );
    }

    if (pageOrder) {
      return pageOrder
        .map((sectionId, index) => `${elementStringifyRecursively(elements[sectionId], index)}\n${SECTION_SPACING}\n`)
        .join('')
        .trim()
        .replace(new RegExp(`${SECTION_SPACING}$`, 'g'), '');
    }
    return objectValues(elements)
      .map((element, index) => {
        if (isSection(element)) {
          return `${elementStringifyRecursively(element, index)}\n${SECTION_SPACING}\n`;
        }
        return '';
      })
      .join('')
      .trim()
      .replace(new RegExp(`${SECTION_SPACING}$`, 'g'), '');
  }

  /**
   * Chunk html thành các phần nhỏ theo size
   */
  static chunk({ html, size = 250, errorMessage = 'Error' }: ChunkArgs) {
    const maxSize = size * ONE_KB;
    const result: string[] = [];
    const sections = html.trim().split(SECTION_SPACING);

    if (!sections) {
      return [];
    }

    each(sections, section => {
      const finalSection = section.trim();
      // Tính kích thước của file bằng bytes
      const fileSize = Buffer.byteLength(finalSection, 'utf8');
      // Kiểm tra xem section có phải là global không
      const isGlobal = finalSection.search(GLOBAL_REGEXP) !== -1;
      // Result rỗng
      const resultEmpty = result.length === 0;
      // Kiểm tra xem file cuối cùng trong result có phải là global không
      const lastIsGlobal = result?.[result.length - 1]?.search(GLOBAL_REGEXP) !== -1;
      // Tính kích thước của file cuối cùng trong result cộng thêm kích thước của section
      const lastFileSizeWithSection = Buffer.byteLength(result?.[result.length - 1] ?? '', 'utf8') + fileSize;

      if (fileSize > maxSize) {
        result.push(`<div class="${LIMITED_SIZE_CLASS}">${errorMessage}</div>`);
      } else if (isGlobal || lastIsGlobal || resultEmpty || lastFileSizeWithSection > maxSize) {
        result.push(finalSection);
      } else {
        result[result.length - 1] += finalSection;
      }
    });

    return result;
  }

  static filter(html: string[], isGlobal: boolean) {
    return html.reduce((acc, section, index) => {
      if (isGlobal) {
        if (section.search(GLOBAL_REGEXP) !== -1) {
          acc.push({ html: section, index });
        }
      } else if (section.search(GLOBAL_REGEXP) === -1) {
        acc.push({ html: section, index });
      }
      return acc;
    }, [] as FilterResultItem[]);
  }
}
