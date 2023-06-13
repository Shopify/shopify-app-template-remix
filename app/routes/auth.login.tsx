import React, { useState } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { shopify } from "../shopify.server";
import {
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { Form, useLocation } from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
  return shopify.authenticate.admin(request);
}

export async function action({ request }: ActionArgs) {
  return shopify.authenticate.admin(request);
}

export default function Auth() {
  const [shop, setShop] = useState("");
  const { pathname } = useLocation();

  return (
    <Page>
      <Card>
        <Form method="post" action={pathname}>
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
