/**
 * Admin Layout - Main layout for all admin pages
 * Provides Polaris styling, App Bridge integration, and navigation
 */

import { Outlet, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { AppProvider } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { AdminLayout } from "~/components/admin/AdminLayout";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  return {
    shop: session.shop,
    apiKey: process.env.SHOPIFY_API_KEY || "",
  };
}

export default function AdminRoot() {
  const { shop, apiKey } = useLoaderData<typeof loader>();
  
  return (
    <AppProvider
      i18n={{
        Polaris: {
          Common: {
            checkbox: "checkbox",
          },
          Page: {
            Header: {
              rollup: {
                toggleRollup: "Toggle rollup",
              },
            },
          },
        },
      }}
    >
      <AdminLayout shop={shop} apiKey={apiKey}>
        <Outlet />
      </AdminLayout>
    </AppProvider>
  );
} 