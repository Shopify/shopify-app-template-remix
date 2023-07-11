import { useCallback, useMemo, useState } from "react";
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
  Page,
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
import { getQRCode, validateQRCode } from "../models/QRCode.server";

export async function loader({ request, params }) {
  const { admin } = await shopify.authenticate.admin(request);
  const QRCodeId = !params.id || params.id === "new" ? null : Number(params.id);
  const QRCode = QRCodeId ? await getQRCode(QRCodeId, admin.graphql) : null;

  return json({
    QRCode,
  });
}

export async function action({ request, params }) {
  const { session } = await shopify.authenticate.admin(request);
  const shop = session.shop;
  const id = !params.id || params.id === "new" ? undefined : Number(params.id);

  if (request.method === "DELETE") {
    await db.qRCode.deleteMany({ where: { id, shop } });

    return redirect("/app");
  }

  const formData = await request.formData();
  const data = {
    ...Object.fromEntries(formData),
    shop,
  };

  const errors = validateQRCode(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const QRCode = id
    ? await db.qRCode.update({ where: { id }, data })
    : await db.qRCode.create({ data });

  return redirect(`/app/qrcodes/${QRCode.id}`);
}

export default function Index() {
  const { QRCode } = useLoaderData();
  const errors = useActionData()?.errors || {};

  const [title, setTitle] = useState(QRCode?.title || "");
  const [destination, setDestination] = useState([
    QRCode?.destination || "product",
  ]);
  const [product, setProduct] = useState({
    id: QRCode?.productId || "",
    title: QRCode?.productTitle || "",
    handle: QRCode?.productHandle || "",
    variantId: QRCode?.productVariantId || "",
    image: {
      alt: QRCode?.productAlt || "",
      src: QRCode?.productImage || "",
    },
  });

  const [showResourcePicker, setShowResourcePicker] = useState(false);

  const handleProductChange = useCallback(({ selection }) => {
    const { images, id, variants, title } = selection[0];

    setProduct({
      id,
      title,
      variantId: variants[0].id,
      image: {
        alt: images[0]?.altText,
        src: images[0]?.imageSrc || images[0]?.originalSrc,
      },
    });

    setShowResourcePicker(false);
  }, []);

  const [cleanState, setCleanState] = useState({
    title,
    destination,
    product,
  });

  const isDirty = useMemo(() => {
    return (
      JSON.stringify(cleanState) !==
      JSON.stringify({
        title,
        destination,
        product,
      })
    );
  }, [cleanState, title, destination, product]);

  const resetForm = useCallback(() => {
    setTitle(cleanState.title);
    setDestination(cleanState.destination);
    setProduct(cleanState.product);
  }, [cleanState]);

  const submit = useSubmit();
  const handleSave = () => {
    const data = {
      title,
      destination: destination[0],
      productId: product.id,
      productVariantId: product.variantId,
    };

    submit(data, { method: "post" });
    setCleanState({
      title,
      destination,
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
                {product.id ? (
                  <HorizontalStack blockAlign="center" gap={"5"}>
                    <Thumbnail
                      source={product.image.src || ImageMajor}
                      alt={product.image.alt}
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {product.title}
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
