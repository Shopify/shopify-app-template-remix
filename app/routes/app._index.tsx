import React from "react";
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
          options {
            id
            name
            position
          }
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
          options: [faker.commerce.productName()],
          variants: [{ price: Math.random() * 100 }],
        },
      },
    }
  );

  const responseJson = await response.json();

  return json({ product: responseJson.data.productCreate });
}

export default function Index() {
  const { state } = useNavigation();
  const { shop } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const isLoading = ["submitting", "loading"].includes(state);

  return (
    <Page title="App template for Remix">
      <VerticalStack gap="5">
        <Text variant="bodyMd" as="p">
          The links in the sidebar are defined in the layout for your app, in
          app/routes/app.tsx. They're an App Bridge component that you can set
          up to embed links into Shopify Admin.
        </Text>
        <Layout>
          <Layout.Section>
            <Card>
              <VerticalStack gap="5">
                <Text as="h2" variant="headingLg">
                  Get started querying data
                </Text>
                <Text as="p" variant="bodyMd">
                  Use a GraphQL query to generate products.
                </Text>
                <HorizontalStack align="space-between">
                  <Form method="post">
                    <Button loading={isLoading} submit primary>
                      Create product
                    </Button>
                  </Form>
                  {actionData?.product && (
                    <Button
                      onClick={() =>
                        window.open(`https://${shop}/admin/products`, "_blank")
                      }
                    >
                      Go to products list
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
                      <pre>{JSON.stringify(actionData.product, null, 2)}</pre>
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

// TODO: We need to explicitly catch errors with a boundary here because some embedded app features rely on non-200
// thrown responses (such as re-authentication requests or billing).
// See https://github.com/remix-run/remix/pull/6425
export function CatchBoundary() {
  return <h1>Error occurred.</h1>;
}

export const headers: HeadersFunction = ({ loaderHeaders, actionHeaders }) => {
  return new Headers([
    ...(actionHeaders ? Array.from(actionHeaders.entries()) : []),
    ...(loaderHeaders ? Array.from(loaderHeaders.entries()) : []),
  ]);
};
