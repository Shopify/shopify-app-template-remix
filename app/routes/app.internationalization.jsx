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
import remixI18n from "../i18n/i18next.server";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }) {
  const t = await remixI18n.getFixedT(request);

  const serverMessage = t("Internationalization.translating.example_loader", {
    remixI18nUtility: "remixI18n.getFixedT()",
    useLoaderDataHook: "useLoaderData()",
  });

  return {
    serverMessage,
  };
}

export default function Internationalization() {
  const { t } = useTranslation();
  const { serverMessage } = useLoaderData();

  return (
    <Page title={t("Internationalization.title")}>
      <VerticalStack gap="5">
        <Text as="p" variant="bodyMd">
          {t("Internationalization.intro")}
        </Text>
        <Layout>
          <Layout.Section>
            <VerticalStack gap="5">
              <Card>
                <VerticalStack gap="5">
                  <Text as="h3" variant="headingMd">
                    {t("Internationalization.translating.title")}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {t("Internationalization.translating.intro")}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {t("Internationalization.translating.example", {
                      localePath: (
                        <b>
                          /app/locales/{"{"}locale{"}"}.json
                        </b>
                      ),
                      hookName: <b>useTranslation</b>,
                    })}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {serverMessage}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {t("Internationalization.translating.file", {
                      filePath: <b>/app/routes/app.internationalization.tsx</b>,
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
                  {t("Internationalization.resources.title")}
                </Text>
                <List>
                  <List.Item>
                    <Text as="p" variant="bodyMd">
                      <Link
                        url="https://www.i18next.com/translation-function/essentials"
                        target="_blank"
                      >
                        {t("Internationalization.resources.i18next")}
                      </Link>
                    </Text>
                  </List.Item>
                  <List.Item>
                    <Text as="p" variant="bodyMd">
                      <Link
                        url="https://github.com/sergiodxa/remix-i18next"
                        target="_blank"
                      >
                        {t("Internationalization.resources.remix-i18next")}
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
