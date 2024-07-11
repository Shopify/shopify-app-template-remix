import { createRequestHandler } from "@remix-run/express";
import express from "express";
import fs from "node:fs";
import https from "node:https";

const app = express();

const server = https.createServer(
    {
      key: fs.readFileSync("./localhost-key.pem"),
      cert: fs.readFileSync("./localhost.pem"),
    },
    app
  );

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true } })
      );

const build = viteDevServer
? () =>
    viteDevServer.ssrLoadModule(
    "virtual:remix/server-build"
    )
: await import("./build/server/index.js");

app.use(
    viteDevServer
      ? viteDevServer.middlewares
      : express.static("build/client")
  );

app.all("*", createRequestHandler({ build }));


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App listening on https://localhost:${port}`);
});
