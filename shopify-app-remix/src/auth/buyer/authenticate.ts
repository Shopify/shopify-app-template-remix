import { BasicParams } from "../../types";

import { BuyerContext } from "./types";
import {
  getSessionTokenHeader,
  rejectBotRequest,
  validateSessionToken,
} from "../helpers";

export function authenticateBuyerFactory(params: BasicParams) {
  return async function authenticateBuyer(
    request: Request
  ): Promise<BuyerContext> {
    const { logger } = params;

    rejectBotRequest(params, request);

    const sessionTokenHeader = getSessionTokenHeader(request);

    logger.info("Authenticating buyer request");

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
