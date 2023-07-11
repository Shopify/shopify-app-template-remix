import { useState } from "react";
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
import {
  getQRCode,
  validateQRCode,
  createQRCode,
} from "../models/QRCode.server";

export async function loader({ request, params }) {
  const { admin } = await shopify.authenticate.admin(request);
  const QRCodeId = !params.id || params.id === "new" ? null : Number(params.id);

  if (QRCodeId) {
    return json(await getQRCode(QRCodeId, admin.graphql));
  }

  return json({
    destination: "product",
    title: "",
  });
}

export async function action({ request, params }) {
  const { admin } = await shopify.authenticate.admin(request);
  const id = !params.id || params.id === "new" ? undefined : Number(params.id);

  // if (request.method === "DELETE") {
  //   await db.qRCode.deleteMany({ where: { id, shop } });

  //   return redirect("/app");
  // }

  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const errors = validateQRCode(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const QRCode = id
    ? await db.qRCode.update({ where: { id }, data })
    : await createQRCode(admin.graphql, data);

  return redirect(`/app/qrcodes/${QRCode.id}`);
}

export default function Index() {
  const QRCode = useLoaderData();
  const errors = useActionData()?.errors || {};
  const submit = useSubmit();
  const nav = useNavigation();

  const isSaving = nav.state === "submitting" && nav.formMethod === "POST";
  const isDeleting = nav.state === "submitting" && nav.formMethod === "DELETE";

  const [formState, setFormState] = useState(QRCode);
  const [cleanFormState, setCleanFormState] = useState(QRCode);
  const [showResourcePicker, setShowResourcePicker] = useState(false);

  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  function handleProductChange({ selection }) {
    const { images, id, variants, title, handle } = selection[0];

    setFormState({
      ...formState,
      productId: id,
      productVariantId: variants[0].id,
      productTitle: title,
      productHandle: handle,
      productAlt: images[0]?.altText,
      productImage: images[0]?.imageSrc || images[0]?.originalSrc,
    });

    setShowResourcePicker(false);
  }

  function handleSave() {
    const data = {
      title: formState.title,
      productId: formState.productId,
      productVariantId: formState.productVariantId,
      destination: formState.destination,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

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
                  value={formState.title}
                  onChange={(title) =>
                    setFormState({ ...formState, title: title })
                  }
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
                  {formState.productId ? (
                    <Button
                      plain
                      onClick={() => setShowResourcePicker(!showResourcePicker)}
                    >
                      Change product
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
                {formState.productId ? (
                  <HorizontalStack blockAlign="center" gap={"5"}>
                    <Thumbnail
                      source={formState.productImage || ImageMajor}
                      alt={formState.productAlt}
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {formState.productTitle}
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
                  selected={[formState.destination]}
                  onChange={(destination) =>
                    setFormState({ ...formState, destination: destination[0] })
                  }
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
              <Button
                disabled={!QRCode?.image}
                url={QRCode?.image}
                download
                primary
              >
                Download
              </Button>
              <Button
                disabled={!QRCode.destinationUrl}
                url={QRCode?.destinationUrl}
                external
              >
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
                onClick: () => submit({}, { method: "delete" }),
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
          onAction: () => setFormState(cleanFormState),
          loading: isSaving,
          disabled: !isDirty || isSaving,
        }}
        visible={isDirty || isSaving}
        fullWidth
      />
    </Page>
  );
}
