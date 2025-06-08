/**
 * Admin Dashboard - Main landing page for admin interface
 * Shows key metrics, quick actions, and navigation cards
 */

import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  ButtonGroup,
  Divider,
  Grid,
  LegacyCard,
  ResourceList,
  Avatar,
  ResourceItem,

  Badge,
} from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { createApiClient, createShopifyApi } from "~/lib/api-client";

export async function loader({ request }: LoaderFunctionArgs) {
  const client = await createApiClient(request);
  const api = createShopifyApi(client);

  try {
    // Fetch basic shop and resource counts
    const [productsData, ordersData, customersData] = await Promise.all([
      api.products.getProducts(5), // Get first 5 products for preview
      api.orders.getOrders(5), // Get first 5 orders for preview
      api.customers.getCustomers(5), // Get first 5 customers for preview
    ]);

    return json({
      products: productsData?.data?.products?.edges || [],
      orders: ordersData?.data?.orders?.edges || [],
      customers: customersData?.data?.customers?.edges || [],
      shop: client.session.shop,
    });
  } catch (error) {
    console.error("Dashboard loader error:", error);
    return json({
      products: [],
      orders: [],
      customers: [],
      shop: client.session.shop,
    });
  }
}

export default function AdminDashboard() {
  const { products, orders, customers, shop } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Dashboard"
      subtitle={`Welcome to your ${shop} admin dashboard`}
      primaryAction={{
        content: "View all products",
        url: "/admin/products",
      }}
      secondaryActions={[
        {
          content: "Settings",
          url: "/admin/settings",
        },
      ]}
    >
      <Layout>
        {/* Quick Stats */}
        <Layout.Section>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}>
              <LegacyCard title="Products" sectioned>
                <Text variant="headingLg" as="h3">
                  {products.length}+
                </Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Total products in your store
                </Text>
              </LegacyCard>
            </Grid.Cell>
            
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}>
              <LegacyCard title="Orders" sectioned>
                <Text variant="headingLg" as="h3">
                  {orders.length}+
                </Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Recent orders received
                </Text>
              </LegacyCard>
            </Grid.Cell>
            
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}>
              <LegacyCard title="Customers" sectioned>
                <Text variant="headingLg" as="h3">
                  {customers.length}+
                </Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Registered customers
                </Text>
              </LegacyCard>
            </Grid.Cell>
          </Grid>
        </Layout.Section>

        {/* Quick Actions */}
        <Layout.Section>
          <Card>
            <div style={{ padding: "20px" }}>
              <Text variant="headingMd" as="h2">
                Quick Actions
              </Text>
              <div style={{ marginTop: "16px" }}>
                <ButtonGroup>
                  <Button url="/admin/products/new" variant="primary">
                    Add Product
                  </Button>
                  <Button url="/admin/orders">
                    View Orders
                  </Button>
                  <Button url="/admin/customers">
                    Manage Customers
                  </Button>
                  <Button url="/admin/analytics">
                    View Analytics
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Grid>
            {/* Recent Products */}
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <Card>
                <div style={{ padding: "20px" }}>
                  <Text variant="headingMd" as="h2">
                    Recent Products
                  </Text>
                  {products.length > 0 ? (
                    <div style={{ marginTop: "16px" }}>
                      <ResourceList
                        resourceName={{ singular: "product", plural: "products" }}
                        items={products.map((edge: any) => ({
                          id: edge.node.id,
                          name: edge.node.title,
                          status: edge.node.status,
                          image: edge.node.images.edges[0]?.node.url,
                        }))}
                        renderItem={(item) => {
                          const { id, name, status, image } = item;
                          const media = image ? (
                            <Avatar customer size="md" source={image} />
                          ) : (
                            <Avatar customer size="md" />
                          );

                          return (
                            <ResourceItem
                              id={id}
                              media={media}
                              accessibilityLabel={`View details for ${name}`}
                              onClick={() => {}}
                            >
                              <Text variant="bodyMd" fontWeight="semibold" as="h3">
                                {name}
                              </Text>
                              <Badge
                                tone={status === "ACTIVE" ? "success" : "warning"}
                              >
                                {status.toLowerCase()}
                              </Badge>
                            </ResourceItem>
                          );
                        }}
                      />
                      <div style={{ marginTop: "16px", textAlign: "center" }}>
                        <Button url="/admin/products">View all products</Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        No products found. Create your first product to get started.
                      </Text>
                      <div style={{ marginTop: "12px" }}>
                        <Button url="/admin/products/new" variant="primary">
                          Create Product
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Grid.Cell>

            {/* Recent Orders */}
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <Card>
                <div style={{ padding: "20px" }}>
                  <Text variant="headingMd" as="h2">
                    Recent Orders
                  </Text>
                  {orders.length > 0 ? (
                    <div style={{ marginTop: "16px" }}>
                      <ResourceList
                        resourceName={{ singular: "order", plural: "orders" }}
                        items={orders.map((edge: any) => ({
                          id: edge.node.id,
                          name: edge.node.name,
                          customer: edge.node.customer?.firstName + " " + edge.node.customer?.lastName,
                          total: edge.node.totalPrice,
                          status: edge.node.financialStatus,
                        }))}
                        renderItem={(item) => {
                          const { id, name, customer, total, status } = item;

                          return (
                            <ResourceItem
                              id={id}
                              accessibilityLabel={`View details for ${name}`}
                              onClick={() => {}}
                            >
                              <Text variant="bodyMd" fontWeight="semibold" as="h3">
                                {name}
                              </Text>
                              <div>
                                <Text variant="bodyMd" as="span">{customer || "Guest"}</Text>
                                <Text variant="bodyMd" as="span"> • ${total}</Text>
                              </div>
                              <Badge
                                tone={status === "PAID" ? "success" : "warning"}
                              >
                                {status.toLowerCase()}
                              </Badge>
                            </ResourceItem>
                          );
                        }}
                      />
                      <div style={{ marginTop: "16px", textAlign: "center" }}>
                        <Button url="/admin/orders">View all orders</Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        No orders yet. Orders will appear here once customers start purchasing.
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            </Grid.Cell>
          </Grid>
        </Layout.Section>

        {/* App Features */}
        <Layout.Section>
          <Card>
            <div style={{ padding: "20px" }}>
              <Text variant="headingMd" as="h2">
                App Features
              </Text>
              <div style={{ marginTop: "16px" }}>
                <Grid>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 3, xl: 3 }}>
                    <div style={{ textAlign: "center", padding: "16px" }}>
                      <Text variant="headingSm" as="h3">
                        API Testing
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        Test Shopify APIs with built-in playground
                      </Text>
                      <div style={{ marginTop: "12px" }}>
                        <Button url="/admin/api-testing">Open Playground</Button>
                      </div>
                    </div>
                  </Grid.Cell>
                  
                  <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 3, xl: 3 }}>
                    <div style={{ textAlign: "center", padding: "16px" }}>
                      <Text variant="headingSm" as="h3">
                        Preview System
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        Preview your app components in development
                      </Text>
                      <div style={{ marginTop: "12px" }}>
                        <Button external url="http://localhost:3002">Open Preview</Button>
                      </div>
                    </div>
                  </Grid.Cell>
                  
                  <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 3, xl: 3 }}>
                    <div style={{ textAlign: "center", padding: "16px" }}>
                      <Text variant="headingSm" as="h3">
                        Storybook
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        Component library and design system
                      </Text>
                      <div style={{ marginTop: "12px" }}>
                        <Button external url="http://localhost:6006">Open Storybook</Button>
                      </div>
                    </div>
                  </Grid.Cell>
                  
                  <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 3, xl: 3 }}>
                    <div style={{ textAlign: "center", padding: "16px" }}>
                      <Text variant="headingSm" as="h3">
                        Development Tools
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        Logs, debugging, and development utilities
                      </Text>
                      <div style={{ marginTop: "12px" }}>
                        <Button url="/admin/dev-tools">Open Tools</Button>
                      </div>
                    </div>
                  </Grid.Cell>
                </Grid>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 