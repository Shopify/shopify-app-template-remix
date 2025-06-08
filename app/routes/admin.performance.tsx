/**
 * Admin Performance Monitor Route
 * Provides access to the comprehensive performance monitoring dashboard
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { AdminLayout } from '~/components/admin/AdminLayout';
import { PerformanceMonitor } from '~/components/admin/PerformanceMonitor';

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({});
}

export default function AdminPerformancePage() {
  return (
    <AdminLayout>
      <PerformanceMonitor />
    </AdminLayout>
  );
} 