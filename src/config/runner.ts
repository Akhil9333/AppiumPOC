import type { MobilePlatform } from './mobileSessionInit.js';

export const scenarios = {
  'loginAndLogout': { file: 'features/authentication/login-logout.spec.ts', name: 'Login and Logout Functionality Test', provisionMember: true },
  'lockout': { file: 'features/authentication/incorrect-password-lockout.spec.ts', name: '5 Times Incorrect Password Test', provisionMember: true },
  'mha-low-risk': { file: 'features/mha/mha-low-risk.spec.ts', name: 'MHA Low Risk Assessment', provisionMember: true },
  'mha-high-risk': { file: 'features/mha/mha-high-risk.spec.ts', name: 'MHA High Risk Assessment', provisionMember: true },
  'mha-unanswered': { file: 'features/mha/mha-unanswered.spec.ts', name: 'MHA Required Answer Validation', provisionMember: true },
  'mha-exit-partial': { file: 'features/mha/mha-exit-partial.spec.ts', name: 'MHA Exit Partial Assessment', provisionMember: true },
  'screening': { file: 'features/screening/screening-vaccination.spec.ts', name: 'Screening Vaccination Form Submission', provisionMember: true },
  'screening-negative': { file: 'features/screening/screening-vaccination-negative.spec.ts', name: 'Screening Vaccination Missing Proof Validation', provisionMember: true }
} as const;

export type Scenario = keyof typeof scenarios;

export const suites = {
  smoke: [
    `./tests/${scenarios.loginAndLogout.file}`,
    `./tests/${scenarios['mha-high-risk'].file}`
  ],
  regression: [
    `./tests/${scenarios.lockout.file}`,
    `./tests/${scenarios['mha-low-risk'].file}`
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
