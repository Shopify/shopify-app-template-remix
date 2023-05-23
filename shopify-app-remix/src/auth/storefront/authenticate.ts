import { BasicParams } from "../../types";

import { StorefrontContext } from "./types";
import {
  getSessionTokenHeader,
  rejectBotRequest,
  validateSessionToken,
} from "../helpers";

export function authenticateStorefrontFactory(params: BasicParams) {
  return async function authenticateStorefront(
    request: Request
  ): Promise<StorefrontContext> {
    const { logger } = params;

    rejectBotRequest(params, request);

    const sessionTokenHeader = getSessionTokenHeader(request);

    logger.info("Authenticating storefront request");

    if (!sessionTokenHeader) {
      logger.debug("Request did not contain a session token");
      throw new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    return {
      sessionToken: await validateSessionToken(params, sessionTokenHeader),
    };
  };
}
