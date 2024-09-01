import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { Suite } from 'playwright/types/testReporter';
import { FullConfig } from '@playwright/test';
import { TestRunInfo } from './types';
import { sendMessageToDiscord } from './utils';
import { type APIEmbed, type RESTPostAPIWebhookWithTokenJSONBody } from 'discord-api-types/v10';

class PlaywrightDiscordReport implements Reporter {
  private startTime!: number;
  private endTime!: number;
  private webhookUrl!: string;

  private runInfo: TestRunInfo = {
    testsInSuite: 0,
    totalTestsRun: 0,
    expectedResults: 0,
    unexpectedResults: 0,
    flakyTests: 0,
    testMarkedSkipped: 0,
    failureFree: false,
    durationCPU: 0,
    durationSuite: 0,
    avgTestDuration: 0,
    formattedDurationSuite: '',
    formattedAvgTestDuration: '',
    failures: {},
    workers: 0,
  };

  constructor(options: { webhookUrl?: string } = {}) {
    if (!options.webhookUrl) {
      throw new Error('Discord Webhook URL is required');
    }
    this.webhookUrl = options.webhookUrl;
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.runInfo.testsInSuite = suite.allTests().length;
    this.runInfo.workers = config.workers;
  }

  printsToStdio() {
    return false;
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    const outcome = test.outcome();
    const { retry } = result;

    if (outcome === 'expected') this.runInfo.expectedResults += 1;
    if (outcome === 'skipped') this.runInfo.testMarkedSkipped += 1;
    if (outcome === 'flaky') this.runInfo.flakyTests += 1;
    if (outcome === 'unexpected') {
      this.runInfo.failures[test.title] = result.status;
      if (retry === 0) {
        this.runInfo.unexpectedResults += 1;
      }
    }
    this.runInfo.totalTestsRun += 1;
    this.runInfo.durationCPU += result.duration;
    this.runInfo.failureFree = this.runInfo.unexpectedResults - this.runInfo.flakyTests === 0;
  }

  async onEnd() {
    this.endTime = Date.now();
    this.runInfo.durationSuite = this.endTime - this.startTime;
    this.runInfo.avgTestDuration = Math.ceil(
      this.runInfo.durationCPU / (this.runInfo.totalTestsRun || 1)
    );
    await this.sendReportToDiscord();
  }

  buildDiscordMessage(runInfo: TestRunInfo): RESTPostAPIWebhookWithTokenJSONBody {
    const isPassed = runInfo.failureFree ? ':white_check_mark:' : ':x:';
    const embedColor = runInfo.failureFree ? 48028 : 16711680;
    const embed: APIEmbed = {
      title: `${isPassed} Test Report - ${new Date().toLocaleString()} `,
      color: embedColor,
      description: 'Playwright Test Report',
      footer: {
        icon_url: 'https://roskyb.github.io/playwright-discord-report/playwright-logo.png',
        text: 'Playwright Report',
      },
      thumbnail: {
        url: 'https://roskyb.github.io/playwright-discord-report/playwright-logo.png',
      },
      fields: [
        {
          name: 'Duration ⏱️',
          value: `${runInfo.formattedDurationSuite}`,
          inline: true,
        },
        {
          name: 'Total tests ℹ️',
          value: `${runInfo.testsInSuite}`,
          inline: true,
        },
        {
          name: 'Passed ✅',
          value: `${runInfo.expectedResults} `,
          inline: true,
        },
        {
          name: 'Failed ❗ ',
          value: `${runInfo.unexpectedResults}`,
          inline: true,
        },
        {
          name: 'Flaky 🔄',
          value: `${runInfo.flakyTests} `,
          inline: true,
        },
        {
          name: 'Skiped ⏭️',
          value: `${runInfo.testMarkedSkipped}`,
          inline: true,
        },
      ],
    };
    return {
      content: '',
      embeds: [embed],
    };
  }

  async sendReportToDiscord(): Promise<void> {
    const message = this.buildDiscordMessage(this.runInfo);
    await sendMessageToDiscord(this.webhookUrl, message);
  }
}

export default PlaywrightDiscordReport;
