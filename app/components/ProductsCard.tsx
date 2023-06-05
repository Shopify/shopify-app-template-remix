import React from "react";

import {
  AlphaCard,
  VerticalStack,
  Text,
  Button,
  HorizontalStack,
} from "@shopify/polaris";

interface ProductsCardProps {
  count: number;
  populating: boolean;
  handlePopulate: () => void;
}

export function ProductsCard({
  count,
  handlePopulate,
  populating,
}: ProductsCardProps) {
  return (
    <AlphaCard>
      <VerticalStack gap="5">
        <Text variant="headingMd" as="h2">
          Product Counter
        </Text>
        <Text variant="bodyMd" as="p">
          Sample products are created with a default title and price. You can
          remove them at any time.
        </Text>
        <VerticalStack gap="0">
          <Text variant="bodyMd" as="span">
            TOTAL PRODUCTS
          </Text>
          <Text variant="headingXl" as="span">
            {count}
          </Text>
        </VerticalStack>
        <HorizontalStack align="end">
          <Button primary onClick={handlePopulate} loading={populating}>
            Populate 5 products
          </Button>
        </HorizontalStack>
      </VerticalStack>
    </AlphaCard>
  );
}
