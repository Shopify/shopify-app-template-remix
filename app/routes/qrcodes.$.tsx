import React, { useCallback, useState } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
import { ResourcePicker } from "@shopify/app-bridge-react";
import { ImageMajor } from "@shopify/polaris-icons";

export async function loader({ request }: LoaderArgs) {
  const { admin, sessionToken } = await shopify.authenticate.admin(request);
  const { body } = await admin.graphql.query<any>({
    data: {
      query: DISCOUNT_QUERY,
      variables: {
        first: 10,
      },
    },
  });

  const discounts: { label: string; value: string }[] =
    body.data.codeDiscountNodes.edges.map((edge) => ({
      label: edge.node.codeDiscount.codes.edges[0].node.code,
      value: edge.node.id,
    }));

  return json({
    discounts,
    createDiscountUrl: `${sessionToken.iss}/discounts/new`,
  });
}

export async function action({ request }: ActionArgs) {
  return null;
}

export default function Index() {
  const { discounts, createDiscountUrl } = useLoaderData<typeof loader>();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState(["product"]);
  const [discount, setDiscount] = useState("none");
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    title: "",
    image: {
      alt: "",
      src: "",
    },
    handle: "",
    id: "",
    variantId: "",
  });

  const handleProductChange = useCallback(({ selection }) => {
    const { title, images, handle, id, variants } = selection[0];

    setSelectedProduct({
      title,
      image: {
        alt: images[0]?.altText,
        src: images[0]?.imageSrc || images[0]?.originalSrc,
      },
      handle,
      id,
      variantId: variants.id,
    });

    setShowResourcePicker(false);
  }, []);

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
                  value={title}
                  onChange={setTitle}
                />
              </VerticalStack>
            </AlphaCard>
            <AlphaCard>
              <VerticalStack gap="5">
                <HorizontalStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Product
                  </Text>
                  <Button
                    plain
                    onClick={() => setShowResourcePicker(!showResourcePicker)}
                  >
                    Change product
                  </Button>
                  <ResourcePicker
                    resourceType="Product"
                    showVariants={false}
                    selectMultiple={false}
                    onCancel={() => {
                      setShowResourcePicker(false);
                    }}
                    onSelection={handleProductChange}
                    open={showResourcePicker}
                  />
                </HorizontalStack>
                {selectedProduct.title ? (
                  <HorizontalStack blockAlign="center" gap={"5"}>
                    <Thumbnail
                      source={selectedProduct.image.src || ImageMajor}
                      alt={selectedProduct.image.alt}
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {selectedProduct.title}
                    </Text>
                  </HorizontalStack>
                ) : (
                  <Thumbnail source={ImageMajor} alt="Thumbnail" />
                )}
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
                  selected={destination}
                  onChange={setDestination}
                />
              </VerticalStack>
            </AlphaCard>
            <AlphaCard>
              <VerticalStack gap="5">
                <HorizontalStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Discount
                  </Text>
                  <Link
                    onClick={() =>
                      ((window as any).shopify as any).redirectTo(
                        createDiscountUrl
                      )
                    }
                  >
                    Create discount
                  </Link>
                </HorizontalStack>
                <Select
                  id="discount"
                  label="Discount"
                  labelHidden
                  options={[
                    { label: "No discount", value: "none" },
                    ...discounts,
                  ]}
                  onChange={setDiscount}
                  value={discount}
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

const DISCOUNT_QUERY = `
  query shopData($first: Int!) {
    codeDiscountNodes(first: $first) {
      edges {
        node {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
            ... on DiscountCodeBxgy {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
            ... on DiscountCodeFreeShipping {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
