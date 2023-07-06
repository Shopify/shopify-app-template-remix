import { shopify } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await shopify.authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      await db.session.deleteMany({ where: { shop } });
      break;
    case "PRODUCTS_UPDATE":
      await db.qRCode.updateMany({
        where: { productId: payload.admin_graphql_api_id },
        data: {
          productTitle: payload.title,
          productHandle: payload.handle,
          productVariantId: payload.variants[0].admin_graphql_api_id,
          productImage: payload.image?.src,
          productAlt: payload.image?.alt,
        },
      });
      break;
    case "PRODUCTS_DELETE":
      await db.qRCode.updateMany({
        where: { productId: payload.admin_graphql_api_id },
        data: {
          productDeleted: true,
        },
      });
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
