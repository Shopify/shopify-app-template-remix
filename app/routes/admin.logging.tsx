import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { AdminLayout } from '~/components/admin/AdminLayout';
import { LoggingSystem } from '~/components/admin/LoggingSystem';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({
    title: "Development Logging",
    description: "Real-time logging and debugging system for your Shopify app"
  });
};

export default function LoggingPage() {
  const { title, description } = useLoaderData<typeof loader>();

  return (
    <AdminLayout title={title} description={description}>
      <LoggingSystem />
    </AdminLayout>
  );
} 