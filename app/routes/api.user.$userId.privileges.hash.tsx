import type { LoaderFunctionArgs } from "react-router";
import { getUserPrivilegesHash } from "../services/hn.services";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  try {
    const userId = params.userId;

    if (!userId) {
      throw new Error("User ID is required.");
    }

    const appId = process.env.APPLICATION_ID;

    if (!appId) {
      throw new Error("Application ID is not set.");
    }

    const hash = await getUserPrivilegesHash(userId, appId);

    return Response.json({
      status: 200,
      hash,
    });
  } catch (error: any) {
    return Response.json({ status: 500, message: error.message });
  }
};
