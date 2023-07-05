import React, { useEffect } from "react";
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
import { faker } from "@faker-js/faker";

import { shopify } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await shopify.authenticate.admin(request);

  return json({ shop: session.shop.replace(".myshopify.com", "") });
};

export async function action({ request }) {
  const { admin } = await shopify.authenticate.admin(request);

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
          title: faker.commerce.productName(),
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
      window?.shopify.toast.show("Product created");
    }
  }, [productId]);

  return (
    <Page title="App template for Remix">
      <VerticalStack gap="5">
        <Text variant="bodyMd" as="p">
          This page shows interface examples while creating an embedded app in
          the Shopify Admin. For example, you can add links to your app's pages
          in the App nav using the <code>ui-nav-menu</code> component from{" "}
          <Link
            url="https://shopify.dev/docs/apps/tools/app-bridge"
            target="_blank"
          >
            App Bridge
          </Link>{" "}
          in the
          <b>/app/routes/app.tsx</b> layout file.
        </Text>
        <Layout>
          <Layout.Section>
            <Card>
              <VerticalStack gap="5">
                <Text as="h2" variant="headingLg">
                  Congrats on creating a new Shopify app 🎉
                </Text>
                <Text as="h2" variant="headingMd">
                  Get started with products
                </Text>
                <Text as="p" variant="bodyMd">
                  The following example uses GraphQL to generate a product and
                  get the JSON output for that product. Visit our API references
                  to learn more about the{" "}
                  <Link
                    url="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
                    target="_blank"
                  >
                    productCreate mutation
                  </Link>
                  .
                </Text>
                <HorizontalStack gap="5">
                  <Form method="post">
                    <Button loading={isLoading} submit>
                      Generate a product
                    </Button>
                  </Form>
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
                      <code>{JSON.stringify(actionData.product, null, 2)}</code>
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
                        <Link url="https://polaris.shopify.com" target="_blank">
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
                    <Divider />
                    <HorizontalStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Internationalization
                      </Text>
                      <Link
                        url="https://github.com/sergiodxa/remix-i18next"
                        target="_blank"
                      >
                        remix-i18next
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
  );
}
