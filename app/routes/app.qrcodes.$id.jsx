import React, { useCallback, useMemo, useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { shopify } from "../shopify.server";
import {
  Card,
  Bleed,
  Button,
  ChoiceList,
  Divider,
  EmptyState,
  HorizontalStack,
  InlineError,
  Layout,
  Link,
  Page,
  Select,
  Text,
  TextField,
  Thumbnail,
  VerticalStack,
  PageActions,
} from "@shopify/polaris";
import {
  ResourcePicker,
  ContextualSaveBar,
  TitleBar,
} from "@shopify/app-bridge-react";
import { ImageMajor } from "@shopify/polaris-icons";

import db from "../db.server";
import { deleteQRCode, getQRCode } from "../models/QRCode";

export async function loader({ request, params }) {
  const { admin, sessionToken } = await shopify.authenticate.admin(request);
  const response = await admin.graphql(DISCOUNT_QUERY, {
    variables: {
      first: 10,
    },
  });

  const body = await response.json();

  const discounts = body.data.codeDiscountNodes.nodes.map(
    ({ id, codeDiscount }) => ({
      label: codeDiscount.codes.nodes[0].code,
      value: id,
    })
  );

  const QRCodeId = params.id === "new" || !params.id ? null : Number(params.id);

  return json({
    discounts,
    createDiscountUrl: `${sessionToken.iss}/discounts/new`,
    QRCode: QRCodeId ? await getQRCode(QRCodeId) : null,
  });
}

export async function action({ request, params }) {
  const { session } = await shopify.authenticate.admin(request);
  const id = params.id === "new" || !params.id ? undefined : Number(params.id);

  if (request.method === "DELETE") {
    await deleteQRCode(id, session.shop);

    return redirect("/app");
  }

  const formData = await request.formData();
  const data = {
    title: formData.get("title"),
    shop: session.shop,
    productId: formData.get("productId"),
    productHandle: formData.get("productHandle"),
    productVariantId: formData.get("productVariantId"),
    productAlt: formData.get("productAlt"),
    productImage: formData.get("productImage"),
    discountId: formData.get("discountId"),
    discountCode: formData.get("discountCode"),
    destination: formData.get("destination"),
  };

  const requiredFieldMessages = {
    title: "Title is required",
    productId: "Product is required",
    destination: "Destination is required",
  };

  const errors = Object.entries(requiredFieldMessages).reduce(
    (errors, [field, message]) => {
      if (!data[field]) {
        errors[field] = message;
      }

      return errors;
    },
    {}
  );

  if (Object.keys(errors).length) {
    return json({ errors }, { status: 422 });
  }

  const QRCode = id
    ? await db.qRCode.update({ where: { id }, data })
    : await db.qRCode.create({ data });

  return redirect(`/app/qrcodes/${QRCode.id}`);
}

export default function Index() {
  const { discounts, createDiscountUrl, QRCode } = useLoaderData();
  const errors = useActionData()?.errors || {};

  const [title, setTitle] = useState(QRCode?.title || "");
  const [destination, setDestination] = useState([
    QRCode?.destination || "product",
  ]);
  const [discount, setDiscount] = useState(QRCode?.discountId || "none");
  const [product, setProduct] = useState({
    image: {
      alt: QRCode?.productAlt || "",
      src: QRCode?.productImage || "",
    },
    handle: QRCode?.productHandle || "",
    id: QRCode?.productId || "",
    variantId: QRCode?.productVariantId || "",
  });

  const [showResourcePicker, setShowResourcePicker] = useState(false);

  const handleProductChange = useCallback(({ selection }) => {
    const { images, handle, id, variants } = selection[0];

    setProduct({
      image: {
        alt: images[0]?.altText,
        src: images[0]?.imageSrc || images[0]?.originalSrc,
      },
      handle,
      id,
      variantId: variants[0].id,
    });

    setShowResourcePicker(false);
  }, []);

  const [cleanState, setCleanState] = useState({
    title,
    destination,
    discount,
    product,
  });

  const isDirty = useMemo(() => {
    return (
      JSON.stringify(cleanState) !==
      JSON.stringify({
        title,
        destination,
        discount,
        product,
      })
    );
  }, [cleanState, title, destination, discount, product]);

  const resetForm = useCallback(() => {
    setTitle(cleanState.title);
    setDestination(cleanState.destination);
    setDiscount(cleanState.discount);
    setProduct(cleanState.product);
  }, [cleanState]);

  const submit = useSubmit();
  const handleSave = () => {
    const data = {
      title,
      destination: destination[0],
      productId: product.id,
      productHandle: product.handle,
      productVariantId: product.variantId,
    };

    if (discount !== "none") {
      data.discountId = discount;
      data.discountCode =
        discounts.find((d) => d.value === discount)?.label || "";
    }

    if (product.image.src) {
      data.productImage = product.image.src;
    }

    if (product.image.alt) {
      data.productAlt = product.image.alt;
    }

    submit(data, { method: "post" });
    setCleanState({
      title,
      destination,
      discount,
      product,
    });
  };

  const handleDelete = () => {
    submit({}, { method: "delete" });
  };

  const { state, formMethod } = useNavigation();
  const isSaving = state === "submitting" && formMethod === "post";
  const isDeleting = state === "submitting" && formMethod === "delete";

  return (
    <Page>
      <TitleBar
        title={QRCode ? "Edit QR code" : "Create new QR code"}
        breadcrumbs={[{ content: "QR codes", url: "/app" }]}
        primaryAction={null}
      />
      <Layout>
        <Layout.Section>
          <VerticalStack gap="5">
            <Card>
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
                  error={errors.title}
                />
              </VerticalStack>
            </Card>
            <Card>
              <VerticalStack gap="5">
                <HorizontalStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Product
                  </Text>
                  {product.id ? (
                    <Button
                      plain
                      onClick={() => setShowResourcePicker(!showResourcePicker)}
                    >
                      {product.id ? "Change product" : "Select product"}
                    </Button>
                  ) : null}
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
                {product.handle ? (
                  <HorizontalStack blockAlign="center" gap={"5"}>
                    <Thumbnail
                      source={product.image.src || ImageMajor}
                      alt={product.image.alt}
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {product.handle}
                    </Text>
                  </HorizontalStack>
                ) : (
                  <VerticalStack gap="2">
                    <Button
                      onClick={() => setShowResourcePicker(true)}
                      id="select-product"
                    >
                      Select product
                    </Button>
                    {errors.productId ? (
                      <InlineError
                        message={errors.productId}
                        fieldID="myFieldID"
                      />
                    ) : null}
                  </VerticalStack>
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
                  error={errors.destination}
                />
              </VerticalStack>
            </Card>
            <Card>
              <VerticalStack gap="5">
                <HorizontalStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Discount
                  </Text>
                  <Link
                    onClick={() => window.shopify.redirectTo(createDiscountUrl)}
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
            </Card>
          </VerticalStack>
        </Layout.Section>
        <Layout.Section secondary>
          <Card>
            <Text as={"h2"} variant="headingLg">
              QR code
            </Text>
            {QRCode ? (
              <EmptyState image={QRCode.image} imageContained={true} />
            ) : (
              <EmptyState image="">
                Your QR code will appear here after you save
              </EmptyState>
            )}
            <VerticalStack gap="5">
              <Button disabled={!QRCode} url={QRCode?.image} download primary>
                Download
              </Button>
              <Button url={QRCode?.destinationUrl} external>
                Go to destination
              </Button>
            </VerticalStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !QRCode || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onClick: handleDelete,
              },
            ]}
            primaryAction={{
              content: "Save",
              disabled: !isDirty || isSaving || isDeleting,
              onClick: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
      <ContextualSaveBar
        saveAction={{
          label: "Save",
          onAction: handleSave,
          loading: isSaving,
          disabled: isSaving,
        }}
        discardAction={{
          label: "Discard",
          onAction: resetForm,
          loading: isSaving,
          disabled: !isDirty || isSaving,
        }}
        visible={isDirty || isSaving}
        fullWidth
      />
    </Page>
  );
}

const DISCOUNT_QUERY = `
  query shopData($first: Int!) {
    codeDiscountNodes(first: $first) {
      nodes {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
          ... on DiscountCodeBxgy {
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
          ... on DiscountCodeFreeShipping {
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
        }
      }
    }
  }
`;
