/**
 * Settings Page - App configuration and preferences
 * Provides interface for configuring app settings and features
 */

import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Button,
  Banner,
  Text,
  Divider,
  ButtonGroup,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  // Mock settings data - in real app, load from database
  const settings = {
    appName: "Shopify App Template",
    debugMode: true,
    apiVersion: "2024-01",
    logLevel: "info",
    enablePreview: true,
    enableStorybook: true,
    enableApiTesting: true,
    webhookUrl: "",
    emailNotifications: true,
    slackNotifications: false,
  };
  
  return json({
    settings,
    shop: session.shop,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const settings = Object.fromEntries(formData);
  
  // Mock save settings - in real app, save to database
  console.log("Saving settings:", settings);
  
  return json({
    success: true,
    message: "Settings saved successfully!",
  });
}

export default function SettingsPage() {
  const { settings, shop } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  const [formData, setFormData] = useState(settings);

  const handleChange = useCallback((field: string) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setFormData(settings);
  }, [settings]);

  return (
    <Page
      title="Settings"
      subtitle="Configure your app preferences and features"
      primaryAction={{
        content: "Save settings",
        onAction: () => {},
      }}
      secondaryActions={[
        {
          content: "Reset to defaults",
          onAction: handleReset,
        },
      ]}
    >
      <Layout>
        {actionData?.success && (
          <Layout.Section>
            <Banner tone="success" onDismiss={() => {}}>
              <p>{actionData.message}</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Form method="post">
            <FormLayout>
              {/* General Settings */}
              <Card>
                <div style={{ padding: "20px" }}>
                  <Text variant="headingMd" as="h2">
                    General Settings
                  </Text>
                  <div style={{ marginTop: "16px" }}>
                    <FormLayout>
                      <TextField
                        label="App Name"
                        value={formData.appName}
                        onChange={handleChange("appName")}
                        autoComplete="off"
                        helpText="The display name for your app"
                      />
                      
                      <Select
                        label="API Version"
                        options={[
                          { label: "2024-01", value: "2024-01" },
                          { label: "2023-10", value: "2023-10" },
                          { label: "2023-07", value: "2023-07" },
                        ]}
                        value={formData.apiVersion}
                        onChange={handleChange("apiVersion")}
                        helpText="Shopify API version to use"
                      />
                      
                      <TextField
                        label="Webhook URL"
                        value={formData.webhookUrl}
                        onChange={handleChange("webhookUrl")}
                        autoComplete="url"
                        placeholder="https://example.com/webhooks"
                        helpText="URL to receive webhook notifications"
                      />
                    </FormLayout>
                  </div>
                </div>
              </Card>

              {/* Development Settings */}
              <Card>
                <div style={{ padding: "20px" }}>
                  <Text variant="headingMd" as="h2">
                    Development Settings
                  </Text>
                  <div style={{ marginTop: "16px" }}>
                    <FormLayout>
                      <Checkbox
                        label="Enable debug mode"
                        checked={formData.debugMode}
                        onChange={handleChange("debugMode")}
                        helpText="Show additional debugging information"
                      />
                      
                      <Select
                        label="Log Level"
                        options={[
                          { label: "Error", value: "error" },
                          { label: "Warning", value: "warn" },
                          { label: "Info", value: "info" },
                          { label: "Debug", value: "debug" },
                        ]}
                        value={formData.logLevel}
                        onChange={handleChange("logLevel")}
                        helpText="Minimum log level to display"
                      />
                    </FormLayout>
                  </div>
                </div>
              </Card>

              {/* Feature Toggles */}
              <Card>
                <div style={{ padding: "20px" }}>
                  <Text variant="headingMd" as="h2">
                    Feature Toggles
                  </Text>
                  <div style={{ marginTop: "16px" }}>
                    <FormLayout>
                      <Checkbox
                        label="Enable Preview System"
                        checked={formData.enablePreview}
                        onChange={handleChange("enablePreview")}
                        helpText="Enable the component preview system on port 3002"
                      />
                      
                      <Checkbox
                        label="Enable Storybook"
                        checked={formData.enableStorybook}
                        onChange={handleChange("enableStorybook")}
                        helpText="Enable Storybook for component development"
                      />
                      
                      <Checkbox
                        label="Enable API Testing Suite"
                        checked={formData.enableApiTesting}
                        onChange={handleChange("enableApiTesting")}
                        helpText="Enable the built-in API testing interface"
                      />
                    </FormLayout>
                  </div>
                </div>
              </Card>

              {/* Notification Settings */}
              <Card>
                <div style={{ padding: "20px" }}>
                  <Text variant="headingMd" as="h2">
                    Notifications
                  </Text>
                  <div style={{ marginTop: "16px" }}>
                    <FormLayout>
                      <Checkbox
                        label="Email notifications"
                        checked={formData.emailNotifications}
                        onChange={handleChange("emailNotifications")}
                        helpText="Receive email notifications for important events"
                      />
                      
                      <Checkbox
                        label="Slack notifications"
                        checked={formData.slackNotifications}
                        onChange={handleChange("slackNotifications")}
                        helpText="Send notifications to Slack (requires webhook setup)"
                      />
                    </FormLayout>
                  </div>
                </div>
              </Card>

              {/* Shop Information */}
              <Card>
                <div style={{ padding: "20px" }}>
                  <Text variant="headingMd" as="h2">
                    Shop Information
                  </Text>
                  <div style={{ marginTop: "16px" }}>
                                         <Text variant="bodyMd" as="p">
                      <strong>Shop:</strong> {shop}
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <strong>Environment:</strong> {process.env.NODE_ENV || "development"}
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <strong>App Version:</strong> 1.0.0
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Hidden form fields for submission */}
              {Object.entries(formData).map(([key, value]) => (
                <input
                  key={key}
                  type="hidden"
                  name={key}
                  value={typeof value === 'boolean' ? value.toString() : value}
                />
              ))}
            </FormLayout>
          </Form>
        </Layout.Section>

        {/* Development Links */}
        <Layout.Section>
          <Card>
            <div style={{ padding: "20px" }}>
              <Text variant="headingMd" as="h2">
                Development Tools
              </Text>
              <div style={{ marginTop: "16px" }}>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Quick access to development tools and documentation
                </Text>
                <div style={{ marginTop: "16px" }}>
                  <ButtonGroup>
                    <Button
                      external
                      url="http://localhost:3002"
                      disabled={!formData.enablePreview}
                    >
                      Open Preview
                    </Button>
                    <Button
                      external
                      url="http://localhost:6006"
                      disabled={!formData.enableStorybook}
                    >
                      Open Storybook
                    </Button>
                    <Button
                      url="/admin/api-testing"
                      disabled={!formData.enableApiTesting}
                    >
                      API Testing
                    </Button>
                    <Button
                      url="/admin/dev-tools"
                    >
                      Dev Tools
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 