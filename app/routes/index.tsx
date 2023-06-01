import React from "react";
import { ActionArgs, LoaderArgs, json } from "@remix-run/node";
import type { HeadersFunction } from "@remix-run/node"; // or cloudflare/deno
import { useActionData, useLoaderData, useTransition } from "@remix-run/react";

import { shopify } from "../shopify.server";
import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  HorizontalStack,
  Link,
  Heading,
} from "@shopify/polaris";
import { ProductsCard } from "../components/ProductsCard.js";
import { ListProductsCard } from "../components/ListProductsCard";
// TODO figure out why this shows as an error in vscode only
// @ts-ignore
import { useSubmit } from "@remix-run/react";

export const loader = async ({ request }: LoaderArgs) => {
  const { admin, session } = await shopify.authenticate.admin(request);

  return json(await admin.rest.Product.count({ session }));
};

export async function action({ request }: ActionArgs) {
  const { admin } = await shopify.authenticate.admin(request);
  const action = (await request.formData()).get("action");
  console.log("~ACTION~", action);

  switch (action) {
    case "create-products":
      await Promise.all(
        [...Array(5).keys()].map(async i => {
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

    case "list-products":
      const res = await admin.graphql.query({
        data: {
          query: `#graphql
            query getProducts {
              products(first: 100) {
                edges {
                  node {
                    id
                    title
                    handle
                  }
                }
              }
            }
          `,
        },
      });

      return json(res.body);

    default:
      console.log("NO ACTION");
      return null;
  }
}

export default function Index() {
  const data = useLoaderData();
  const actionData = useActionData();
  const transition = useTransition();
  const submit = useSubmit();

  console.log("data", actionData, "|||");

  function handlePopulateProducts() {
    submit({ action: "create-products" }, { replace: true, method: "POST" });
  }

  const handleProductList = () => {
    submit({ action: "list-products" }, { replace: true, method: "POST" });
  };

  const populatingProducts =
    transition.state == "submitting" &&
    transition.submission.formData.get("action") == "create-products";

  const fetchingProductList =
    transition.state == "submitting" &&
    transition.submission.formData.get("action") == "list-products";

  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <ProductsCard
            count={data?.count}
            handlePopulate={handlePopulateProducts}
            populating={populatingProducts}
          />
          <ListProductsCard
            loading={fetchingProductList}
            handleList={handleProductList}
            products={actionData?.data?.products?.edges}
          />
        </Layout.Section>
        <Layout.Section>
          <HorizontalStack align="center">
            <Link url="/info">Click me to go to /info</Link>
          </HorizontalStack>
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
