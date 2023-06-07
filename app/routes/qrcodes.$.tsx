import React from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { shopify } from "../shopify.server";
import {
  AlphaCard,
  Bleed,
  Button,
  ChoiceList,
  Divider,
  EmptyState,
  HorizontalStack,
  Layout,
  Link,
  Page,
  Select,
  Text,
  TextField,
  Thumbnail,
  VerticalStack,
} from "@shopify/polaris";
import { ImageMajor } from "@shopify/polaris-icons";

export async function loader({ request }: LoaderArgs) {
  await shopify.authenticate.admin(request);

  return null;
}

export async function action({ request }: ActionArgs) {
  return null;
}

export default function Index() {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <VerticalStack gap="5">
            <AlphaCard>
              <VerticalStack gap="5">
                <Text as={"h2"} variant="headingLg">
                  Title
                </Text>
                <TextField
                  id="title"
                  helpText="Only store staff can see this title"
                  label="title"
                  labelHidden
                  autoComplete="off"
                />
              </VerticalStack>
            </AlphaCard>
            <AlphaCard>
              <VerticalStack gap="5">
                <HorizontalStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Product
                  </Text>
                  <Button plain>Change product</Button>
                </HorizontalStack>
                <Thumbnail source={ImageMajor} alt="Thumbnail" />
                <Bleed marginInline="20">
                  <Divider />
                </Bleed>
                <ChoiceList
                  title="Scan destination"
                  choices={[
                    { label: "Link to product page", value: "product" },
                    {
                      label: "Link to checkout page with product in the cart",
                      value: "cart",
                    },
                  ]}
                  selected={["product"]}
                  onChange={() => {}}
                />
              </VerticalStack>
            </AlphaCard>
            <AlphaCard>
              <VerticalStack gap="5">
                <HorizontalStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Discount
                  </Text>
                  <Link>Create discount</Link>
                </HorizontalStack>
                <Select
                  id="discount"
                  label="Discount"
                  labelHidden
                  options={[{ label: "No discount", value: "none" }]}
                  onChange={() => {}}
                  value={"none"}
                />
              </VerticalStack>
            </AlphaCard>
          </VerticalStack>
        </Layout.Section>
        <Layout.Section secondary>
          <AlphaCard>
            <VerticalStack gap="5">
              <Text as={"h2"} variant="headingLg">
                Qr code
              </Text>
              <EmptyState image="">
                Your QR code will appear here after you save
              </EmptyState>
              <Button disabled>Download</Button>
              <Button>Go to destination</Button>
            </VerticalStack>
          </AlphaCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
