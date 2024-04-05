import fs from "fs";
import { shopifyApiProject, ApiType } from "@shopify/api-codegen-preset";
import { apiVersion } from "./app/shopify.server";
function getConfig() {
  const config = {
    projects: {
      default: shopifyApiProject({
        apiType: ApiType.Admin,
        apiVersion: apiVersion,
        documents: ["./app/**/*.{js,ts,jsx,tsx}"],
        outputDir: "./app/types",
      }),
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
