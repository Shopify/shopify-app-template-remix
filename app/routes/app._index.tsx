import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { shop } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const isLoading = ["submitting", "loading"].includes(state);

  return (
    <Page title={t("App.Index.title")}>
      <VerticalStack gap="5">
        <Text variant="bodyMd" as="p">
          {t("App.Index.intro")}
        </Text>
        <Layout>
          <Layout.Section>
            <Card>
              <VerticalStack gap="5">
                <Text as="h2" variant="headingLg">
                  {t("App.Index.main.title")}
                </Text>
                <Text as="p" variant="bodyMd">
                  {t("App.Index.main.intro")}
                </Text>
                <HorizontalStack align="space-between">
                  <Form method="post">
                    <Button loading={isLoading} submit primary>
                      {t("App.Index.main.cta.create")}
                    </Button>
                  </Form>
                  {actionData?.product && (
                    <Button
                      onClick={() =>
                        window.open(`https://${shop}/admin/products`, "_blank")
                      }
                    >
                      {t("App.Index.main.cta.view")}
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
                    {t("App.Index.secondary.title")}
                  </Text>
                  <VerticalStack gap="2">
                    <HorizontalStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        {t("App.Index.secondary.links.framework.text")}
                      </Text>
                      <Link
                        onClick={() =>
                          window.open("https://remix.run", "_blank")
                        }
                      >
                        {t("App.Index.secondary.links.framework.link")}
                      </Link>
                    </HorizontalStack>
                    <Divider />
                    <HorizontalStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        {t("App.Index.secondary.links.database.text")}
                      </Text>
                      <Link
                        onClick={() =>
                          window.open("https://www.prisma.io/", "_blank")
                        }
                      >
                        {t("App.Index.secondary.links.database.link")}
                      </Link>
                    </HorizontalStack>
                    <Divider />
                    <HorizontalStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        {t("App.Index.secondary.links.interface.text")}
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
                          {t("App.Index.secondary.links.interface.link1")}
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
                          {t("App.Index.secondary.links.interface.link2")}
                        </Link>
                      </span>
                    </HorizontalStack>
                    <Divider />
                    <HorizontalStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        {t("App.Index.secondary.links.api.text")}
                      </Text>
                      <Link
                        onClick={() =>
                          window.open(
                            "https://shopify.dev/docs/api/admin-graphql",
                            "_blank"
                          )
                        }
                      >
                        {t("App.Index.secondary.links.api.link")}
                      </Link>
                    </HorizontalStack>
                    <Divider />
                    <HorizontalStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        {t("App.Index.secondary.links.i18n.text")}
                      </Text>
                      <Link
                        onClick={() =>
                          window.open("https://www.i18next.com", "_blank")
                        }
                      >
                        {t("App.Index.secondary.links.i18n.link")}
                      </Link>
                    </HorizontalStack>
                  </VerticalStack>
                </VerticalStack>
              </Card>
              <Card>
                <VerticalStack gap="5">
                  <Text as="h2" variant="headingMd">
                    {t("App.Index.other.title")}
                  </Text>
                  <List>
                    <List.Item>
                      {t("App.Index.other.explore", {
                        link: (
                          <Link
                            onClick={() =>
                              window.open(
                                "https://shopify.dev/docs/apps/tools/graphiql-admin-api",
                                "_blank"
                              )
                            }
                          >
                            {t("App.Index.other.exploreLink")}
                          </Link>
                        ),
                      })}
                    </List.Item>
                    <List.Item>
                      {t("App.Index.other.mutation", {
                        link: (
                          <Link
                            onClick={() =>
                              window.open(
                                "https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate",
                                "_blank"
                              )
                            }
                          >
                            {t("App.Index.other.mutationLink")}
                          </Link>
                        ),
                      })}
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
