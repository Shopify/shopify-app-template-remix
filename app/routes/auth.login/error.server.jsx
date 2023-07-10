import { LoginErrorType } from "@shopify/shopify-app-remix";

export function loginErrorMessage(loginErrors) {
  if (loginErrors) {
    switch (loginErrors.shop) {
      case LoginErrorType.MissingShop:
        return { errors: "Please enter your shop domain to log in" };
      case LoginErrorType.InvalidShop:
        return { errors: "Please enter a valid shop domain to log in" };
    }
  }
  return {};
}
