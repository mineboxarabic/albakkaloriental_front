import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://localhost:3090",
    trace: "on-first-retry",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.PLAYWRIGHT_PRODUCTION
      ? "npx next start -H 127.0.0.1 -p 3090"
      : "npx next dev -H 127.0.0.1 -p 3090",
    env: {
      PORT: "3090",
      BACKEND_URL: "http://localhost:3091",
      NEXT_PUBLIC_BACKEND_URL: "http://localhost:3091",
    },
    url: "http://localhost:3090",
    reuseExistingServer: false,
    stdout: "ignore",
    stderr: "pipe",
  },
});
