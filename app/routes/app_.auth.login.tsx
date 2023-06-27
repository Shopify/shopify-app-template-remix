import React, { useState } from "react";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json, type ActionArgs } from "@remix-run/node";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";

import {
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

import { useTranslation } from "react-i18next";
import remixI18n from "../i18n/i18next.server";

import { shopify } from "../shopify.server";
import { loginErrorMessage } from "../i18n/helpers.server";

import polarisStyles from "@shopify/polaris/build/esm/styles.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles },
];

export async function loader({ request }: LoaderArgs) {
  const shop = new URL(request.url).searchParams.get("shop");
  const locale = await remixI18n.getLocale(request);
  const polarisTranslations = require(`@shopify/polaris/locales/${locale}.json`);

  if (shop) {
    const errors = await shopify.login(request);

    return json({ errors: loginErrorMessage(errors), polarisTranslations });
  }

  return json({
    polarisTranslations: require(`@shopify/polaris/locales/${locale}.json`),
  });
}

export async function action({ request }: ActionArgs) {
  const errors = await shopify.login(request);

  return json({
    errors: loginErrorMessage(errors),
  });
}

export default function Auth() {
  const { polarisTranslations } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const { t } = useTranslation();

  return (
    <PolarisAppProvider i18n={polarisTranslations}>
      <Page>
        <Card>
          <Form method="post">
            <FormLayout>
              <Text variant="headingMd" as="h2">
                {t("App.Login.title")}
              </Text>
              <TextField
                type="text"
                name="shop"
                label={t("App.Login.label")}
                helpText={t("App.Login.help")}
                value={shop}
                onChange={setShop}
                autoComplete="on"
                error={actionData ? t(actionData.errors.shop) : undefined}
              />
              <Button submit primary>
                {t("App.Login.submit")}
              </Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}
