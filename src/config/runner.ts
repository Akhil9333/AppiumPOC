import type { MobilePlatform } from './mobileSessionInit.js';

export const scenarios = {
  'loginAndLogout': { file: 'login-logout.spec.ts', name: 'Login and Logout Functionality Test' },
  'lockout': { file: 'incorrect-password-lockout.spec.ts', name: '5 Times Incorrect Password Test' },
  'mha-low-risk': { file: 'mha-low-risk.spec.ts', name: 'MHA Low Risk Assessment' },
  'mha-high-risk': { file: 'mha-high-risk.spec.ts', name: 'MHA High Risk Assessment' },
  'screening': { file: 'screening-vaccination.spec.ts', name: 'Screening Vaccination Form Submission' }
} as const;

export type Scenario = keyof typeof scenarios;

export const suites = {
  smoke: [
    `./tests/testScenarios/${scenarios.loginAndLogout.file}`,
    `./tests/testScenarios/${scenarios['mha-high-risk'].file}`
  ],
  regression: [
    `./tests/testScenarios/${scenarios.lockout.file}`,
    `./tests/testScenarios/${scenarios['mha-low-risk'].file}`
  ]
};

export function resolveScenario(value: string, platform: MobilePlatform): Scenario {
  if (value === 'loginAndLogout') {
    return 'loginAndLogout';
  }
  if (!Object.hasOwn(scenarios, value)) {
    throw new Error(`Unsupported LT_SCENARIO "${value}". Choose one of: loginAndLogout, ${Object.keys(scenarios).join(', ')}`);
  }
  return value as Scenario;
}
