import { LoaderArgs } from "@remix-run/node";

import { authenticator } from "../../shopify/authenticator.server";

export async function loader({ request }: LoaderArgs) {
  return authenticator.authenticate("shopify-app", request);
}
