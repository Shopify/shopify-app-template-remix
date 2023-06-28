import React, { useEffect } from "react";
import { json } from "@remix-run/node";
import type { ActionArgs, LoaderArgs, HeadersFunction } from "@remix-run/node";
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

export const loader = async ({ request }: LoaderArgs) => {
  const { session } = await shopify.authenticate.admin(request);

  return json({ shop: session.shop });
};

export async function action({ request }: ActionArgs) {
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
  const { shop } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const isLoading = ["submitting", "loading"].includes(state);

  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    ""
  );
  useEffect(() => {
    if (productId) {
      (window as unknown as any)?.shopify.toast.show("Product created");
    }
  }, [productId]);

  return (
    <Page title="App template for Remix">
      <VerticalStack gap="5">
        <Text variant="bodyMd" as="p">
          Congratulations on creating a new Shopify app! This page gives you a
          quick tour of some of the things you can do while embedded in the
          Shopify Admin.
        </Text>
        <Text variant="bodyMd" as="p">
          For example, you can add links to your app's pages in the Admin
          sidebar using the <b>ui-nav-menu</b> component from{" "}
          <Link
            onClick={() =>
              window.open(
                "https://shopify.dev/docs/apps/tools/app-bridge",
                "_blank"
              )
            }
          >
            App Bridge
          </Link>{" "}
          in the <b>/app/routes/app.tsx</b> layout file.
        </Text>
        <Layout>
          <Layout.Section>
            <Card>
              <VerticalStack gap="5">
                <Text as="h2" variant="headingLg">
                  Get started querying data
                </Text>
                <Text as="p" variant="bodyMd">
                  Use a GraphQL mutation to generate products.
                </Text>
                <HorizontalStack gap="5">
                  <Form method="post">
                    <Button loading={isLoading} submit primary>
                      Create product
                    </Button>
                  </Form>
                  {actionData?.product && (
                    <Button
                      plain
                      onClick={() => {
                        window.open(
                          `https://${shop}/admin/products/${productId}`,
                          "_blank"
                        );
                      }}
                    >
                      Go to product
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
                    <code>
                      <pre style={{ margin: 0 }}>
                        {JSON.stringify(actionData.product, null, 2)}
                      </pre>
                    </code>
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
                      <Link
                        onClick={() =>
                          window.open("https://remix.run", "_blank")
                        }
                      >
                        Remix
                      </Link>
                    </HorizontalStack>
                    <Divider />
                    <HorizontalStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Database
                      </Text>
                      <Link
                        onClick={() =>
                          window.open("https://www.prisma.io/", "_blank")
                        }
                      >
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
                          onClick={() =>
                            window.open(
                              "https://polaris.shopify.com/",
                              "_blank"
                            )
                          }
                        >
                          Polaris
                        </Link>
                        {", "}
                        <Link
                          onClick={() =>
                            window.open(
                              "https://shopify.dev/docs/apps/tools/app-bridge",
                              "_blank"
                            )
                          }
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
                        onClick={() =>
                          window.open(
                            "https://shopify.dev/docs/api/admin-graphql",
                            "_blank"
                          )
                        }
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
                        onClick={() =>
                          window.open(
                            "https://github.com/sergiodxa/remix-i18next",
                            "_blank"
                          )
                        }
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
                    Learn more about GraphQL
                  </Text>
                  <List>
                    <List.Item>
                      Explore GraphQL with our{" "}
                      <Link
                        onClick={() =>
                          window.open(
                            "https://shopify.dev/docs/apps/tools/graphiql-admin-api",
                            "_blank"
                          )
                        }
                      >
                        GraphiQL app
                      </Link>
                    </List.Item>
                    <List.Item>
                      View the{" "}
                      <Link
                        onClick={() =>
                          window.open(
                            "https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate",
                            "_blank"
                          )
                        }
                      >
                        productCreate mutation
                      </Link>{" "}
                      in our API references
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

export function CatchBoundary() {
  return <h1>Error occurred.</h1>;
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return loaderHeaders;
};
