/**
 * Products Management Page - Admin interface for managing store products
 * Features product listing, search, and basic CRUD operations
 */

import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  Badge,
  Avatar,
  EmptyState,
  Text,
  Filters,
  TextField,
  Select,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "~/shopify.server";
import { createApiClient, createShopifyApi } from "~/lib/api-client";
import { formatMoney, formatDate } from "~/lib/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const client = await createApiClient(request);
  const api = createShopifyApi(client);

  try {
    const productsData = await api.products.getProducts(50);
    
    return json({
      products: productsData?.data?.products?.edges || [],
    });
  } catch (error) {
    console.error("Products loader error:", error);
    return json({
      products: [],
    });
  }
}

export default function ProductsPage() {
  const { products } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter products based on search and status
  const filteredProducts = products.filter((edge: any) => {
    const product = edge.node;
    const matchesSearch = product.title.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Prepare data for DataTable
  const rows = filteredProducts.map((edge: any) => {
    const product = edge.node;
    const image = product.images.edges[0]?.node;
    const variant = product.variants.edges[0]?.node;
    
    return [
      // Product image and name
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {image ? (
                     <Avatar source={image.url} size="md" />
        ) : (
          <Avatar size="md" />
        )}
        <div>
          <Text variant="bodyMd" fontWeight="semibold" as="span">
            {product.title}
          </Text>
          <Text variant="bodyMd" as="span" tone="subdued">
            {product.handle}
          </Text>
        </div>
      </div>,
      
      // Status
      <Badge
        tone={product.status === "ACTIVE" ? "success" : "warning"}
      >
        {product.status.toLowerCase()}
      </Badge>,
      
      // Price
      variant ? formatMoney(variant.price || "0") : "—",
      
      // Inventory
      variant ? (variant.inventoryQuantity || 0) : 0,
      
      // Created date
      formatDate(product.createdAt),
      
      // Actions
      <Button
        size="slim"
        onClick={() => navigate(`/admin/products/${product.id.split("/").pop()}`)}
      >
        Edit
      </Button>,
    ];
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchValue("");
    setStatusFilter("all");
  }, []);

  const filters = [
    {
      key: "status",
      label: "Status",
      filter: (
        <Select
          label="Status"
          labelHidden
          options={[
            { label: "All statuses", value: "all" },
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" },
            { label: "Archived", value: "archived" },
          ]}
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [];
  if (statusFilter !== "all") {
    appliedFilters.push({
      key: "status",
      label: `Status: ${statusFilter}`,
      onRemove: () => setStatusFilter("all"),
    });
  }

  return (
    <Page
      title="Products"
      subtitle={`${filteredProducts.length} products`}
      primaryAction={{
        content: "Add product",
        onAction: () => navigate("/admin/products/new"),
      }}
      secondaryActions={[
        {
          content: "Export",
          onAction: () => {
            // TODO: Implement export functionality
            console.log("Export products");
          },
        },
        {
          content: "Import",
          onAction: () => {
            // TODO: Implement import functionality
            console.log("Import products");
          },
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "16px" }}>
              <Filters
                queryValue={searchValue}
                filters={filters}
                appliedFilters={appliedFilters}
                onQueryChange={handleSearchChange}
                onQueryClear={() => setSearchValue("")}
                onClearAll={handleClearFilters}
                queryPlaceholder="Search products..."
              />
            </div>
            
            {filteredProducts.length > 0 ? (
              <DataTable
                columnContentTypes={[
                  "text", // Product
                  "text", // Status
                  "text", // Price
                  "numeric", // Inventory
                  "text", // Created
                  "text", // Actions
                ]}
                headings={[
                  "Product",
                  "Status",
                  "Price",
                  "Inventory",
                  "Created",
                  "Actions",
                ]}
                rows={rows}
                sortable={[false, true, true, true, true, false]}
                defaultSortDirection="descending"
                initialSortColumnIndex={4}
              />
            ) : searchValue || statusFilter !== "all" ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <EmptyState
                  heading="No products found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>
                    Try changing the filters or search term to find what you're looking for.
                  </p>
                  <Button onClick={handleClearFilters}>Clear filters</Button>
                </EmptyState>
              </div>
            ) : (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <EmptyState
                  heading="Add your first product"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  action={{
                    content: "Add product",
                    onAction: () => navigate("/admin/products/new"),
                  }}
                >
                  <p>
                    Products are the goods and services that you sell. 
                    Add your first product to get started.
                  </p>
                </EmptyState>
              </div>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 