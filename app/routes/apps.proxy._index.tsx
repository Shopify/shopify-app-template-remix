import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { liquid } = await authenticate.public.appProxy(request);

  return liquid(`
  <form method="post" action="/apps/proxy/review/">
    <label>
      Product:
      <input type="text" name="product" />
    </label>
    <label>
      Review:
      <input type="text" name="review" />
    </label>
    <input type="submit" value="Review" />
  </form>
  `);
};
