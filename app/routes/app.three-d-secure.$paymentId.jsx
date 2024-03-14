import {
  Button,
  Card,
  FooterHelp,
  FormLayout,
  Layout,
  Page,
  Text,
  TextField,
  BlockStack,
  Link,
  Banner,
  Select,
  LegacyStack,
  ChoiceList,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import {
  Form,
  useActionData,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import { sessionStorage } from "../shopify.server";
import { getPaymentSession, updatePaymentSessionAuthData, rejectReasons } from "~/payments.repository";
import PaymentsAppsClient, { PAYMENT } from "~/payments-apps.graphql";
import ThreeDSecure from "~/three-d-s.constants";
/**
 * Loads the payment session for 3DS.
 */
export const loader = async ({request, params: { paymentId } }) => {
  const paymentSession = await getPaymentSession(paymentId);

  const url = new URL(request.url);
  const frictionless = url.searchParams.get("frictionless") === 'true';

  const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
  const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);

  if (frictionless) { // Perform frictionless 3DS
    const authenticationPayload = {
      authenticationFlow: Object.keys(ThreeDSecure.flow)[0],
      transStatus: Object.keys(ThreeDSecure.transactionStatusCode)[0],
      version: Object.keys(ThreeDSecure.version)[0],
      chargebackLiability: Object.keys(ThreeDSecure.chargebackLiability)[0]
    };

  const newPaymentSession = await updatePaymentSessionAuthData(paymentId, authenticationPayload);
    const response = await client.confirmSession(newPaymentSession);
    if (response.userErrors?.length > 0) return json({ errors: response.userErrors });

    return redirect(response.paymentSession.nextAction.context.redirectUrl);
  }

  return json({ paymentSession });
}

/**
 * Completes a 3DS session based on the simulator's form
 */
export const action = async ({ request, params: { paymentId } }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const paymentSession = await getPaymentSession(paymentId);
  const lastName = JSON.parse(paymentSession.customer).billing_address.family_name;
  const isRejectLastName = rejectReasons.includes(lastName);

  const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
  const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);

  const authenticationPayload = {};
  if (data["choice"] === "authentication_data" && !isRejectLastName) {
    Object.assign(authenticationPayload, {
      authenticationFlow: data["flow"],
      transStatus: data["transStatus"],
      version: data["version"],
      chargebackLiability: data["chargebackLiability"]
    });
  } else {
    authenticationPayload['partnerError'] = "PROCESSING_ERROR";
  }

  const newPaymentSession = await updatePaymentSessionAuthData(paymentId, authenticationPayload);
  const response = await client.confirmSession(newPaymentSession);

  const userErrors = response.userErrors;
  if (userErrors?.length > 0) return json({ errors: userErrors });

  return redirect(response.paymentSession.nextAction.context.redirectUrl);
}

export default function threeDSSimulator() {
  const action = useActionData();
  const [errors, setErrors] = useState([]);
  const [simulationChoice, setSimulationChoice] = useState(ThreeDSecure.simulationChoice.AuthenticationData);
  const [flow, setFlow] = useState(Object.keys(ThreeDSecure.flow)[0]);
  const [version, setVersion] = useState(Object.keys(ThreeDSecure.version)[0]);
  const [transStatus, setTransStatus] = useState(Object.keys(ThreeDSecure.transactionStatusCode)[0]);
  const [transStatusReason, setTransStatusReason] = useState('');
  const [chargebackLiability, setChargebackLiability] = useState(Object.keys(ThreeDSecure.chargebackLiability)[0]);
  const [partnerError, setPartnerError] = useState(Object.keys(ThreeDSecure.partnerError)[0]);

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

  const options = (obj) => Object.entries(obj).map(([key, value]) => {
    let label = value;
    if (obj === ThreeDSecure.transactionStatusCode) label = `${key} - ${value}`;

    return { label: label, value: key };
  })

  const renderChallengeFields = useCallback((isSelected) => {
    if (!isSelected) return;

    return (
      <LegacyStack vertical>
        <Select
          name="flow"
          label={'Flow Type'}
          options={options(ThreeDSecure.flow)}
          onChange={(val) => setFlow(val)}
          value={flow}
        />
        <Select
          name="version"
          label={'Version'}
          options={options(ThreeDSecure.version)}
          onChange={(val) => setVersion(val)}
          value={version}
        />
        <Select
          name="transStatus"
          label={'Transaction Status'}
          options={options(ThreeDSecure.transactionStatusCode)}
          value={transStatus}
          onChange={(val) => setTransStatus(val)}
        />
        <TextField
          name="transStatusReason"
          label={'Transaction Status Reason'}
          onChange={(val) => setTransStatusReason(val)}
          value={transStatusReason}
          autoComplete="off"
        />
        <Select
          name="chargebackLiability"
          label={'Chargeback Liability'}
          options={options(ThreeDSecure.chargebackLiability)}
          value={chargebackLiability}
          onChange={(val) => setChargebackLiability(val)}
        />
      </LegacyStack>
    )
  }, [flow, simulationChoice, transStatus, transStatusReason, chargebackLiability, version])

  const renderPartnerError = useCallback((isSelected) => {
    if (!isSelected) return;

    return (
      <LegacyStack vertical>
        <Select
          name="partnerError"
          label={'Partner Error'}
          labelHidden
          options={options(ThreeDSecure.partnerError)}
          onChange={(val) => setPartnerError(val)}
          value={partnerError}
        />
      </LegacyStack>
    );
  }, [partnerError, simulationChoice, transStatus])

  const choices = [
    {
      label: 'Authentication Data',
      value: ThreeDSecure.simulationChoice.AuthenticationData,
      renderChildren: renderChallengeFields,
    },
    {
      label: 'Partner Error',
      value: ThreeDSecure.simulationChoice.PartnerError,
      renderChildren: renderPartnerError,
    },
  ];

  return (
    <Page title="3DS challenge">
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
                  <ChoiceList
                    title=""
                    name="choice"
                    choices={choices}
                    selected={[simulationChoice]}
                    onChange={(val) => setSimulationChoice(val[0])}
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
        <Link url="https://shopify.dev/docs/apps/payments/implementation/process-a-payment/credit-card">
          the 3DS flow for credit cards
        </Link>
      </FooterHelp>
    </Page>
  );
}
