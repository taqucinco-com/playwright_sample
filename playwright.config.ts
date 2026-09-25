import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results", // default
  fullyParallel: true,
  retries: 0, // default
  timeout: 30_000, // default: テスト1件あたりのタイムアウト(ms)
  reporter: [["html", { outputFolder: "playwright-report" }]], // outputFolder は default
  expect: {
    timeout: 5_000, // default: expect() アサーションのタイムアウト(ms)
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on",
    video: "on",
    screenshot: "on",
    headless: true, // default
    viewport: { width: 1280, height: 720 }, // default
    actionTimeout: 0, // default: 無制限(testのtimeoutに従う)
    navigationTimeout: 0, // default
    ignoreHTTPSErrors: false, // default
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000, // default: サーバー起動待ちのタイムアウト(ms)
  },
});
