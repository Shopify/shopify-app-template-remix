import React, { useState, useEffect } from "react";

import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  Spinner,
  Modal,
  HorizontalStack,
  VerticalStack,
} from "@shopify/polaris";

interface ListProductsCardProps {
  loading: boolean;
  handleList: () => void;
  products: any[] | undefined;
}

export function ListProductsCard({
  handleList,
  loading,
  products,
}: ListProductsCardProps) {
  const [localProducts, setLocalProducts] = useState(products);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  return (
    <Card
      title="List Products API Call"
      sectioned
      primaryFooterAction={{
        content: "List all the products",
        onAction: handleList,
        loading,
      }}
    >
      <TextContainer spacing="loose">
        <p>This will just make an API call for all products</p>
      </TextContainer>
      <Modal
        open={!!localProducts?.length}
        onClose={() => setLocalProducts(undefined)}
        title="Product List"
      >
        <Modal.Section>
          <TextContainer>
            {products?.map(({ node: product }) => {
              return (
                <div key={product.id}>
                  <VerticalStack>
                    <HorizontalStack gap="3">
                      <b>id:</b>
                      <p>{product.id}</p>
                    </HorizontalStack>

                    <HorizontalStack gap="3">
                      <b>title:</b>
                      <p>{product.title}</p>
                    </HorizontalStack>

                    <HorizontalStack gap="3">
                      <b>handle:</b>
                      <p>{product.handle}</p>
                    </HorizontalStack>
                  </VerticalStack>
                  <hr />
                </div>
              );
            })}
          </TextContainer>
        </Modal.Section>
      </Modal>
    </Card>
  );
}
