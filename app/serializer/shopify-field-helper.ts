import type { CurrentElementEntity, ElementsEntity } from 'app/entities';
import { pick } from './pick';
import { pickSettings } from './pick-settings';

function getShopifyFieldEndpoint() {
  return {
    shopify_collection_picker: 'collections',
    shopify_product: 'products',
  };
}

export class ShopifyFieldHelper {
  private settingsTypes = Object.keys(getShopifyFieldEndpoint());

  getTypeOfEmptyValue(elements: CurrentElementEntity.Elements) {
    const settings = Object.values(elements).reduce((acc, element) => {
      if (!element.settings) {
        return acc;
      }

      const newSettings = pickSettings(element.settings, this.settingsTypes);

      return {
        ...acc,
        ...newSettings,
      };
    }, {} as ElementsEntity.Settings);

    return Object.keys(settings);
  }

  setSettings(elements: CurrentElementEntity.Elements, settings: Record<string, any>) {
    return Object.entries(elements).reduce((acc, [id, element]) => {
      if (!element.settings) {
        return acc;
      }

      const newSettings = pick(settings, Object.keys(element.settings));

      return {
        ...acc,
        [id]: {
          ...element,
          settings: {
            ...element.settings,
            ...newSettings,
          },
        },
      };
    }, {} as CurrentElementEntity.Elements);
  }
}

// Example:
// const elements: CurrentElementEntity.Elements = {
//   'comp-2-1-1-1-2-1': {
//     id: 'comp-2-1-1-1-2-1',
//     elementId: 'productTitle',
//     type: 'element',
//     icon: 'TitleMinor',
//     label: 'Product Title',
//     parent: 'col-2-1-1-1-2',
//     settings: {
//       fontSize: '30px',
//       $compile: false,
//       shopify_collection_picker: {},
//     },
//   },
// };

// const shopifyFieldHelper = new ShopifyFieldHelper();

// const type = shopifyFieldHelper.getTypeOfEmptyValue(elements);

// const newSettings = {
//   shopify_collection_picker: {
//     value: '123',
//   },
// };

// console.log(type, shopifyFieldHelper.setSettings(elements, newSettings));
