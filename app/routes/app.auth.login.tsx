import React, { useState } from "react";
import type { LoaderArgs } from "@remix-run/node";
import { json, type ActionArgs } from "@remix-run/node";

import {
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { Form, useActionData } from "@remix-run/react";

import { shopify } from "../shopify.server";

export async function loader({ request }: LoaderArgs) {
  const shop = new URL(request.url).searchParams.get("shop");
  if (shop) {
    const errors = await shopify.login(request);

    return json(errors);
  }

  return null;
}

export async function action({ request }: ActionArgs) {
  const errors = await shopify.login(request);

  return json(errors);
}

export default function Auth() {
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");

  return (
    <Page>
      <Card>
        <Form method="post">
          <FormLayout>
            <Text variant="headingMd" as="h2">
              Login
            </Text>
            <TextField
              type="text"
              name="shop"
              label="Shop domain"
              helpText="e.g: my-shop-domain.myshopify.com"
              value={shop}
              onChange={setShop}
              autoComplete="on"
              error={actionData?.errors.shop}
            />
            <Button submit primary>
              Submit
            </Button>
          </FormLayout>
        </Form>
      </Card>
    </Page>
  );
}
