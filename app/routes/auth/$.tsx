import { LoaderArgs } from "@remix-run/node";

import { app } from "../../shopify/app.server";

export async function loader({ request }: LoaderArgs) {
  return app.authenticate.oauth(request);
}
