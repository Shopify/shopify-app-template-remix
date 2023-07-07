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
  const errors = loginErrorMessage(await shopify.login(request));
  const locale = await remixI18n.getLocale(request);

  return json({
    errors,
    polarisTranslations: require(`@shopify/polaris/locales/${locale}.json`),
  });
}

export async function action({ request }) {
  const errors = loginErrorMessage(await shopify.login(request));

  return json({
    errors,
  });
}

export default function Auth() {
  const { polarisTranslations } = useLoaderData();
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const errors = actionData?.errors || loaderData.errors;
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
                error={errors.shop}
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
