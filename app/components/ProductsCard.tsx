import React from 'react';
import {
  AlphaCard,
  VerticalStack,
  Text,
  Button,
  HorizontalStack,
} from '@shopify/polaris';
import {Form} from '@remix-run/react';

interface ProductsCardProps {
  count: number;
  loading: boolean;
}

export function ProductsCard({count, loading}: ProductsCardProps) {
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
          <Form method={'post'}>
            <input type="hidden" name="action" value="create-products" />
            <Button primary loading={loading} submit>
              Populate 5 products
            </Button>
          </Form>
        </HorizontalStack>
      </VerticalStack>
    </AlphaCard>
  );
}
