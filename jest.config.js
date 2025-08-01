// import type { Config } from 'jest'
const nextJest = require("next/jest");
const defaults = require("jest-config");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "node",
  rootDir: "./",
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  collectCoverage: true,
  collectCoverageFrom: [
    "!**/*.{js,jsx,ts,tsx}",
    "**/graphql/resolvers/**/*.{js,jsx,ts,tsx}",
    "!**/components/ui/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/out/**",
    "!**/*.d.ts",
    "!**/graphql/resolvers/index.ts",
  ],
  testMatch: ["<rootDir>/specs/**/*.(test|spec).{js,jsx,ts,tsx}"],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "json", "html"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

module.exports = createJestConfig(config);
