import { LoginErrorType } from "@shopify/shopify-app-remix";

export function loginErrorMessage(loginErrors) {
  if (loginErrors) {
    switch (loginErrors.shop) {
      case LoginErrorType.MissingShop:
        return { shop: "Please enter your shop domain to log in" };
      case LoginErrorType.InvalidShop:
        return { shop: "Please enter a valid shop domain to log in" };
    }
  }
  return {};
}
