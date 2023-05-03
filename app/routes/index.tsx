import { json } from "@remix-run/node";
import { useLoaderData, useTransition } from "@remix-run/react";
import { authenticator } from "../shopify/authenticator.server.js";
import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
} from "@shopify/polaris";
import { ProductsCard } from "../components/ProductsCard.jsx";
import trophyImage from "../assets/home-trophy.png";
import { useSubmit } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { session, api } = await authenticator.authenticate(
    "shopify-app",
    request
  );
  return json({});
  // const result = await admin.fetch("/products/count.json");
  // return json(result);
};

export async function action({ request }) {
  await authenticator.authenticate("shopify-app", request);
  // await Promise.all(
  //   [...Array(5).keys()].map(async (i) => {
  //     await admin.mutate(
  //       `#graphql
  //   mutation populateProduct($input: ProductInput!) {
  //     productCreate(input: $input) {
  //       product {
  //         id
  //       }
  //     }
  //   }
  //   `,
  //       {
  //         input: {
  //           title: `${randomTitle()}`,
  //           variants: [{price: randomPrice()}],
  //         },
  //       },
  //     )
  //   }),
  // )
  // const result = await admin.fetch('/products/count.json')
  return json({});
}

export default function Index() {
  const data = useLoaderData();
  const transition = useTransition();
  const submit = useSubmit();

  function handlePopulateProducts(event) {
    event.preventDefault();
    submit({ action: "create-products" }, { replace: true, method: "POST" });
  }

  const populatingProducts =
    transition.state == "submitting" &&
    transition.submission.formData.get("action") == "create-products";

  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <img src="https://media.tenor.com/WuOwfnsLcfYAAAAC/star-wars-obi-wan-kenobi.gif" />
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
