import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

import { authenticate } from "~/shopify.server";
import db from "~/db.server";
import { Text } from "@shopify/polaris";
import { useActionData, useLoaderData } from "@remix-run/react";
import { AppProxy } from "@shopify/shopify-app-remix/react";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ appUrl: process.env.SHOPIFY_APP_URL });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.public.appProxy(request);

  const formData = await request.formData();
  const productId = formData.get("product")!.toString();
  const review = formData.get("review")!.toString();
  const id = formData.get("id")?.toString();

  const response = await admin?.graphql(
    `#graphql
    query test($productId: ID!) {
      product(id: $productId) {
        id
      }
    }`,
    { variables: { productId: `gid://shopify/Product/${productId}` } },
  );
  const data = await response?.json();

  if (!data?.data?.product?.id) {
    return json(
      {
        message: "Invalid product",
        review: "Review wasn't created :(",
        id: null,
        productId,
      },
      { status: 400 },
    );
  }

  const newId = id || Date.now().toString();
  await db.review.upsert({
    create: {
      id: newId,
      productId: data.data.product.id,
      review,
    },
    update: {
      review,
    },
    where: {
      id: newId,
    },
  });

  return json({ message: "Lookin' good", review, id: newId, productId });
};

export default function Review() {
  const { appUrl } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const [dataState] = useState(data);

  const handleClick = () => {
    alert(data?.review);
  };

  return (
    <AppProxy appUrl={appUrl!}>
      <Text as="h1" variant="headingLg">
        Review result
      </Text>

      <Text as="p">{data?.message}</Text>

      <button onClick={handleClick}>Show review</button>

      <AppProxy.Link to="/apps/proxy">Back to store</AppProxy.Link>

      {dataState?.id && (
        <AppProxy.Form method="post" action="/apps/proxy/review">
          <input type="hidden" name="product" value={dataState.productId} />
          <input type="hidden" name="id" value={dataState.id} />

          <label>
            Review:
            <input type="text" name="review" defaultValue={dataState.review} />
          </label>

          <input type="submit" value="Update review" />
        </AppProxy.Form>
      )}
    </AppProxy>
  );
}
