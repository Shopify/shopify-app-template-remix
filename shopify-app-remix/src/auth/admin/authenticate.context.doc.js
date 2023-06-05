"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { ReferenceEntityTemplateSchema } from "node_modules/@shopify/generate-docs";
// Order of data shape mimics visual structure of page
// Anything in an array can have multiple objects
const data = {
    name: "API context",
    description: "Provides utilities for interacting with Shopify APIs",
    type: "interface",
    isVisualComponent: false,
    definitions: [
        {
            title: "AdminApiContext",
            description: "Admin API context",
            type: "AdminApiContext",
        },
    ],
    category: "shopify-app-remix",
    subCategory: "admin",
    related: [],
    defaultExample: {
        codeblock: {
            title: "admin",
            tabs: [
                {
                    code: "./authenticate.context.example.graphql.ts",
                    language: "typescript",
                    title: "TypeScript",
                },
            ],
        },
    },
    examples: {
        description: "Admin API Context examples",
        examples: [
            {
                description: "GraphQL API",
                codeblock: {
                    title: "GraphQL API",
                    tabs: [
                        {
                            title: "Admin GraphQL API",
                            language: "typescript",
                            code: "./authenticate.context.example.graphql.ts",
                        },
                    ],
                },
            },
            {
                description: "REST API",
                codeblock: {
                    title: "REST API",
                    tabs: [
                        {
                            title: "Admin REST API",
                            language: "typescript",
                            code: "./authenticate.context.example.rest.ts",
                        },
                    ],
                },
            },
            {
                description: "REST Resources",
                codeblock: {
                    title: "REST Resources",
                    tabs: [
                        {
                            title: "Admin REST API with resource classes",
                            language: "typescript",
                            code: "./authenticate.context.example.rest-resources.ts",
                        },
                    ],
                },
            },
        ],
    },
};
exports.default = data;
