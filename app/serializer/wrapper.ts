import { WRAPPER } from './consts';

export function wrapperStart(forShopify: boolean, id: string) {
  return forShopify ? '' : `<${WRAPPER} data-id="${id}">`;
}

export function wrapperEnd(forShopify: boolean) {
  return forShopify ? '' : `</${WRAPPER}>`;
}
