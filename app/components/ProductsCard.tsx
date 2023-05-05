import React from "react";

import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  Spinner,
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
    <>
      <Card
        title="Product Counter"
        sectioned
        primaryFooterAction={{
          content: "Populate 5 products",
          onAction: handlePopulate,
          loading: populating,
        }}
      >
        <TextContainer spacing="loose">
          <p>
            Sample products are created with a default title and price. You can
            remove them at any time.
          </p>
          <Heading element="h4">
            TOTAL PRODUCTS
            <DisplayText size="medium">
              <TextStyle variation="strong">{count}</TextStyle>
            </DisplayText>
          </Heading>
        </TextContainer>
      </Card>
    </>
  );
}
