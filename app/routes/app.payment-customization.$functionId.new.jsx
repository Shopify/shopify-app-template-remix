import { useState, useEffect } from "react";
import {
  Banner,
  Button,
  Card,
  FormLayout,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

import { shopify } from "../shopify.server";

export const action = async ({ params, request }) => {
  const { functionId } = params;
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
      mutation createPaymentCustomization($input: PaymentCustomizationInput!) {
        paymentCustomizationCreate(paymentCustomization: $input) {
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
        input: paymentCustomizationInput,
      },
    }
  );

  const responseJson = await response.json();
  const errors = responseJson.data.paymentCustomizationCreate?.userErrors;

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
  const [paymentMethodName, setPaymentMethodName] = useState("");
  const [cartTotal, setCartTotal] = useState("0");

  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.errors.length === 0) {
      redirect();
    }
  }, [actionData?.errors]);

  const errorBanner = actionData?.errors.length ? (
    <Layout.Section>
      <Banner
        title="There was an error creating the customization."
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
