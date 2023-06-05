import { ReferenceEntityTemplateSchema } from "@shopify/generate-docs";
// import { ReferenceEntityTemplateSchema } from "node_modules/@shopify/generate-docs";

// Order of data shape mimics visual structure of page
// Anything in an array can have multiple objects

const data: ReferenceEntityTemplateSchema = {
  name: "Authenticate",
  description: "Authenticates requests from the Shopify admin",
  type: "function",
  isVisualComponent: false,
  definitions: [
    {
      title: "admin",
      description: "Admin authentication",
      type: "AuthenticateAdmin",
    },
    {
      title: "Return",
      description: "Object returned by the `admin` function",
      type: "AdminContext",
    },
  ],
  category: "shopify-app-remix",
  subCategory: "admin",
  related: [
    {
      name: "authenticate.admin",
      url: "/docs/api/shopify-app-remix/shopify-app-remix/admin/api-context",
    },
  ],
  defaultExample: {
    codeblock: {
      title: "authenticate.admin",
      tabs: [
        {
          code: "./authenticate.example.ts",
          language: "typescript",
          title: "TypeScript",
        },
      ],
    },
  },
};

export default data;
