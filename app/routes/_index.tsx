import React from "react";
import { json } from "@remix-run/node";
import type { ActionArgs, LoaderArgs, HeadersFunction } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Image,
  Link,
  Text,
  VerticalStack,
  AlphaCard,
  Grid,
} from "@shopify/polaris";

import { shopifyServer } from "../shopify.server";
import { ProductsCard } from "../components/ProductsCard.jsx";
// eslint-disable-next-line no-warning-comments
// TODO figure out why this shows as an error in vscode only
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import trophyImage from "../assets/home-trophy.png";

export const loader = async ({ request }: LoaderArgs) => {
  const { admin, session } = await shopifyServer.authenticate.admin(request);

  return json(await admin.rest.Product.count({ session }));
};

export async function action({ request }: ActionArgs) {
  const { admin, session } = await shopifyServer.authenticate.admin(request);

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

  return json(await admin.rest.Product.count({ session }));
}

export default function Index() {
  const { count } = useLoaderData();
  const { state, formData } = useNavigation();

  const isLoading =
    state === "loading" || formData?.get("action") === "create-products";

  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <AlphaCard>
            <VerticalStack gap="5">
              <Text variant="headingMd" as="h2">
                Nice work on building a Shopify app 🎉
              </Text>
              <Grid columns={{ sm: 3 }}>
                <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 9, xl: 9 }}>
                  <VerticalStack gap="5">
                    <Text variant="bodyMd" as="p">
                      Your app is ready to explore! It contains everything you
                      need to get started including the{" "}
                      <Link url="https://polaris.shopify.com/" external>
                        Polaris design system
                      </Link>
                      ,{" "}
                      <Link
                        url="https://shopify.dev/api/admin-graphql"
                        external
                      >
                        Shopify Admin API
                      </Link>
                      , and{" "}
                      <Link
                        url="https://shopify.dev/apps/tools/app-bridge"
                        external
                      >
                        App Bridge
                      </Link>{" "}
                      UI library and components.
                    </Text>

                    <Text variant="bodyMd" as="p">
                      Ready to go? Start populating your app with some sample
                      products to view and test in your store.{" "}
                    </Text>

                    <Text variant="bodyMd" as="p">
                      Learn more about building out your app in{" "}
                      <Link
                        url="https://shopify.dev/apps/getting-started/add-functionality"
                        external
                      >
                        this Shopify tutorial
                      </Link>{" "}
                      📚{" "}
                    </Text>
                  </VerticalStack>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 2, sm: 2, md: 2, lg: 3, xl: 3 }}>
                  <Image
                    source={trophyImage}
                    alt="Nice work on building a Shopify app"
                    width={120}
                  />
                </Grid.Cell>
              </Grid>
            </VerticalStack>
          </AlphaCard>
        </Layout.Section>
        <Layout.Section>
          <ProductsCard count={count} loading={isLoading} />
        </Layout.Section>
      </Layout>
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
