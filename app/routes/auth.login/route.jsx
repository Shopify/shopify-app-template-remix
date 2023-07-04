import React, { useState } from "react";
import { json } from "@remix-run/node";

import {
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
  AppProvider as PolarisAppProvider,
} from "@shopify/polaris";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";

import remixI18n from "../../i18n/i18next.server";
import { shopify } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  const locale = await remixI18n.getLocale(request);
  const shop = new URL(request.url).searchParams.get("shop");
  const errors = shop ? loginErrorMessage(await shopify.login(request)) : {};

  return json({
    errors,
    polarisTranslations: require(`@shopify/polaris/locales/${locale}.json`),
  });
}

export async function action({ request }) {
  const errors = await shopify.login(request);

  return json({
    errors: loginErrorMessage(errors),
  });
}

export default function Auth() {
  const { polarisTranslations } = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");

  return (
    <PolarisAppProvider i18n={polarisTranslations}>
      <Page>
        <Card>
          <Form method="post">
            <FormLayout>
              <Text variant="headingMd" as="h2">
                Log in
              </Text>
              <TextField
                type="text"
                name="shop"
                label="Shop domain"
                helpText="e.g. example.myshopify.com"
                value={shop}
                onChange={setShop}
                autoComplete="on"
                error={actionData?.errors.shop}
              />
              <Button submit primary>
                Log in
              </Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}
