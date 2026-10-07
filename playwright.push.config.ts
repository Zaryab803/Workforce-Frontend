import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  testMatch: "**/push.spec.ts",
  use: { ...base.use, baseURL: "http://localhost:3108" },
  webServer: {
    command: "npm run start -- --port 3108",
    url: "http://localhost:3108/login",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
