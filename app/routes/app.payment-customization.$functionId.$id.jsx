import { useState, useEffect } from "react";
import {
  Banner,
  Card,
  FormLayout,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

import { shopify } from "../shopify.server";

export const loader = async ({ params, request }) => {
  const { id } = params;
  const { admin } = await shopify.authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query getPaymentCustomization($id: ID!) {
        paymentCustomization(id: $id) {
          id
          metafield(namespace: "$app:payment-customization", key: "function-configuration") {
            value
          }
        }
      }`,
    {
      variables: {
        id: `gid://shopify/PaymentCustomization/${id}`,
      },
    }
  );

  const responseJson = await response.json();
  const metafield =
    responseJson.data.paymentCustomization?.metafield?.value &&
    JSON.parse(responseJson.data.paymentCustomization.metafield.value);
  const paymentCustomization = {
    id,
    paymentMethodName: metafield?.paymentMethodName ?? "",
    cartTotal: metafield?.cartTotal ?? "0",
  };

  return json({ paymentCustomization });
};

export const action = async ({ params, request }) => {
  const { id, functionId } = params;
  const { admin } = await shopify.authenticate.admin(request);
  const formData = await request.formData();

  const paymentMethodName = formData.get("paymentMethodName");
  const cartTotal = formData.get("cartTotal");

  const paymentCustomizationInput = {
    functionId,
    title: `Hide ${paymentMethodName} if cart total is larger than ${cartTotal}`,
    enabled: true,
    metafields: [
      {
        namespace: "$app:payment-customization",
        key: "function-configuration",
        type: "json",
        value: JSON.stringify({
          paymentMethodName,
          cartTotal,
        }),
      },
    ],
  };

  const response = await admin.graphql(
    `#graphql
      mutation updatePaymentCustomization($id: ID!, $input: PaymentCustomizationInput!) {
        paymentCustomizationUpdate(id: $id, paymentCustomization: $input) {
          paymentCustomization {
            id
          }
          userErrors {
            message
          }
        }
      }`,
    {
      variables: {
        id: `gid://shopify/PaymentCustomization/${id}`,
        input: paymentCustomizationInput,
      },
    }
  );

  const responseJson = await response.json();
  const errors = responseJson.data.paymentCustomizationUpdate?.userErrors;

  return json({ errors });
};

const useRedirectToSettings = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  return () => {
    redirect.dispatch(Redirect.Action.ADMIN_PATH, {
      path: "/settings/payments/customizations",
    });
  };
};

export default function PaymentCustomization() {
  const submit = useSubmit();
  const actionData = useActionData();
  const navigation = useNavigation();
  const redirect = useRedirectToSettings();
  const { paymentCustomization } = useLoaderData();
  const [paymentMethodName, setPaymentMethodName] = useState(
    paymentCustomization.paymentMethodName
  );
  const [cartTotal, setCartTotal] = useState(paymentCustomization.cartTotal);

  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.errors.length === 0) {
      redirect();
    }
  }, [actionData?.errors]);

  const errorBanner = actionData?.errors.length ? (
    <Layout.Section>
      <Banner
        title="There was an error updating the customization."
        status="critical"
      >
        <ul>
          {actionData?.errors.map((error, index) => {
            return <li key={`${index}`}>{error.message}</li>;
          })}
        </ul>
      </Banner>
    </Layout.Section>
  ) : null;

  const handleSubmit = () => {
    submit({ paymentMethodName, cartTotal }, { method: "post" });
  };

  return (
    <Page
      title="Hide payment method"
      backAction={{ content: "Payment customizations", onAction: redirect }}
      primaryAction={{
        content: "Save",
        loading: isLoading,
        onAction: handleSubmit,
      }}
    >
      <Layout>
        {errorBanner}
        <Layout.Section>
          <Card>
            <Form method="post">
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    name="paymentMethodName"
                    type="text"
                    label="Payment method"
                    value={paymentMethodName}
                    onChange={setPaymentMethodName}
                    disabled={isLoading}
                    requiredIndicator
                  />
                  <TextField
                    name="cartTotal"
                    type="number"
                    label="Cart total"
                    value={cartTotal}
                    onChange={setCartTotal}
                    disabled={isLoading}
                    requiredIndicator
                  />
                </FormLayout.Group>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
