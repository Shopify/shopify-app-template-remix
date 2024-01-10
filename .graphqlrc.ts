import fs from "fs";

import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApiProject, ApiType } from "@shopify/api-codegen-preset";

function getConfig() {
  const config = {
    // For syntax highlighting / auto-complete when writing operations
    schema: `https://shopify.dev/admin-graphql-direct-proxy/${LATEST_API_VERSION}`,
    documents: ["./app/**/*.{js,ts,jsx,tsx}"],
    projects: {
      // To produce variable / return types for Admin API operations
      default: shopifyApiProject({
        apiType: ApiType.Admin,
        apiVersion: LATEST_API_VERSION,
        documents: ["./app/**/*.{js,ts,jsx,tsx}"],
        outputDir: "./app/types",
      }),
    },
  };

  let extensions: string[] = [];
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
