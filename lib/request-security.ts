export function isSameOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return false;
  return request.headers.get("sec-fetch-site") !== "cross-site";
}

export function crossSiteResponse() {
  return Response.json({ error: "Cross-site request rejected." }, { status: 403 });
}
