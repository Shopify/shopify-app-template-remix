import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  BlockStack,
  Card,
  Button,
  Banner,
  FormLayout,
  TextField,
  Checkbox,
  Select,
  Spinner,
  FooterHelp,
  Link,
} from "@shopify/polaris";

import { authenticate } from "~/shopify.server";
import { getConfiguration, getOrCreateConfiguration } from "~/payments.repository";
import PaymentsAppsClient from "~/payments-apps.graphql";
import Welcome from "./welcome";

/**
 * Loads the app's configuration if it exists.
*/
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const apiKey = process.env.SHOPIFY_API_KEY;

  const config = await getConfiguration(session.id);

  return json({ shopDomain: session.shop, apiKey: apiKey, config: config });
};

/**
 * Saves the app's configuration.
 */
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();
  const config = {
    shop: session.shop,
    accountName: formData.get("accountName"),
    ready: formData.get("ready") === "true",
    apiVersion: formData.get("apiVersion"),
  };
  const configuration = await getOrCreateConfiguration(session.id, config);

  const client = new PaymentsAppsClient(session.shop, session.accessToken);
  const response = await client.paymentsAppConfigure(configuration.accountName, configuration.ready);

  const userErrors = response.userErrors || [];

  if (userErrors.length > 0) return json({ errors: userErrors });
  return json({ raiseBanner: true, errors: userErrors });
}

export default function Index() {
  const nav = useNavigation();
  const { shopDomain, apiKey, config } = useLoaderData();
  const action = useActionData();

  const [accountName, setAccountName] = useState(config ? config.accountName : '');
  const [ready, setReady] = useState(config ? config.ready : false);
  const [apiVersion, setApiVersion] = useState(config ? config.ready : 'unstable');
  const [showBanner, setShowBanner] = useState(action ? action.raiseBanner : false);
  const [errors, setErrors] = useState([]);

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  useEffect(() => {
    if (action?.raiseBanner) setShowBanner(true);
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

  const banner = () => (
    showBanner && (
      <Banner
        title={'🥰 Settings updated!'}
        action={{
          content: 'Return to Shopify',
          url: `https://${shopDomain}/services/payments_partners/gateways/${apiKey}/settings`,
        }}
        status="success"
        onDismiss={() => { setShowBanner(false) }}
      />)
    );

  const apiVersionOptions = [
    {value: 'unstable', label: 'unstable'},
    {value: '2022-01', label: '2022-01'},
    {value: '2022-04', label: '2022-04'},
    {value: '2022-07', label: '2022-07'},
    {value: '2022-09', label: '2022-09'},
    {value: '2023-01', label: '2023-01'},
    {value: '2023-04', label: '2023-04'},
    {value: '2023-07', label: '2023-07'},
    {value: '2023-09', label: '2023-09'},
  ];

  if (isLoading) {
    return (
      <Page fullWidth >
        <div style={{display: "flex", height: "100vh", alignItems: "center", justifyContent: "center"}}>
          <Spinner accessibilityLabel="Spinner" size="large" />
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <BlockStack gap="5">
        <Layout>
          <Layout.Section>
            <BlockStack gap="4">
              {banner()}
              {errorBanner()}
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <Welcome />
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="5">
                <BlockStack gap="2">
                  <Text as="h2" variant="headingMd">
                    Configure your Payments App
                  </Text>
                  <Text as="p">
                    Below you'll find a form to configure your
                    app with the current shop: <Text as="span" color="success">{shopDomain}</Text>
                  </Text>
                  <Text as="p">
                    If any details are already present, your app has already been configured with the shop.
                  </Text>
                </BlockStack>
                <BlockStack gap="2">
                  <Card>
                    <Form method="post">
                      <FormLayout>
                        <TextField
                          label="Account Name"
                          name="accountName"
                          onChange={(change) => setAccountName(change)}
                          value={accountName}
                          autoComplete="off"
                        />
                        <Checkbox
                          label="Ready?"
                          name="ready"
                          checked={ready}
                          onChange={(change) => setReady(change)}
                          value={ready.toString()}
                        />
                        <Select
                          label="API Version"
                          name="apiVersion"
                          onChange={(change) => setApiVersion(change)}
                          options={apiVersionOptions}
                          value={apiVersion}
                        />
                        <Button submit>Submit</Button>
                      </FormLayout>
                    </Form>
                  </Card>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <FooterHelp>
          <Text as="span">Learn more about </Text>
          <Link url="https://shopify.dev/docs/apps/payments" target="_blank">
            payments apps
          </Link>
        </FooterHelp>
      </BlockStack>
    </Page>
  );
}
