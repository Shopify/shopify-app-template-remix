const dotenv = require("dotenv");

dotenv.config();


const APP_NAME = process.env.APP_NAME || "app";
const PREFIXES = ["HNUK", "HNIE"];


const nonSiteEnvVars = {
  VITE_PRIVILEGE_ENCRYPTION_KEY: process.env.VITE_PRIVILEGE_ENCRYPTION_KEY,
};

const generateSiteEnv = (prefix) => {
  const siteCode = prefix.toLowerCase();
  return {
    ...nonSiteEnvVars,
    PORT: process.env[`${prefix}_PORT`],
    NODE_ENV: "production",
    SHOP: process.env[`${prefix}_SHOP`],
    APPLICATION_ID: process.env[`${prefix}_APPLICATION_ID`],
    REDIS_CONNECTION_URL: process.env[`${prefix}_REDIS_CONNECTION_URL`],

    SHOPIFY_API_KEY: process.env[`${prefix}_SHOPIFY_API_KEY`],
    SHOPIFY_API_SECRET: process.env[`${prefix}_SHOPIFY_API_SECRET`],
    SHOPIFY_APP_URL: process.env[`${prefix}_SHOPIFY_APP_URL`],

    HN_API_APP_SITE: siteCode,
    HN_GRAPHQL_ENDPOINT: process.env[`${prefix}_GRAPHQL_ENDPOINT`],
    HN_GRAPHQL_API_KEY: process.env[`${prefix}_GRAPHQL_API_KEY`],
    HN_API_ENDPOINT: process.env[`${prefix}_API_ENDPOINT`] ,
    HN_API_ENDPOINT_KEY: process.env[`${prefix}_API_ENDPOINT_KEY`] ,
  };
};

module.exports = {
  apps: PREFIXES.map((prefix) => ({
    name: `${APP_NAME}-${prefix.toLowerCase()}`,
    script: "server.js",
    cwd: "./",
    exec_mode: "cluster",
    instances: parseInt(process.env.PM2_INSTANCES) || 3,
    autorestart: "true" === process.env.PM2_AUTORESTART ? true : false,
    restart_delay: parseInt(process.env.PM2_RESTART_DELAY) || 5000,
    kill_timeout: parseInt(process.env.PM2_KILL_TIMEOUT) || 5000,
    max_memory_restart: process.env.PM2_MAX_MEMORY_RESTART || "600M",
    max_restarts: parseInt(process.env.PM2_MAX_RESTARTS) || 10,
    env: generateSiteEnv(prefix),
  })),
};
 