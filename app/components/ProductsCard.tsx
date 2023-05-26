import React from "react";
import {
  Card,
  VerticalStack,
  Text,
  Button,
  HorizontalStack,
} from "@shopify/polaris";
import { Form } from "@remix-run/react";
import { useTranslation } from "react-i18next";

interface ProductsCardProps {
  count: number;
  loading: boolean;
}

export function ProductsCard({ count, loading }: ProductsCardProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <VerticalStack gap="5">
        <Text variant="headingMd" as="h2">
          {t("ProductsCard.title")}
        </Text>
        <Text variant="bodyMd" as="p">
          {t("ProductsCard.description")}
        </Text>
        <VerticalStack gap="0">
          <Text variant="bodyMd" as="span">
            {t("ProductsCard.totalProductsHeading")}
          </Text>
          <Text variant="headingXl" as="span">
            {count}
          </Text>
        </VerticalStack>
        <HorizontalStack align="end">
          <Form method={"post"}>
            <input type="hidden" name="action" value="create-products" />
            <Button primary loading={loading} submit>
              {t("ProductsCard.populateProductsButton", { count: 5 }) || ""}
            </Button>
          </Form>
        </HorizontalStack>
      </VerticalStack>
    </Card>
  );
}
