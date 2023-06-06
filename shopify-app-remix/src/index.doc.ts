import { ReferenceEntityTemplateSchema } from "@shopify/generate-docs";
// import { ReferenceEntityTemplateSchema } from "node_modules/@shopify/generate-docs";

// Order of data shape mimics visual structure of page
// Anything in an array can have multiple objects

const data: ReferenceEntityTemplateSchema = {
  name: "shopifyApp",
  description: "Main entrypoint into the package",
  type: "function",
  isVisualComponent: false,
  definitions: [
    {
      title: "Parameters",
      description: "Accepted configuration",
      type: "AppConfigArg",
    },
    {
      title: "Returns",
      description: "Object returned by the `shopifyApp` function",
      type: "ShopifyApp",
    },
  ],
  category: "shopify-app-remix",
  related: [
    {
      name: "authenticate.admin",
      url: "/docs/api/shopify-app-remix/shopify-app-remix/admin/authenticate",
      type: "function",
    },
    {
      name: "authenticate.storefront",
      url: "/docs/api/shopify-app-remix/shopify-app-remix/storefront/storefront",
      type: "function",
    },
    {
      name: "authenticate.webhook",
      url: "/docs/api/shopify-app-remix/shopify-app-remix/webhook/webhook",
      type: "function",
    },
  ],
  defaultExample: {
    codeblock: {
      title: "shopifyApp",
      tabs: [
        {
          code: "./index.example.min.ts",
          language: "typescript",
          title: "TypeScript",
        },
      ],
    },
  },
  examples: {
    description: "Configuration examples",
    examples: [
      {
        codeblock: {
          title: "shopifyApp - full configuration",
          tabs: [
            {
              code: "./index.example.full.ts",
              language: "typescript",
              title: "TypeScript",
            },
          ],
        },
      },
    ],
  },
};

export default data;
