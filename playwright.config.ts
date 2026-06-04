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
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx next dev -p 3090",
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
