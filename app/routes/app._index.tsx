import React from "react";
import { json } from "@remix-run/node";
import type { ActionArgs, LoaderArgs, HeadersFunction } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalStack,
  Box,
} from "@shopify/polaris";

import { shopify } from "../shopify.server";
import { useTranslation } from "react-i18next";

export const loader = async ({ request }: LoaderArgs) => {
  const { admin, session } = await shopify.authenticate.admin(request);

  return json(await admin.rest.resources.Product.count({ session }));
};

export async function action({ request }: ActionArgs) {
  const { admin, session } = await shopify.authenticate.admin(request);

  await Promise.all(
    [...Array(5).keys()].map(async (i) => {
      await admin.graphql(
        `#graphql
        mutation populateProduct($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
            }
          }
        }`,
        {
          variables: {
            input: {
              title: `${randomTitle()}`,
              variants: [{ price: randomPrice() }],
            },
          },
        }
      );
    })
  );

  return json(await admin.rest.resources.Product.count({ session }));
}

export default function Index() {
  const { state, formData } = useNavigation();
  const { t } = useTranslation();

  const isLoading =
    state === "loading" || formData?.get("action") === "create-products";

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
                <HorizontalStack>
                  <Button fullWidth={false} loading={isLoading}>
                    {t("App.Index.main.cta")}
                  </Button>
                </HorizontalStack>
                <Box
                  padding="4"
                  background="bg-subdued"
                  borderColor="border"
                  borderWidth="1"
                  borderRadius="2"
                ></Box>
              </VerticalStack>
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card></Card>
          </Layout.Section>
        </Layout>
      </VerticalStack>
    </Page>
  );
}

function randomTitle() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

function randomPrice() {
  return Math.round((Math.random() * 10 + Number.EPSILON) * 100) / 100;
}

const ADJECTIVES = [
  "autumn",
  "hidden",
  "bitter",
  "misty",
  "silent",
  "empty",
  "dry",
  "dark",
  "summer",
  "icy",
  "delicate",
  "quiet",
  "white",
  "cool",
  "spring",
  "winter",
  "patient",
  "twilight",
  "dawn",
  "crimson",
  "wispy",
  "weathered",
  "blue",
  "billowing",
  "broken",
  "cold",
  "damp",
  "falling",
  "frosty",
  "green",
  "long",
];

const NOUNS = [
  "waterfall",
  "river",
  "breeze",
  "moon",
  "rain",
  "wind",
  "sea",
  "morning",
  "snow",
  "lake",
  "sunset",
  "pine",
  "shadow",
  "leaf",
  "dawn",
  "glitter",
  "forest",
  "hill",
  "cloud",
  "meadow",
  "sun",
  "glade",
  "bird",
  "brook",
  "butterfly",
  "bush",
  "dew",
  "dust",
  "field",
  "fire",
  "flower",
];

export function CatchBoundary() {
  return <h1>Error occurred.</h1>;
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return loaderHeaders;
};
