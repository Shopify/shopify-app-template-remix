import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
  const fetcher = useFetcher();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      // Show toast using App Bridge
      if (window.shopify && window.shopify.toast) {
        window.shopify.toast.show("Product created");
      }
    }
  }, [productId]);

  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  useEffect(() => {
    // Set up event handlers for web components
    const setupEventHandlers = () => {
      const generateButton = document.getElementById('generate-product-btn');
      const titleBarButton = document.querySelector('ui-title-bar button[variant="primary"]');
      
      if (generateButton) {
        generateButton.onclick = generateProduct;
      }
      
      if (titleBarButton) {
        titleBarButton.onclick = generateProduct;
      }
    };

    // Setup handlers after component mounts
    const timer = setTimeout(setupEventHandlers, 100);
    return () => clearTimeout(timer);
  }, [fetcher.state]);

  return (
    <>
      <script src="https://cdn.shopify.com/shopifycloud/app-bridge-ui-experimental.js"></script>
      <s-page>
        <ui-title-bar title="Remix app template">
          <button variant="primary" disabled={isLoading}>
            Generate a product
          </button>
        </ui-title-bar>
        
          <s-section>
              <s-stack gap="large">
                <s-stack gap="small-200">
                  <s-heading>
                    Congrats on creating a new Shopify app 🎉
                  </s-heading>
                  <s-paragraph>
                    This embedded app template uses{" "}
                    <s-link
                      href="https://shopify.dev/docs/apps/tools/app-bridge"
                      target="_blank"
                    >
                      App Bridge
                    </s-link>{" "}
                    interface examples like an{" "}
                    <s-link href="/app/additional">
                      additional page in the app nav
                    </s-link>
                    , as well as an{" "}
                    <s-link
                      href="https://shopify.dev/docs/api/admin-graphql"
                      target="_blank"
                    >
                      Admin GraphQL
                    </s-link>{" "}
                    mutation demo, to provide a starting point for app
                    development.
                  </s-paragraph>
                </s-stack>
                
                <s-stack gap="small-200">
                  <s-heading>Get started with products</s-heading>
                  <s-paragraph>
                    Generate a product with GraphQL and get the JSON output for
                    that product. Learn more about the{" "}
                    <s-link
                      href="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
                      target="_blank"
                    >
                      productCreate
                    </s-link>{" "}
                    mutation in our API references.
                  </s-paragraph>
                </s-stack>
                
                <s-stack direction="inline" gap="small-300">
                  <s-button 
                    id="generate-product-btn"
                    variant="secondary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Generating..." : "Generate a product"}
                  </s-button>
                  {fetcher.data?.product && productId && (
                    <s-button
                      href={`shopify:admin/products/${productId}`}
                      target="_blank"
                      variant="tertiary"
                    >
                      View product
                    </s-button>
                  )}
                </s-stack>
                
                {fetcher.data?.product && (
                  <s-stack gap="base">
                    <s-heading>productCreate mutation</s-heading>
                    <s-box
                      padding="base"
                      background="subdued"
                      border="base"
                      borderRadius="base"
                    >
                      <pre style={{ margin: 0, overflow: "auto" }}>
                        <code>
                          {JSON.stringify(fetcher.data.product, null, 2)}
                        </code>
                      </pre>
                    </s-box>
                    
                    <s-heading>productVariantsBulkUpdate mutation</s-heading>
                    <s-box
                      padding="base"
                      background="subdued"
                      border="base"
                      borderRadius="base"
                    >
                      <pre style={{ margin: 0, overflow: "auto" }}>
                        <code>
                          {JSON.stringify(fetcher.data.variant, null, 2)}
                        </code>
                      </pre>
                    </s-box>
                  </s-stack>
                )}
              </s-stack>
          </s-section>
          
          <s-section slot="aside">
                <s-stack gap="small-200">
                  <s-heading>App template specs</s-heading>
                  <s-stack gap="small-200">
                    <s-stack direction="inline" justifyContent="space-between">
                      <s-text>Framework</s-text>
                      <s-link
                        href="https://remix.run"
                        target="_blank"
                      >
                        Remix
                      </s-link>
                    </s-stack>
                    <s-stack direction="inline" justifyContent="space-between">
                      <s-text>Database</s-text>
                      <s-link
                        href="https://www.prisma.io/"
                        target="_blank"
                      >
                        Prisma
                      </s-link>
                    </s-stack>
                    <s-stack direction="inline" justifyContent="space-between">
                      <s-text>Interface</s-text>
                      <s-stack direction="inline" gap="none">
                        <s-link
                          href="https://polaris.shopify.com"
                          target="_blank"
                        >
                          Polaris
                        </s-link>
                        <s-text>,&nbsp;</s-text>
                        <s-link
                          href="https://shopify.dev/docs/apps/tools/app-bridge"
                          target="_blank"
                        >
                          App Bridge
                        </s-link>
                      </s-stack>
                    </s-stack>
                    <s-stack direction="inline" justifyContent="space-between">
                      <s-text>API</s-text>
                      <s-link
                        href="https://shopify.dev/docs/api/admin-graphql"
                        target="_blank"
                      >
                        GraphQL API
                      </s-link>
                    </s-stack>
                  </s-stack>
            </s-stack>
          </s-section>
          <s-section slot="aside">
                <s-stack gap="small-200">
                  <s-heading>Next steps</s-heading>
                  <s-unordered-list>
                    <s-list-item>
                      <s-stack direction="inline" gap="none">
                        <s-text>Build an&nbsp;</s-text>
                        <s-link
                          href="https://shopify.dev/docs/apps/getting-started/build-app-example"
                          target="_blank"
                        >
                          example app
                        </s-link>
                        <s-text>&nbsp;to get started</s-text>
                      </s-stack>
                    </s-list-item>
                    <s-list-item>
                      <s-stack direction="inline" gap="none">
                        <s-text>Explore Shopify's API with&nbsp;</s-text>
                        <s-link
                          href="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
                          target="_blank"
                        >
                          GraphiQL
                        </s-link>
                      </s-stack>
                    </s-list-item>
                  </s-unordered-list>
                </s-stack>
              </s-section>
        </s-page>   
    </>
  );
}
