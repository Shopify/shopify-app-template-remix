import { BasicParams } from "../../types";

import { PublicContext } from "./types";
import {
  getSessionTokenHeader,
  rejectBotRequest,
  validateSessionToken,
} from "../helpers";

export function authenticatePublicFactory(params: BasicParams) {
  return async function authenticatePublic(
    request: Request
  ): Promise<PublicContext> {
    const { logger } = params;

    rejectBotRequest(params, request);

    const sessionTokenHeader = getSessionTokenHeader(request);

    logger.info("Authenticating public request");

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
