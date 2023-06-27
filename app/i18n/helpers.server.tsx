import type { LoginError } from "@shopify/shopify-app-remix";
import { LoginErrorType } from "@shopify/shopify-app-remix";

export function loginErrorMessage(loginErrors: LoginError) {
  const errors = { shop: "" };

  if (loginErrors) {
    switch (loginErrors.shop) {
      case LoginErrorType.MissingShop:
        errors.shop = "App.Login.errors.missingShop";
        break;
      case LoginErrorType.InvalidShop:
        errors.shop = "App.Login.errors.invalidShop";
        break;
    }
  }

  return errors;
}
