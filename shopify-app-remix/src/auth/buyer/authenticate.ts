import isbot from "isbot";

import { BasicParams } from "../../types";

import { BuyerContext } from "./types";
import { validateSessionToken } from "../helpers/validate-session-token";

export function authenticateBuyerFactory(params: BasicParams) {
  return async function authenticateBuyer(
    request: Request
  ): Promise<BuyerContext> {
    const { logger } = params;

    if (isbot(request.headers.get("User-Agent"))) {
      logger.debug("Request is from a bot, skipping auth");
      throw new Response(undefined, { status: 400, statusText: "Bad Request" });
    }

    const sessionTokenHeader = request?.headers
      ?.get("authorization")
      ?.replace("Bearer ", "");

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
