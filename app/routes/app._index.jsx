import { useEffect } from "react";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalStack,
  Box,
  Divider,
  Link,
  List,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return json({ shop: session.shop.replace(".myshopify.com", "") });
};

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
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
        input: {
          title: `${color} Snowboard`,
          variants: [{ price: Math.random() * 100 }],
        },
      },
    }
  );

  const responseJson = await response.json();

  return json({
    product: responseJson.data.productCreate.product,
  });
}

export default function Index() {
  const { state } = useNavigation();
  const { shop } = useLoaderData();
  const actionData = useActionData();

  const isLoading = ["submitting", "loading"].includes(state);

  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    ""
  );
  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId]);

  return (
    <Form method="post">
      <ui-title-bar title="Remix app template">
        {/* TODO Fix submission if this is how we want to do it */}
        <button variant="primary" type="submit">
          Generate a product
        </button>
      </ui-title-bar>
      <Page
        title="Remix app template"
        primaryAction={
          <Button primary submit loading={isLoading}>
            Generate a product
          </Button>
        }
      >
        <VerticalStack gap="5">
          <Layout>
            <Layout.Section>
              <Card>
                <VerticalStack gap="5">
                  <Text as="h2" variant="headingMd">
                    Congrats on creating a new Shopify app 🎉
                  </Text>
                  <Text variant="bodyMd" as="p">
                    This embedded app template uses{" "}
                    <Link
                      url="https://shopify.dev/docs/apps/tools/app-bridge"
                      target="_blank"
                    >
                      App Bridge
                    </Link>{" "}
                    interface examples like an additional page in the app nav,
                    as well as an{" "}
                    <Link
                      url="https://shopify.dev/docs/api/admin-graphql"
                      target="_blank"
                    >
                      Admin GraphQL
                    </Link>{" "}
                    mutation demo, to provide a starting point for app
                    development.
                  </Text>
                  <Text as="h2" variant="headingMd">
                    Get started with products
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Generate a product with GraphQL and get the JSON output for
                    that product. Learn more about the{" "}
                    <Link
                      url="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
                      target="_blank"
                    >
                      productCreate
                    </Link>{" "}
                    mutation in our API references.
                  </Text>
                  <HorizontalStack gap="5">
                    <Button loading={isLoading} submit>
                      Generate a product
                    </Button>
                    {actionData?.product && (
                      <Button
                        plain
                        url={`https://admin.shopify.com/store/${shop}/admin/products/${productId}`}
                        target="_blank"
                      >
                        View product
                      </Button>
                    )}
                  </HorizontalStack>
                  {actionData?.product && (
                    <Box
                      padding="4"
                      background="bg-subdued"
                      borderColor="border"
                      borderWidth="1"
                      borderRadius="2"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(actionData.product, null, 2)}
                        </code>
                      </pre>
                    </Box>
                  )}
                </VerticalStack>
              </Card>
            </Layout.Section>
            <Layout.Section secondary>
              <VerticalStack gap="5">
                <Card>
                  <VerticalStack gap="5">
                    <Text as="h2" variant="headingMd">
                      Resources
                    </Text>
                    <VerticalStack gap="2">
                      <HorizontalStack align="space-between">
                        <Text as="span" variant="bodyMd">
                          Framework
                        </Text>
                        <Link url="https://remix.run" target="_blank">
                          Remix
                        </Link>
                      </HorizontalStack>
                      <Divider />
                      <HorizontalStack align="space-between">
                        <Text as="span" variant="bodyMd">
                          Database
                        </Text>
                        <Link url="https://www.prisma.io/" target="_blank">
                          Prisma
                        </Link>
                      </HorizontalStack>
                      <Divider />
                      <HorizontalStack align="space-between">
                        <Text as="span" variant="bodyMd">
                          Interface
                        </Text>
                        <span>
                          <Link
                            url="https://polaris.shopify.com"
                            target="_blank"
                          >
                            Polaris
                          </Link>
                          {", "}
                          <Link
                            url="https://shopify.dev/docs/apps/tools/app-bridge"
                            target="_blank"
                          >
                            App Bridge
                          </Link>
                        </span>
                      </HorizontalStack>
                      <Divider />
                      <HorizontalStack align="space-between">
                        <Text as="span" variant="bodyMd">
                          API
                        </Text>
                        <Link
                          url="https://shopify.dev/docs/api/admin-graphql"
                          target="_blank"
                        >
                          GraphQL API
                        </Link>
                      </HorizontalStack>
                    </VerticalStack>
                  </VerticalStack>
                </Card>
                <Card>
                  <VerticalStack gap="5">
                    <Text as="h2" variant="headingMd">
                      Next steps
                    </Text>
                    <List>
                      <List.Item>
                        Build an{" "}
                        <Link
                          url="https://shopify.dev/docs/apps/getting-started/build-app-example"
                          target="_blank"
                        >
                          {" "}
                          example app
                        </Link>{" "}
                        to get started
                      </List.Item>
                      <List.Item>
                        Explore Shopify’s API with{" "}
                        <Link
                          url="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
                          target="_blank"
                        >
                          GraphiQL
                        </Link>
                      </List.Item>
                    </List>
                  </VerticalStack>
                </Card>
              </VerticalStack>
            </Layout.Section>
          </Layout>
        </VerticalStack>
      </Page>
    </Form>
  );
}
