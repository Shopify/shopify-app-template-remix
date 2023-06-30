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
          This page shows interface options while embedded in the Shopify Admin.
          For example, you can add links to your app's pages in the Admin side
          navigation using the <b>ui-nav-menu</b> component from{" "}
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
                  Use a GraphQL query to generate a product, and get JSON
                  output. To learn more about this mutation in the developer
                  documentation, refer to the{" "}
                  <Link
                    url="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
                    target="_blank"
                  >
                    productCreate mutation.
                  </Link>
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
                      url={`https://${shop}/admin/products/${productId}`}
                      target="_blank"
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
                      Try building our{" "}
                      <Link
                        url="https://shopify.dev/docs/apps/getting-started/build-app-example"
                        target="_blank"
                      >
                        QR code app
                      </Link>
                    </List.Item>
                    <List.Item>
                      Explore GraphQL with our{" "}
                      <Link
                        url="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
                        target="_blank"
                      >
                        GraphiQL app
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
