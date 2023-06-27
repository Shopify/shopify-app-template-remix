import React, { useState } from "react";
import {
  Page,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalGrid,
} from "@shopify/polaris";
import {
  Modal,
  ContextualSaveBar,
  ResourcePicker,
} from "@shopify/app-bridge-react";

export default function AppExamples() {
  const [showModal, setShowModal] = useState(false);
  const [showContextualSaveBar, setShowContextualSaveBar] = useState(false);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  function selectProduct(product) {
    setShowResourcePicker(false);
    console.log("selected product", product);
  }

  function toggleLoading() {
    setLoading(!loading);
    window?.shopify.loading(!loading);
  }

  return (
    <Page title="App Bridge Examples">
      <VerticalStack gap="5">
        <Text as="p" variant="bodyMd">
          App Bridge components enable Shopify apps to render outside of the
          usual app surface and communicate with the rest of the Shopify admin.
          These components appear above the app interface and require different
          implementation. The following components are triggered through
          actions. Apps can invoke these actions using vanilla Javascript
          functions as well as React component and hook wrappers.
        </Text>
        <HorizontalGrid gap="4" columns={3}>
          <Card>
            <VerticalStack gap="5">
              <Text as="h2" variant="headingMd">
                Navigation menu
              </Text>
              <Text as="p" variant="bodyMd">
                Render a navigation menu on the left of the Shopify admin.
              </Text>
            </VerticalStack>
          </Card>
          <Card>
            <VerticalStack gap="5">
              <Text as="h2" variant="headingMd">
                Modal
              </Text>
              <Text as="p" variant="bodyMd">
                Render a modal that appears above the app, blocking input on the
                entire admin behind it and providing a surface inside the modal
                for the app to provide custom content.
              </Text>
              <Button onClick={() => setShowModal(!showModal)}>Open</Button>
              <Modal
                open={showModal}
                title="Modal title"
                onClose={() => setShowModal(false)}
                message="Modal message"
                primaryAction={{
                  content: "Close",
                  onAction: () => setShowModal(false),
                }}
              />
            </VerticalStack>
          </Card>
          <Card>
            <VerticalStack gap="5">
              <Text as="h2" variant="headingMd">
                Contextual save bar
              </Text>
              <Text as="p" variant="bodyMd">
                Render a contextual save bar above the admin top bar
              </Text>
              <Button onClick={() => setShowContextualSaveBar(true)}>
                Show
              </Button>
              <ContextualSaveBar
                saveAction={{
                  disabled: false,
                  loading: false,
                  onAction: () => setShowContextualSaveBar(false),
                }}
                discardAction={{
                  disabled: false,
                  loading: false,
                  onAction: () => setShowContextualSaveBar(false),
                }}
                fullWidth
                leaveConfirmationDisable
                visible={showContextualSaveBar}
              />
            </VerticalStack>
          </Card>
          <Card>
            <VerticalStack gap="5">
              <Text as="h2" variant="headingMd">
                Toast
              </Text>
              <Text as="p" variant="bodyMd">
                The toast action set displays a non-disruptive message that
                appears at the bottom of the interface to provide quick and
                short feedback on the outcome of an action.
              </Text>
              <Button
                onClick={() =>
                  (window as unknown as any)?.shopify.toast.show("Hello world")
                }
              >
                Launch toast
              </Button>
            </VerticalStack>
          </Card>
          <Card>
            <VerticalStack gap="5">
              <Text as="h2" variant="headingMd">
                Resource Picker
              </Text>
              <Text as="p" variant="bodyMd">
                The resource picker provides a search-based interface to help
                users find and select one or more products, collections, or
                product variants, and then returns the selected resources to
                your app.
              </Text>
              <Button
                onClick={() => setShowResourcePicker(!showResourcePicker)}
              >
                Pick a product
              </Button>
              <ResourcePicker
                resourceType="Product"
                onSelection={selectProduct}
                onCancel={() => setShowResourcePicker(false)}
                open={showResourcePicker}
              />
            </VerticalStack>
          </Card>
          <Card>
            <VerticalStack gap="5">
              <Text as="h2" variant="headingMd">
                Loading state
              </Text>
              <Text as="p" variant="bodyMd">
                The loading state indicates to users that a page is loading or
                an upload is processing.
              </Text>
              <Button onClick={toggleLoading}>Toggle loading</Button>
            </VerticalStack>
          </Card>
        </HorizontalGrid>
      </VerticalStack>
    </Page>
  );
}
