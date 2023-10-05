import { render } from '@testing-library/react';
import { PolarisTestProvider } from '@shopify/polaris';
import translations from '@shopify/polaris/locales/en.json';

/** @param {{ children: import("react").ReactElement }} args */
function ShopifyAppProvider({ children }) {
  return (
    <PolarisTestProvider i18n={translations}>{children}</PolarisTestProvider>
  );
}

/**
 *
 * @param {import("react").ReactElement} ui
 * @param {import("@testing-library/react").RenderOptions} [options]
 * @returns
 */
const shopifyRender = (ui, options) =>
  render(ui, { wrapper: ShopifyAppProvider, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { shopifyRender as render };