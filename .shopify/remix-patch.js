#!/usr/bin/env node
const {promises: fs} = require('fs');
const {fileURLToPath} = require('url');
const {join: joinPath} = require('path');

(async () => {
  const packageJsonPath = joinPath(__dirname, '../node_modules/@shopify/cli/package.json')
  let packageJsonData = await fs.readFile(packageJsonPath)
  let packageJson = JSON.parse(packageJsonData)
  packageJson = {
    ...packageJson,
    oclif: {
      ...packageJson.oclif,
      plugins: [...packageJson.oclif.plugins, '@shopify/remix-app'],
    },
  }
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
})()
