import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'company-contact.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:3190',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      args: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--use-gl=angle', '--use-angle=swiftshader'] : [],
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx next dev -H 127.0.0.1 -p 3190',
    url: 'http://127.0.0.1:3190',
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      BACKEND_URL: 'http://127.0.0.1:3191',
      AUTH_SECRET: 'isolated-contact-test-secret-at-least-32-characters',
      COMPANY_EMAIL: 'env@example.com',
      WHATSAPP_NUMBER: '33711111111',
      NEXT_FONT_GOOGLE_MOCKED_RESPONSES: resolve(__dirname, 'e2e/google-fonts.cjs'),
    },
  },
});
