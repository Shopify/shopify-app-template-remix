const fs = require("node:fs");
const apiVersion = require("@shopify/shopify-app-remix").LATEST_API_VERSION;

function getConfig() {
  const config = {
    projects: {
      // Storefront API
      // Here is the config to tell graphql.vscode-graphql to use the storefront GraphQL Schema
      // Steps:
      // 1. Uncomment lines 14-17 (the shopifyStorefrontApi property)
      // 2. Update the documents array to point to files that use the storefront API
      // Do not mix and match storefront and admin API documents in the same file.
      // If a route needs both APIs, create a separate file for each API.
      // shopifyStorefrontApi: {
      //   schema: `https://shopify.dev/storefront-graphql-direct-proxy/${apiVersion}`,
      //   documents: ["./app/routes/app.storefront.jsx"],
      // },
      shopifyAdminApi: {
        schema: `https://shopify.dev/admin-graphql-direct-proxy/${apiVersion}`,
        documents: ["./app/**/*.{graphql,js,ts,jsx,tsx}"],
      },
    },
  };

  let extensions = [];
  try {
    extensions = fs.readdirSync("./extensions");
  } catch {
    // ignore if no extensions
  }

  for (const entry of extensions) {
    const extensionPath = `./extensions/${entry}`;
    const schema = `${extensionPath}/schema.graphql`;
    if (!fs.existsSync(schema)) {
      continue;
    }
    config.projects[entry] = {
      schema,
      documents: [`${extensionPath}/**/*.graphql`],
    };
  }

  return config;
}

module.exports = getConfig();
