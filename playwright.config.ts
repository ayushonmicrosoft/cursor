import { defineConfig, devices } from '@playwright/test'

const browserstackUsername = process.env.BROWSERSTACK_USERNAME
const browserstackAccessKey = process.env.BROWSERSTACK_ACCESS_KEY
const useBrowserStack = Boolean(browserstackUsername && browserstackAccessKey)
const useBrowserStackLocal = process.env.BROWSERSTACK_LOCAL !== 'false'
const enablePercy = process.env.BROWSERSTACK_PERCY === 'true'

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: useBrowserStack
    ? [
        {
          name: 'bs-chrome',
          use: {
            ...devices['Desktop Chrome'],
            browserName: 'chromium',
            channel: undefined,
            launchOptions: {
              args: [
                `--browserstack.username=${browserstackUsername}`,
                `--browserstack.accessKey=${browserstackAccessKey}`,
                ...(useBrowserStackLocal ? ['--browserstack.local=true'] : []),
                ...(enablePercy ? ['--browserstack.percy=true'] : []),
              ],
            },
          },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ],
})
