import React from "react";
import { ActionArgs, LoaderArgs, json } from "@remix-run/node";
import type { HeadersFunction } from "@remix-run/node"; // or cloudflare/deno
import { useLoaderData, useTransition } from "@remix-run/react";

import { shopify } from "../shopify.server";
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
import { ProductsCard } from "../components/ProductsCard.jsx";
// TODO figure out why this shows as an error in vscode only
// @ts-ignore
import trophyImage from "../assets/home-trophy.png";
import { useSubmit } from "@remix-run/react";

export const loader = async ({ request }: LoaderArgs) => {
  const { admin, session } = await shopify.authenticate.admin(request);

  return json(await admin.rest.Product.count({ session }));
};

export async function action({ request }: ActionArgs) {
  const { admin } = await shopify.authenticate.admin(request);

  await Promise.all(
    [...Array(5).keys()].map(async (i) => {
      await admin.graphql.query({
        data: {
          query: `#graphql
            mutation populateProduct($input: ProductInput!) {
              productCreate(input: $input) {
                product {
                  id
                }
              }
            }
          `,
          variables: {
            input: {
              title: `${randomTitle()}`,
              variants: [{ price: randomPrice() }],
            },
          },
        },
      });
    })
  );

  const result = await admin.rest.get({ path: "/products/count.json" });

  // TODO: Returning the parsed body as a string/object might be confusing for Remix users. We should consider returning
  // the body as a stream, or renaming it to something that indicates it's a string.
  // https://github.com/Shopify/shopify-app-template-remix/issues/55
  return json(result.body);
}

export default function Index() {
  const data = useLoaderData();
  const transition = useTransition();
  const submit = useSubmit();

  function handlePopulateProducts() {
    submit({ action: "create-products" }, { replace: true, method: "POST" });
  }

  const populatingProducts =
    transition.state == "submitting" &&
    transition.submission.formData.get("action") == "create-products";

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
          <ProductsCard
            count={data?.count}
            handlePopulate={handlePopulateProducts}
            populating={populatingProducts}
          />
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
