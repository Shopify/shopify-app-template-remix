import { LandingTemplateSchema } from "@shopify/generate-docs";

const data: LandingTemplateSchema = {
  title: "Shopify App Remix",
  description: "Shopify App Remix is awesome",
  id: "shopify-app-remix",
  sections: [
    {
      type: "Generic",
      anchorLink: "awesome-package",
      sectionContent: "It uses Remix!",
      title: "Shopify App Remix is awesome",
    },
    {
      type: "Resource",
      anchorLink: "shopify-app",
      title: "shopifyApp",
      resources: [
        {
          name: "shopifyApp",
          subtitle: "This is how you start using this package.",
          url: "/docs/api/shopify-app-remix/shopify-app-remix/shopifyapp",
          type: "component",
        },
      ],
    },
  ],
};

export default data;
