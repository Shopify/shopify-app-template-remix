import { CurrentElementEntity } from './current-element.entity';
import { CurrentElementSettings, ExcludeAction, FieldValue, IconName, PageType, UniqueId, IImage, PreviewExcludeAction } from './shared-kernel';

export declare namespace ElementsEntity {
    type SectionType = 'content' | 'design' | 'advanced';
    type SecondaryAction = 'delete';
    interface Field {
        /**
         * Id (name) của field
         */
        id: UniqueId;
        /**
         * Tên của field
         * @default ""
         */
        label?: string;
        /**
         * Mô tả tóm tắt của field
         */
        helpText?: string;
        /**
         * Field disabled
         */
        disabled?: boolean;
        /**
         * Field thuộc section nào
         * Hiện tại có 3 section: content, design, advanced
         * @default content
         */
        sectionType?: SectionType;
        /**
         * Trường hợp ẩn hiện field
         */
        condition?: string;
        /**
         * Giá trị mặc định của field
         */
        default?: FieldValue;
        /**
         * type của field
         */
        type: string;
        /**
         * Field này thuộc style để khi paste style sẽ lấy thêm giá trị của field này
         */
        isStyle?: boolean;
        /**
         * Có thể chứa các key khác
         */
        [key: string]: any;
    }
    interface InlineField {
        /**
         * Id (name) của field
         */
        id: UniqueId;
        /**
         * Tên của field
         * @default ""
         */
        label?: string;
        /**
         * Mô tả tóm tắt của field
         */
        helpText?: string;
        /**
         * Path để sync với value của field
         */
        path: string | string[];
        /**
         * Type của field
         */
        type: string;
        /**
         * Hiển thị divider ở cuối field
         */
        divider?: boolean;
    }
    type Fields = Field[];
    type FieldType = Field['type'];
    /**
     * Page nào có thể sử dụng element này
     * @default all
     */
    type PageApply = PageType[] | 'all';
    interface DefaultElement {
        /**
         * Id của element
         */
        id: UniqueId;
        /**
         * Tên của element
         */
        label: string;
        /**
         * Tên của element nhưng được sync từ value của 1 field
         */
        labelSync?: string;
        /**
         * Image của element nhưng được sync từ value của 1 field
         */
        imageSync?: string;
        /**
         * Icon của element
         */
        icon?: IconName;
        /**
         * Các fields của element nằm tại đây
         * Là nơi tạo ra các settings của element trong page hiện tại
         */
        settings?: Field[];
        /**
         * Là nơi tạo ra các settings của element trong page hiện tại
         */
        inlineSettings?: InlineField[];
        /**
         * Các category của element
         */
        categories: UniqueId[];
        /**
         * Các tag của element
         */
        tags?: UniqueId[];
        /**
         * Không hiển thị tại bảng elements
         */
        hidden?: boolean;
        /**
         * Đây là html của element
         */
        template: string;
        /**
         * Tắt mở tính năng drag
         */
        dragDisabled?: boolean;
        /**
         * Chỉ định các element thuộc cùng nhóm với nhau
         */
        group?: string;
        /**
         * Có phải là element cha của group hay không
         */
        isGroupParent?: boolean;
        /**
         * Cho phép kéo thả element bình thường vào trong group
         * @default false
         */
        allowDrop?: boolean;
        /**
         * Page nào có thể sử dụng element này
         * @default all
         */
        pageApply?: PageApply;
        /**
         * Khi được bật chế độ này thì children sẽ không được in tại navigator nữa
         * và ở chế độ này thì cũng không thể add element khác vào trong nó
         */
        childrenHidden?: boolean;
        /**
         * Ẩn element tại navigator dựa vào điều kiện
         */
        hiddenCondition?: string;
        /**
         * Mỗi element sẽ có 1 thẻ bọc ngoài có thể ảnh hưởng tới cấu trúc
         * Ta có thể thay đổi tên thẻ đó
         * Chú ý chỉ áp dụng tại editor
         * @default "div"
         */
        wrapperTagName?: string;
        /**
         * Loại trừ các actions bao gồm: duplicate, delete, move, drag, copy, paste
         */
        excludeActions?: ExcludeAction[];
        /**
         * Loại trừ các actions tại preview bao gồm: duplicate, delete, move, drag, copy, paste
         */
        previewExcludeActions?: PreviewExcludeAction[];
        /**
         * Vô hiệu hoá quá trình biên dịch từ server
         */
        serverCompileDisabled?: boolean;
    }
    interface BlockChildrenElement {
        /**
         * Id của element tại page hiện tại
         */
        id: UniqueId;
        /**
         * Id từ bảng elements
         */
        elementId: UniqueId;
        /**
         * Tên của element
         */
        label: string;
        /**
         * Các settings của element phụ thuộc vào settings tại bảng elements
         */
        settings?: Settings;
        /**
         * Id của element cha
         */
        parent?: UniqueId;
        /**
         * Mảng các id của element con
         */
        children?: UniqueId[];
        /**
         * Chỉ định các element thuộc cùng nhóm với nhau
         */
        group?: string;
        /**
         * Có phải là element cha của group hay không
         */
        isGroupParent?: boolean;
        /**
         * Cho phép kéo thả element bình thường vào trong group
         * @default false
         */
        allowDrop?: boolean;
        /**
         * Khi được bật chế độ này thì children sẽ không được in tại navigator nữa
         * và ở chế độ này thì cũng không thể add element khác vào trong nó
         */
        childrenHidden?: boolean;
        /**
         * Ẩn element tại navigator dựa vào điều kiện
         */
        hiddenCondition?: string;
        /**
         * Mỗi element sẽ có 1 thẻ bọc ngoài có thể ảnh hưởng tới cấu trúc
         * Ta có thể thay đổi tên thẻ đó
         * Chú ý chỉ áp dụng tại editor
         * @default "div"
         */
        wrapperTagName?: string;
        /**
         * Loại trừ các actions bao gồm: duplicate, delete, move, drag
         */
        excludeActions?: ExcludeAction[];
        /**
         * Loại trừ các actions tại preview bao gồm: duplicate, delete, move, drag, copy, paste
         */
        previewExcludeActions?: PreviewExcludeAction[];
    }
    interface BlockElement extends Omit<DefaultElement, 'template'> {
        /**
         * Field này chứa tập hợp các wrapper element và element thường
         */
        type: 'block';
        /**
         * Trường này không cần tại block
         * Chỉ để lại cho đầy đủ
         */
        template?: string;
        /**
         * Đây là entities của block
         */
        entities: CurrentElementEntity.Elements;
        /**
         * Hình ảnh feature của block
         */
        featuredImage?: IImage;
        /**
         * Element này được tạo thủ công hay kéo thả ghép lại
         * Nếu là kéo thả ghép lại thì sẽ là true
         */
        isCustom?: boolean;
        /**
         * Block này có phải là block của admin hay không
         * Nếu là block của admin thì sẽ không cho phép người dùng xoá và chỉ cho phép người dùng xoá block của họ
         */
        isAdmin?: boolean;
        /**
         * Kích thước của frame block
         * Mục đích chỉ để hiển thị khi chỉnh sửa tại editor
         */
        frameWidth?: number;
        /**
         * Background của frame block
         * Mục đích chỉ để hiển thị khi chỉnh sửa tại editor
         */
        frameBackground?: string;
        /**
         * Có phải là extension hay không
         */
        isExtension?: boolean;
    }
    interface WrapperElement extends DefaultElement {
        /**
         * Loại element này cho phép chứa các element khác
         * Không chứa code liquid
         */
        type: 'wrapper';
        /**
         * Đây là file css của element
         */
        css?: string;
        /**
         * Đây là file js của element
         */
        js?: string;
        /**
         * Dự phòng cho trường hợp dữ liệu compile từ server chưa xong
         * UI có thể hiển thị fallback
         */
        fallback?: string;
        /**
         * Đồng bộ id của field space để có thể kéo thay đổi giá trị tại preview
         */
        spaceIdSync?: UniqueId;
        /**
         * Có phải là extension hay không
         */
        isExtension?: boolean;
    }
    interface DynamicElement extends DefaultElement {
        /**
         * Loại element này không cho phép chứa các element khác
         * Có thể chứa code liquid
         */
        type: 'element';
        /**
         * Đây là file css của element
         */
        css?: string;
        /**
         * Đây là file js của element
         */
        js?: string;
        /**
         * Dự phòng cho trường hợp dữ liệu compile từ server chưa xong
         * UI có thể hiển thị fallback
         */
        fallback?: string;
        /**
         * Đồng bộ id của field space để có thể kéo thay đổi giá trị tại preview
         */
        spaceIdSync?: UniqueId;
        /**
         * Có phải là extension hay không
         */
        isExtension?: boolean;
    }
    type Element = BlockElement | WrapperElement | DynamicElement;
    type Entities = Record<UniqueId, Element>;
    interface Data {
        /**
         * Mảng các id của element theo thứ tự
         */
        order: UniqueId[];
        /**
         * Các element của app cung cấp
         */
        entities: Entities;
    }
    interface Settings extends CurrentElementSettings {
    }
}
