const fs = require('node:fs');
const apiVersion = require("@shopify/shopify-app-remix").LATEST_API_VERSION;

function getConfig() {
    const config = {
        projects: {
            shopifyAdminApi: {
                schema: `https://shopify.dev/admin-graphql-direct-proxy/${apiVersion}`,
                documents: ['./app/**/*.{graphql,js,ts,jsx,tsx}']
            }
        }
    }

    let extensions = []
    try {
        extensions = fs.readdirSync('./extensions');
    } catch {
        // ignore if no extensions
    }

    for (const entry of extensions) {
        const extensionPath = `./extensions/${entry}`;
        const schema = `${extensionPath}/schema.graphql`;
        if(!fs.existsSync(schema)) {
            continue;
        }
        config.projects[entry] = {
            schema,
            documents: [`${extensionPath}/input.graphql`]
        }
    }

    return config;
}

module.exports = getConfig();
