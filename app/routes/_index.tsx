import React from "react";

import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
  type LinksFunction,
} from "@remix-run/node";
import { Form } from "@remix-run/react";

import { shopify } from "../shopify.server";
import { loginErrorMessage } from "../i18n/helpers.server";

import indexStyles from "../_index.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: indexStyles },
];

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return null;
}

export async function action({ request }: ActionArgs) {
  const loginErrors = await shopify.login(request);

  return json({ errors: loginErrorMessage(loginErrors) });
}

export default function App() {
  return (
    <div className="index">
      <div className="content">
        <h1>A short tagline about [your app]</h1>
        <p>A tagline about [your app] to convert your customers.</p>
        <Form method="post" action="app/auth/login">
          <label>
            <span>shop domain</span>
            <input type="text" name="shop" />
            <span>e.g: my-shop-domain.myshopify.com</span>
          </label>
          <button type="submit">Try it</button>
        </Form>
        <ul>
          <li>
            <strong>Value prop</strong>. Some detail about your value prop that
            convinces your customer.
          </li>
          <li>
            <strong>Value prop</strong>. Some detail about your value prop that
            convinces your customer.
          </li>
          <li>
            <strong>Value prop</strong>. Some detail about your value prop that
            convinces your customer.
          </li>
        </ul>
      </div>
    </div>
  );
}
