import React from "react";

import {
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  VerticalStack,
} from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import type { HeadersFunction, LoaderArgs } from "@remix-run/node";

import { shopify } from "../shopify.server";

export const loader = async ({ request }: LoaderArgs) => {
  await shopify.authenticate.admin(request);

  return null;
};

export default function Localization() {
  const { t } = useTranslation();

  return (
    <Page title={t("Localization.title")}>
      <VerticalStack gap="5">
        <Text as="p" variant="bodyMd">
          {t("Localization.intro")}
        </Text>
        <Layout>
          <Layout.Section>
            <VerticalStack gap="5">
              <Card>
                <VerticalStack gap="5">
                  <Text as="h3" variant="headingMd">
                    {t("Localization.translating.title")}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {t("Localization.translating.intro")}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {t("Localization.translating.example", {
                      localePath: (
                        <b>
                          /app/locales/{"{"}locale{"}"}.json
                        </b>
                      ),
                      hookName: <b>useTranslation</b>,
                    })}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {t("Localization.translating.file", {
                      filePath: <b>/app/routes/app.localization.tsx</b>,
                    })}
                  </Text>
                </VerticalStack>
              </Card>
            </VerticalStack>
          </Layout.Section>
          <Layout.Section secondary>
            <Card>
              <VerticalStack gap="5">
                <Text as="h3" variant="headingMd">
                  {t("Localization.resources.title")}
                </Text>
                <List>
                  <List.Item>
                    <Text as="p" variant="bodyMd">
                      <Link
                        url="https://www.i18next.com/translation-function/essentials"
                        target="_blank"
                      >
                        {t("Localization.resources.i18next")}
                      </Link>
                    </Text>
                  </List.Item>
                  <List.Item>
                    <Text as="p" variant="bodyMd">
                      <Link
                        url="https://github.com/sergiodxa/remix-i18next"
                        target="_blank"
                      >
                        {t("Localization.resources.remix-i18next")}
                      </Link>
                    </Text>
                  </List.Item>
                </List>
              </VerticalStack>
            </Card>
          </Layout.Section>
        </Layout>
      </VerticalStack>
    </Page>
  );
}

export function CatchBoundary() {
  return <h1>Error occurred.</h1>;
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return loaderHeaders;
};
