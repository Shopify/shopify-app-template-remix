import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Page, Card, DataTable, Button, Text, LegacyStack, Icon } from "@shopify/polaris";
import { MinusIcon, CheckSmallIcon } from "@shopify/polaris-icons";

import { getPaymentSessions } from "~/payments.repository";

/**
 * Load in the payment sessions.
 */
export const loader = async () => {
  const payments = await getPaymentSessions();
  return json({ "payments": payments })
}

export const action = async ({ request }) => {
  const formData = await request.formData();
  return redirect(`/app/dashboard_simulator/${formData.get("paymentId")}`)
}

export default function Dashboard() {
  const { payments } = useLoaderData();
  const submit = useSubmit();

  const paymentSessionAction = (payment) => (
    <Button
      primary
      onClick={() => { submit({ paymentId: payment.id }, {method: 'post'}) }}
    >
      Simulate
    </Button>
  );

  const voidIcon = (isVoid) => (
    <LegacyStack>
      {
        isVoid
          ? (<Icon source={CheckSmallIcon} color="critical"/>)
          : (<Icon source={MinusIcon} color="primary"/>)
      }
    </LegacyStack>
  );

  const rows = payments.map((payment) => [
    payment.id,
    (payment.refunds || []).length,
    (payment.captures || []).length,
    voidIcon(!!payment.void),
    payment.proposedAt,
    payment.status || 'Requires Resolution',
    paymentSessionAction(payment),
  ])
  return (
    <Page
      title={"Payments App Dashboard"}
      backAction={{ url: "/app" }}
    >
      <Card>
        <Text variant="headingMd" as="h6">Available Payment Sessions</Text>
        <DataTable
          truncate
          verticalAlign="middle"
          columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text']}
          headings={[
            'Payment Session ID',
            'Refunds',
            'Captures',
            'Void',
            'Proposed At',
            'Status',
            'Action',
          ]}
          rows={rows}
        />
      </Card>
    </Page>
  )
}
