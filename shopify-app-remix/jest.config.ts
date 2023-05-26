import type { Config } from "jest";

const config: Config = {
  // or other ESM presets
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  watchPathIgnorePatterns: ["./node_modules"],
  testRegex: ".*\\.test\\.tsx?$",
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  coveragePathIgnorePatterns: ["<rootDir>/src/(.+/)?__tests__"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup-jest.ts"],
};

export default config;
