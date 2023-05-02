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
