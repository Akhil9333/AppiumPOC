import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { _setGlobal } from '@wdio/globals';
import { executionReporter } from '../../src/utils/ExecutionReporter.js';
import { MobileSession } from '../../src/utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { HealthyLivingScreen } from '../../src/pages/HealthyLivingScreen.js';
import { HomeScreen } from '../../src/pages/HomeScreen.js';
import { LoginScreen } from '../../src/pages/LoginScreen.js';
import { MHAQuestionsScreen } from '../../src/pages/MHAQuestionsScreen.js';
import { WelcomeScreen } from '../../src/pages/WelcomeScreen.js';
import { loginToHome } from '../helpers/genericFlow.js';

for (const platform of ['Android', 'iOS'] as const) {
  test(`shared ${platform} login preserves navigation, credentials, and home-screen settling`, async t => {
    const overrides = {
      PLATFORM: platform,
      LT_SCENARIO: 'login',
      APP_PASSWORD: 'validation-password',
      LT_WAIT_SECONDS: '10',
      LT_TEST_TIMEOUT_SECONDS: '20'
    };
    const previous = new Map(Object.keys(overrides).map(key => [key, process.env[key]]));
    Object.assign(process.env, overrides);
    t.after(() => {
      for (const [key, value] of previous) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    });

    const calls: string[] = [];
    const session = new MobileSession(platform);
    const healthyLivingScreen = new HealthyLivingScreen(session);
    const loginScreen = new LoginScreen(session);
    _setGlobal('browser', {
      pause: async (duration: number) => { calls.push(`pause:${duration}`); }
    });
    t.mock.method(executionReporter, 'log', () => {});
    t.mock.method(executionReporter, 'captureScreenshot', async (label: string) => {
      calls.push(`screenshot:${label}`);
      return undefined;
    });
    t.mock.method(WelcomeScreen.prototype, 'assertWelcomeMessage', async () => { calls.push('welcome'); });
    t.mock.method(WelcomeScreen.prototype, 'openHealthyLiving', async () => {
      calls.push('open-healthy-living');
      return healthyLivingScreen;
    });
    t.mock.method(HealthyLivingScreen.prototype, 'assertHealthyLivingMessage', async () => {
      calls.push('healthy-living');
    });
    t.mock.method(HealthyLivingScreen.prototype, 'openLogin', async () => {
      calls.push('open-login');
      return loginScreen;
    });
    t.mock.method(LoginScreen.prototype, 'assertHelloVisible', async () => { calls.push('hello'); });
    t.mock.method(LoginScreen.prototype, 'enterUsername', async (value: string) => {
      calls.push(`username:${value}`);
    });
    t.mock.method(LoginScreen.prototype, 'enterPassword', async (value: string) => {
      calls.push(`password:${value}`);
    });
    t.mock.method(LoginScreen.prototype, 'dismissKeyboard', async () => { calls.push('dismiss-keyboard'); });
    t.mock.method(LoginScreen.prototype, 'submit', async () => { calls.push('submit'); });
    t.mock.method(HomeScreen.prototype, 'dismissNotificationPopup', async () => {
      calls.push('dismiss-notification');
    });
    t.mock.method(HomeScreen.prototype, 'acceptPermissionDialog', async () => {
      calls.push('accept-permission');
    });
    t.mock.method(HomeScreen.prototype, 'assertGreetingVisible', async () => { calls.push('greeting'); });

    const result = await loginToHome('validation-user');
    assert.equal(result.session.platform, platform);
    assert.ok(result.homeScreen instanceof HomeScreen);
    assert.deepEqual(calls, [
      'welcome', 'open-healthy-living', 'healthy-living', 'open-login', 'hello',
      'username:validation-user', 'dismiss-keyboard', 'password:validation-password',
      'dismiss-keyboard', 'submit',
      ...(platform === 'Android' ? ['dismiss-notification', 'pause:3000', 'accept-permission'] : []),
      'pause:1000', 'greeting', 'screenshot:home-screen'
    ]);
  });
}

for (const risk of ['low', 'high']) {
  test(`assessment resource loader reads the ${risk}-risk fixture unchanged`, async t => {
    const resourceName = `mha-${risk}-risk-assessment.json`;
    const expected = JSON.parse(await readFile(new URL(`../fixtures/${resourceName}`, import.meta.url), 'utf8'));
    const screen = new MHAQuestionsScreen(new MobileSession('Android'));
    let loaded: unknown;
    t.mock.method(screen, 'completeAssessment', async (assessment: unknown) => { loaded = assessment; });
    await screen.completeAssessmentFromResource(resourceName);
    assert.deepEqual(loaded, expected);
  });
}
