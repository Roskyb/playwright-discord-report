# Playwright Discord Reporter

**Playwright Discord Reporter** is a package designed to integrate Playwright automated testing with Discord. This package allows you to report the results of your automated tests directly to a Discord channel, making it easier to monitor results and collaborate with your team.

## Installation

You can install the package using npm:

```bash
npm install playwright-discord-reporter
```

## Configuration
```bash
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['playwright-discord-reporter', {
    webhookUrl: '<your_discord_webhookUrl>'
  }]],
  ...
```