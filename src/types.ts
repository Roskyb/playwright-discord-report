export type TestRunInfo = {
  testsInSuite: number;
  totalTestsRun: number;
  expectedResults: number;
  unexpectedResults: number;
  flakyTests: number;
  testMarkedSkipped: number;
  failureFree: boolean;
  durationCPU: number;
  durationSuite: number;
  avgTestDuration: number;
  formattedDurationSuite: string;
  formattedAvgTestDuration: string;
  failures: Record<string, string>;
  workers: number;
};
