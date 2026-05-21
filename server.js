import express from "express";
import compression from "compression";
import { createRequestHandler } from "@react-router/express";
import path from "path";
import { fileURLToPath } from "url";

import * as build from "./build/server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(compression());

app.use(
  "/assets",
  express.static(path.join(__dirname, "build/client/assets"), {
    immutable: true,
    maxAge: "1y",
  }),
);
app.use(express.static("build/client", { maxAge: "1h" }));

const port = process.env.PORT || 3000;

// Logging which store is running
console.log(`🛒 Starting Shopify React Router App at ${process.env.HN_API_APP_SITE}`);
console.log("Shop:", process.env.SHOP);
console.log("Store App Site:", process.env.SHOPIFY_STORE);
console.log("GraphQL Endpoint:", process.env.HN_GRAPHQL_ENDPOINT);
console.log("Port:", port);

app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  }),
);

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
