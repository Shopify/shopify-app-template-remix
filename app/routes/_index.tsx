import React from "react";

import { type LoaderArgs, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return null;
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
      <Link to="/app">Go to the app</Link>
    </>
  );
}
