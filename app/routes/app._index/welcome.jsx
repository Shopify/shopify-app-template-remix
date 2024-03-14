import {
  Text,
  BlockStack,
  CalloutCard,
  Link,
} from "@shopify/polaris";

export default function Welcome() {
  return (
    <CalloutCard
      title="Congrats on creating a new Shopify payments app 💸 🎉"
      illustration=""
      primaryAction={{
        content: "Dashboard",
        url: "dashboard"
      }}
    >
      <BlockStack gap="2">
        <Text as="p">
          This payments app template includes the essential
          non-embedded setup to start a developing a payments app, including
          necessary endpoints, configuration, and a demo performing mutations through the{" "}
          <Link url="https://shopify.dev/docs/api/payments-apps" target="_blank">
            Payments Apps API.
          </Link>
        </Text>
        <Text as="p">
          The linked dashboard shows the stored refund sessions - both resolved and new.
        </Text>
      </BlockStack>
    </CalloutCard>
  )
}