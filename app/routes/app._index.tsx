import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Page, Layout, Card, BlockStack, Text } from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const reviews = await db.review.findMany({
    orderBy: { id: "desc" },
    take: 10,
  });

  return json({ reviews });
};

export default function Index() {
  const { reviews } = useLoaderData<typeof loader>();

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="h1" variant="headingLg">
                Recent reviews
              </Text>

              {reviews.map((review) => (
                <div key={review.id}>
                  <br />
                  <Text as="p">
                    {review.productId}: {review.review}
                  </Text>
                </div>
              ))}
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
