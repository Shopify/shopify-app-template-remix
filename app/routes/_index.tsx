import React from "react";

import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { loginErrorMessages, shopify } from "../shopify.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return null;
}

export async function action({ request }: ActionArgs) {
  const loginErrors = await shopify.login(request);

  return json({ errors: loginErrorMessages(loginErrors) });
}

export default function App() {
  return (
    <>
      <h1>Hello world!</h1>
      <p>Welcome to my app. You should use it because:</p>
      <ul>
        <li>Marketing bullet point 1</li>
        <li>Marketing bullet point 1</li>
        <li>Marketing bullet point 1</li>
      </ul>
      <Form method="post">
        <label>
          Shop domain
          <input type="text" name="shop" />
          <span>e.g: my-shop-domain.myshopify.com</span>
        </label>
        <button type="submit">Login</button>
      </Form>
    </>
  );
}
