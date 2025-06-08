import { useState } from "react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "~/shopify.server";
import {
  Page,
  Layout,
  Card,
  Tabs,
  TextField,
  Select,
  Button,
  Text,
  Banner,
  BlockStack,
  InlineStack,
  Box,
  Checkbox,
} from "@shopify/polaris";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({});
}

export default function CampaignSettings() {
  const [activeTab, setActiveTab] = useState(0);
  const [campaignName, setCampaignName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [campaignType, setCampaignType] = useState("");
  const [description, setDescription] = useState("");

  const tabs = [
    {
      id: "general",
      content: "General",
      accessibilityLabel: "General settings",
      panelID: "general-content",
    },
    {
      id: "targeting",
      content: "Targeting",
      accessibilityLabel: "Targeting settings",
      panelID: "targeting-content",
    },
    {
      id: "schedule",
      content: "Schedule",
      accessibilityLabel: "Schedule settings",
      panelID: "schedule-content",
    },
    {
      id: "analytics",
      content: "Analytics",
      accessibilityLabel: "Analytics",
      panelID: "analytics-content",
    },
  ];

  const handleTabChange = (selectedTabIndex: number) => {
    setActiveTab(selectedTabIndex);
  };

  return (
    <Page
      title="Campaign Settings"
      primaryAction={{
        content: "Save Changes",
        onAction: () => console.log("Save changes"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={activeTab} onSelect={handleTabChange}>
              <Card.Section>
                {activeTab === 0 && (
                  <BlockStack gap="400">
                    <TextField
                      label="Campaign Name"
                      value={campaignName}
                      onChange={setCampaignName}
                      autoComplete="off"
                      placeholder="Enter campaign name"
                    />

                    <Select
                      label="Campaign Type"
                      options={[
                        { label: "Select campaign type", value: "" },
                        { label: "Discount", value: "discount" },
                        { label: "Buy One Get One", value: "bogo" },
                        { label: "Free Shipping", value: "free-shipping" },
                        { label: "Gift with Purchase", value: "gift" },
                      ]}
                      value={campaignType}
                      onChange={setCampaignType}
                    />

                    <TextField
                      label="Description"
                      value={description}
                      onChange={setDescription}
                      multiline={4}
                      autoComplete="off"
                      placeholder="Enter campaign description"
                    />

                    <Checkbox
                      label="Campaign Active"
                      checked={isActive}
                      onChange={setIsActive}
                    />
                  </BlockStack>
                )}

                {activeTab === 1 && (
                  <BlockStack gap="400">
                    <Banner
                      title="Targeting settings coming soon"
                      tone="info"
                    >
                      <p>We're working on adding targeting options for your campaigns.</p>
                    </Banner>
                  </BlockStack>
                )}

                {activeTab === 2 && (
                  <BlockStack gap="400">
                    <Banner
                      title="Schedule settings coming soon"
                      tone="info"
                    >
                      <p>We're working on adding scheduling options for your campaigns.</p>
                    </Banner>
                  </BlockStack>
                )}

                {activeTab === 3 && (
                  <BlockStack gap="400">
                    <Banner
                      title="Analytics coming soon"
                      tone="info"
                    >
                      <p>We're working on adding analytics for your campaigns.</p>
                    </Banner>
                  </BlockStack>
                )}
              </Card.Section>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 