import { LoginErrorType } from "@shopify/shopify-app-remix";

export function loginErrorMessage(loginErrors) {
  const errors = { shop: "" };

  if (loginErrors) {
    switch (loginErrors.shop) {
      case LoginErrorType.MissingShop:
        errors.shop = "Please enter your shop domain to log in";
        break;
      case LoginErrorType.InvalidShop:
        errors.shop = "Please enter a valid shop domain to log in";
        break;
    }
  }

  return errors;
}
