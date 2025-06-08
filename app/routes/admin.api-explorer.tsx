import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { AdminLayout } from '~/components/admin/AdminLayout';
import { ShopifyApiExplorer } from '~/components/admin/ShopifyApiExplorer';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  return json({
    title: 'Shopify API Explorer',
    description: 'Browse and explore Shopify Admin API endpoints with interactive documentation',
  });
};

export default function ApiExplorerPage() {
  const { title, description } = useLoaderData<typeof loader>();

  return (
    <AdminLayout title={title} description={description}>
      <ShopifyApiExplorer />
    </AdminLayout>
  );
} 