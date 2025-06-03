import type { HeadersFunction } from "@remix-run/node";
import { Link, Outlet, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";

export const links = () => [];

export default function App() {
  return (
    <>
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </ui-nav-menu>
      <Outlet />
    </>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
