import dotenv from "dotenv";
import { defineConfig, devices } from "@playwright/test";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: "list",
  timeout: 120000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "https://plantelboard.vercel.app",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
