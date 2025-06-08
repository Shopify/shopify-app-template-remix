import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { AdminLayout } from '~/components/admin/AdminLayout';
import { WebhookTester } from '~/components/admin/WebhookTester';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  return json({
    title: 'Webhook Tester',
    description: 'Test and debug Shopify webhooks with payload simulation and endpoint management',
  });
};

export default function WebhookTesterPage() {
  const { title, description } = useLoaderData<typeof loader>();

  return (
    <AdminLayout title={title} description={description}>
      <WebhookTester />
    </AdminLayout>
  );
} 