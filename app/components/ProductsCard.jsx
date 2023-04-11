import { useState } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
} from "@shopify/polaris";
import { useSubmit } from "@remix-run/react";

export function ProductsCard({count}) {
  const submit = useSubmit();

  function handleChange(event) {
    event.preventDefault()
    submit({ action: 'create-products'}, { replace: true, method: 'POST' });
  }

  return (
    <>
      <Card
        title="Product Counter"
        sectioned
        primaryFooterAction={{
          content: "Populate 5 products",
          onAction: handleChange,
          // loading: isLoading,
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
              <TextStyle variation="strong">
                {count ? count :  "-" }
              </TextStyle>
            </DisplayText>
          </Heading>
        </TextContainer>
      </Card>
    </>
  );
}
