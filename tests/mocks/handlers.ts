import { graphql, http, HttpResponse } from "msw";
import { API_VERSION, SHOP } from "tests/constants";

const graphqlApiUrl = `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`;

const shopify = graphql.link(graphqlApiUrl);

export const handlers = [
  http.post(`https://${SHOP}/admin/oauth/access_token`, () => {
    return HttpResponse.json({ access_token: "test" });
  }),
  shopify.mutation("populateProduct", ({ variables }) => {
    const {
      product: { title },
    } = variables;
    return HttpResponse.json({
      data: {
        productCreate: {
          product: {
            id: "gid://shopify/Product/1234567890",
            title: title,
            description: "This is a test product",
            handle: "test-product",
            status: "ACTIVE",
            variants: {
              edges: [
                {
                  node: {
                    id: "gid://shopify/ProductVariant/1234567890",
                    price: "$0.00",
                    barcode: "",
                    createdAt: new Date().toDateString(),
                  },
                },
              ],
            },
          },
          userErrors: [],
        },
      },
    });
  }),
  shopify.mutation("shopifyRemixTemplateUpdateVariant", ({ variables }) => {
    const { variants } = variables;
    const { id, price } = variants[0];
    return HttpResponse.json({
      data: {
        productVariantsBulkUpdate: {
          productVariants: {
            edges: [
              {
                node: {
                  id,
                  price: price,
                  barcode: "",
                  createdAt: new Date().toDateString(),
                },
              },
            ],
          },

          userErrors: [],
        },
      },
    });
  }),
];
