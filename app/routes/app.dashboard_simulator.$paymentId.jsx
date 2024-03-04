import {
  Button,
  Card,
  Layout,
  Page,
  Text,
  Banner,
  DescriptionList,
  InlineCode,
  Link,
  Icon,
  LegacyStack,
  DataTable,
  Modal,
} from "@shopify/polaris";
import { XSmallIcon, CheckSmallIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect } from "react";
import {
  useActionData,
  useLoaderData,
  useSubmit
} from "@remix-run/react";
import { json } from "@remix-run/node";

import { sessionStorage } from "../shopify.server";
import {getPaymentSession, PENDING} from "~/payments.repository";
import PaymentsAppsClient, { PAYMENT, REFUND, CAPTURE, VOID } from "~/payments-apps.graphql";

/**
 * Loads in the relevant payment session along with it's related refund, capture, and void sessions.
 */
export const loader = async ({ params: { paymentId } }) => {
  const paymentSession = await getPaymentSession(paymentId);

  return json({
    paymentSession,
    refundSessions: paymentSession.refunds,
    captureSessions: paymentSession.captures,
    voidSession: paymentSession.void
  });
}

/**
 * Action that performs resolution for payment, refund, capture, and void sessions
 *
 * formData: {
 *  resolution: {true/false},
 *  type: {"payment"/"refund"/"capture"/"void"},
 *  session: the payment/refund/capture/void session, as a string
 * }
 */
export const action = async ({ request }) => {
  const formData = await request.formData();
  const resolve = formData.get("resolve") === "true";

  const anySession = JSON.parse(formData.get("session"));
  const session = (await sessionStorage.findSessionsByShop(anySession.shop))[0];

  const client = new PaymentsAppsClient(session.shop, session.accessToken, formData.get("type"));

  const response = resolve
    ? await client.resolveSession(anySession)
    : await client.rejectSession(anySession);

  const userErrors = response.userErrors;
  if (userErrors?.length > 0) return json({ errors: userErrors });

  return json({ active: false })
}

export default function DashboardSimulator() {
  const {
    paymentSession,
    refundSessions,
    captureSessions,
    voidSession
  } = useLoaderData();
  const submit = useSubmit();
  const action = useActionData();

  const [errors, setErrors] = useState([]);
  const [active, setActive] = useState(false);
  const [simulatedType, setSimulatedType]= useState(REFUND);
  const [simulatedSession, setSimulatedSession] = useState({});

  useEffect(() => {
    if (action?.errors && action.errors?.length > 0) setErrors(action.errors);
  }, [action]);

  const errorBanner = () => (
    errors?.length > 0 && (
      <Banner
        title={'😢 An error ocurred!'}
        status="critical"
        onDismiss={() => { setErrors([]) }}
      >
        { errors.map(({message}, idx) => (<Text as="p" key={idx}>{message}</Text>)) }
      </Banner>
    )
  );

  // Resolution Modal

  const modalItems = useCallback(() => {
    const items = [];
    Object.keys(simulatedSession).forEach((key) => {
      if (['refunds', 'captures', 'void', 'test'].includes(key)) return;

      if (key == 'status' && !simulatedSession[key]) {
        items.push({ term: key, description: <Text as="span">Requires Resolution</Text>})
        return;
      }

      items.push({ term: key, description: <InlineCode>{simulatedSession[key]}</InlineCode> })
    })

    return items;
  }, [simulatedSession])

  const resolveModal = useCallback(() => {
    submit({
      resolve: true,
      type: simulatedType,
      session: JSON.stringify(simulatedSession)
    }, { method: "post" })
    setActive(!active)
  }, [simulatedType, simulatedSession, active, setActive]);

  const rejectModal = useCallback(() => {
    submit({
      resolve: false,
      type: simulatedType,
      session: JSON.stringify(simulatedSession)
    }, { method: "post" })
    setActive(!active)
  }, [simulatedType, simulatedSession, active, setActive]);

  const raiseModal = useCallback((session, type) => {
    setSimulatedSession(session)
    setSimulatedType(type)
    setActive(!active)
  }, [active, setSimulatedSession, setSimulatedType, setActive]);

  const activator = (session, type) => {
    if (!session.status || session.status === PENDING)
      return <Button onClick={() => raiseModal(session, type)}>Open</Button>
    return <Icon source={CheckSmallIcon} />
  }

  const refundRows = refundSessions.map((refund) => [
    refund.id,
    refund.gid,
    amountString(refund),
    refund.proposedAt,
    refund.status || 'Requires Resolution',
    activator(refund, REFUND),
  ])

  const captureRows = captureSessions.map((capture) => [
    capture.id,
    capture.gid,
    amountString(capture),
    capture.proposedAt,
    capture.status || 'Requires Resolution',
    activator(capture, CAPTURE),
  ])

  const voidItems = () => {
    if (!voidSession) return [];

    const items = Object.keys(voidSession).map((key) => {
      if (key === "status" && !voidSession[key]) {
        return { term: key, description: <Text as="span">Requires Resolution</Text> }
      }
      return {
        term: key,
        description: <Text as="span">{voidSession[key]}</Text>
      }
    })
    if (!voidSession.status) {
      items.push({
        term: "Action",
        description: activator(voidSession, VOID)
      })
    }

    return items
  }

  const paymentItems = buildPaymentItems(paymentSession, activator);

  return (
    <Page
      title="Simulator"
      backAction={{ url: "/app/dashboard" }}
    >
      <Layout>
        <Layout.Section>
          {errorBanner()}
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h6">Payment Details</Text>
            <DescriptionList items={paymentItems}/>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h6">Refunds</Text>
            <DataTable
              truncate
              verticalAlign="middle"
              columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
              headings={['Refund Session ID', 'GraphQL ID', 'Amount', 'Proposed At', 'Status', 'Action']}
              rows={refundRows}
            />
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h6">Captures</Text>
            <DataTable
              truncate
              verticalAlign="middle"
              columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
              headings={['Capture Session ID', 'GraphQL ID', 'Amount', 'Proposed At', 'Status', 'Action']}
              rows={captureRows}
            />
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h6">Void</Text>
            {
              voidSession
                ? <DescriptionList items={voidItems()}/>
                : <Text as="span" color="subdued"> None found.</Text>
            }
          </Card>
        </Layout.Section>
        <Layout.Section/>
      </Layout>
      <Modal
        open={active}
        onClose={() => setActive(!active)}
        title={`Simulate a ${simulatedType}`}
        primaryAction={{ content: 'Resolve', onAction: resolveModal }}
        secondaryActions={[{ content: 'Reject', onAction: rejectModal }]}
      >
        <Modal.Section>
          <DescriptionList items={modalItems()} />
        </Modal.Section>
      </Modal>
    </Page>
  );
}

const buildPaymentItems = (paymentSession, activator) => {
  const paymentMethod = JSON.parse(paymentSession.paymentMethod)
  const paymentMethodData = Object.keys(paymentMethod.data).map((key) => {
    const value = paymentMethod.data[key]
    let component;
    if (key.includes("url")) {
      component = <Link url={value}>{value}</Link>
    } else {
      component = <Text as="span">{value}</Text>
    }

    return {
      term: key,
      description: component
    }
  })

  const items = [
    {
      term: "Payment Session ID",
      description: (
        <Text as="span">
          <InlineCode>{paymentSession.id}</InlineCode>
        </Text>
      )
    },
    {
      term: "GraphQL ID",
      description: (
        <Text as="span">
          <InlineCode>{paymentSession.gid}</InlineCode>
        </Text>
      )
    },
    {
      term: "Shop Domain",
      description: (
        <Link url={`https://${paymentSession.shop}`}>{paymentSession.shop}</Link>
      )
    },
    {
      term: "Group",
      description: (
        <Text as="span">
          <InlineCode>{paymentSession.group}</InlineCode>
        </Text>
      )
    },
    {
      term: "Amount",
      description: (
        <Text as="span">{amountString(paymentSession)}</Text>
      )
    },
    {
      term: "Test",
      description: (
        <LegacyStack>
          {
            paymentSession.test
              ? (<Icon source={CheckSmallIcon} color="primary"/>)
              : (<Icon source={XSmallIcon} color="critical"/>)
          }
        </LegacyStack>
      )
    },
    {
      term: "Payment Kind",
      description: (
        <Text as="span">
          <InlineCode>{paymentSession.kind}</InlineCode>
        </Text>
      )
    },
    {
      term: "Payment Method",
      description: (
        <Card>
          <DescriptionList
            items={[
              {
                term: "type",
                description: <Text as="span">{paymentMethod.type}</Text>
              },
              ...paymentMethodData
            ]}
          />
        </Card>
      )
    },
    {
      term: "Proposed At",
      description: (
        <Text as="span">{new Date(paymentSession.proposedAt).toString()}</Text>
      )
    },
    {
      term: "Status",
      description: (
        <Text as="span">{paymentSession.status || "Requires Resolution"}</Text>
      )
    }
  ]

  if (paymentSession.status === PENDING) {
    items.push({
      term: "Action",
      description: activator(paymentSession, PAYMENT)
    })
  }

  return items
}

const amountString = ({amount, currency}) => (amount.toString().concat(' ', currency))
