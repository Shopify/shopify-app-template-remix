export function getSessionTokenHeader(request: Request): string | undefined {
  return request.headers.get("authorization")?.replace("Bearer ", "");
}
