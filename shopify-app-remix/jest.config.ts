import type { Config } from "jest";

const config: Config = {
  // or other ESM presets
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  watchPathIgnorePatterns: ["./node_modules"],
  testRegex: ".*\\.test\\.tsx?$",
};

export default config;
