import type { CurrentElementEntity, Development, ElementsEntity, ShopifyHandleEntity } from 'app/entities';

const COLLECTION = 'collection-filter';

function hasSettings(settings: Development.Settings, type: Development.Settings[0]['type']) {
  return settings.some(setting => setting.type === type);
}

export function addLiquidAssign(
  template: string,
  element: CurrentElementEntity.Element,
  rootElements: ElementsEntity.Entities,
  handles?: ShopifyHandleEntity,
) {
  if (!handles) {
    return template;
  }

  const rootSettings = (rootElements[element.elementId]?.settings ?? []) as Development.Settings;

  if (hasSettings(rootSettings, 'product_picker') && handles.product) {
    const assignProduct = `{% assign product = all_products['${handles.product}'] %}`;
    return `\n${assignProduct}\n${template}`;
  }

  if ((hasSettings(rootSettings, 'collection_picker') || element.elementId === COLLECTION) && handles.collection) {
    const assignCollection = `{% assign collection = collections['${handles.collection}'] %}`;
    return `\n${assignCollection}\n${template}`;
  }

  if (hasSettings(rootSettings, 'article_picker') && handles.blog && handles.article) {
    const assignArticle = `{% assign article = articles['${handles.blog}/${handles.article}'] %}`;
    return `\n${assignArticle}\n${template}`;
  }

  if (hasSettings(rootSettings, 'blog_picker') && handles.blog) {
    const assignBlog = `{% assign blog = blogs['${handles.blog}'] %}`;
    return `\n${assignBlog}\n${template}`;
  }

  return template;
}
