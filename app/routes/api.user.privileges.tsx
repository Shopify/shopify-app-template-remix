import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import {
  getCurrentUser,
  getUserPrivileges,
  getUserPrivilegesHash,
} from "../services/hn.services";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const userData = await getCurrentUser(request);
    const privilegesData: any = await getUserPrivileges(userData.user);
    return Response.json(privilegesData);
  } catch (error: any) {
    return Response.json({ status: 500, message: error.message });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const data = await request.json();
    const { userId, appId } = data;
    const hash = await getUserPrivilegesHash(userId, appId);
    return Response.json({
      status: 200,
      hash,
    });
  } catch (error: any) {
    return Response.json({ status: 500, message: error.message });
  }
};
