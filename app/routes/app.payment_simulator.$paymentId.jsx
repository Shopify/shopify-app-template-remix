import {
  Button,
  Card,
  FooterHelp,
  FormLayout,
  Layout,
  Page,
  Text,
  Select,
  BlockStack,
  Link,
  Banner,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import {
  Form,
  useLoaderData,
  useActionData,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import { sessionStorage } from "../shopify.server";
import { getPaymentSession, RESOLVE, REJECT, PENDING } from "~/payments.repository";
import PaymentsAppsClient, { PAYMENT } from "~/payments-apps.graphql";

/**
 * Loads the payment session being simulated.
 */
export const loader = async ({ params: { paymentId } }) => {
  const paymentSession = await getPaymentSession(paymentId);
  return json({ paymentSession });
}

/**
 * Completes a payment session based on the simulator's form.
 */
export const action = async ({ request, params: { paymentId } }) => {
  const formData = await request.formData();
  const resolution = formData.get("resolution");

  const paymentSession = await getPaymentSession(paymentId);

  const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];

  const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);
  let response;

  switch(resolution) {
    case RESOLVE:
      response = await client.resolveSession(paymentSession);
      break;
    case REJECT:
      response = await client.rejectSession(paymentSession);
      break;
    case PENDING:
      response = await client.pendSession(paymentSession);
      break;
  }

  const userErrors = response.userErrors;
  if (userErrors?.length > 0) return json({ errors: userErrors });

  return redirect(response.paymentSession.nextAction.context.redirectUrl);
}

export default function PaymentSimulator() {
  const action = useActionData();
  const { paymentSession } = useLoaderData();
  const [resolution, setResolution] = useState('resolve');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (action?.errors.length > 0) setErrors(action.errors);
  }, [action]);

  const errorBanner = () => (
    errors.length > 0 && (
      <Banner
        title={'😢 An error ocurred!'}
        status="critical"
        onDismiss={() => { setErrors([]) }}
      >
        {
          errors.map(({message}, idx) => (
            <Text as="p" key={idx}>{message}</Text>
          ))
        }
      </Banner>
    )
  )

  const resolutionOptions = [
    {value: RESOLVE, label: 'Resolve'},
    {value: REJECT, label: 'Reject'},
    {value: PENDING, label: 'Pending'}
  ];

  const cancelUrl = paymentSession.cancelUrl;

  return (
    <Page
      title="Payment Simulator"
      backAction={{ url: cancelUrl }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="4">
            {errorBanner()}
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap="5">
              <Form method="post">
                <FormLayout>
                  <Select
                    label="Resolution"
                    name="resolution"
                    options={resolutionOptions}
                    onChange={(change) => setResolution(change)}
                    value={resolution}
                  />
                  <Button submit>Submit</Button>
                </FormLayout>
              </Form>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      <FooterHelp>
        <Text as="span">Learn more about </Text>
        <Link url="https://help.shopify.com/en/api/guides/payment-gateway">
          payment sessions
        </Link>
      </FooterHelp>
    </Page>
  );
}

