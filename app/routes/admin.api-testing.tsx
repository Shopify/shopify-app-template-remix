import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { AdminLayout } from '~/components/admin/AdminLayout';
import { ApiTestingSuite } from '~/components/admin/ApiTestingSuite';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  return json({
    title: 'API Testing Suite',
    description: 'Test and debug Shopify APIs with interactive tools',
  });
};

export default function ApiTestingPage() {
  const { title, description } = useLoaderData<typeof loader>();

  return (
    <AdminLayout title={title} description={description}>
      <ApiTestingSuite />
    </AdminLayout>
  );
} 