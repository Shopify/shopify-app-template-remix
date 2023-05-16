// TODO: Document this properly somewhere. Where? We should discuss this issue with the CLI team.
// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
// Replace the HOST env var with SHOPIFY_APP_URL so that it doesn't break the remix server. The CLI will eventually
// stop passing in HOST, so we can remove this workaround after the next major release.
if (process.env.HOST) {
  const url = new URL(process.env.HOST);
  if (url.hostname === "localhost") {
    url.port = process.env.PORT;
  }

  process.env.SHOPIFY_APP_URL = url.origin;
  delete process.env.HOST;
}

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/"
};
