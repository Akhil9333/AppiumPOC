import assert from 'node:assert/strict';
import { test } from 'node:test';
import Mocha from 'mocha';
import { _setGlobal } from '@wdio/globals';
import { executionReporter } from '../../src/utils/ExecutionReporter.js';
import { WelcomeScreen } from '../../src/pages/WelcomeScreen.js';
import { HealthyLivingScreen } from '../../src/pages/HealthyLivingScreen.js';
import { LoginScreen } from '../../src/pages/LoginScreen.js';
import { MobileSession } from '../../src/utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { testAccounts } from './user_helpers/TestUser.js';

for (const file of ['login-logout', 'mha-low-risk', 'mha-high-risk', 'incorrect-password-lockout']) {
  const outcomes = file === 'incorrect-password-lockout'
    ? ['success', 'api-error', 'same-password']
    : ['success', 'api-error'];
  for (const outcome of outcomes) {
    const succeeds = outcome === 'success';
    test(`${file} suite provisioning: ${outcome}`, async t => {
      const settings = {
        VG_ENVIRONMENT: 'mdev',
        VG_MDEV_LOGIN_PREFIX: 'mdev--',
        VG_MDEV_ZUUL_URL: 'http://example.invalid',
        VG_MDEV_INTEGRATION_PLATFORM_BASE_URL: 'https://example.invalid/api',
        VG_MDEV_TENANT_NUMBER: '9998',
        VG_MDEV_EMAIL_DOMAIN: 'example.invalid',
        VG_MDEV_API_BASIC_AUTH: 'test-basic',
        VG_MDEV_API_BEARER_TOKEN: 'test-bearer',
        APP_PASSWORD: 'test-password',
        INCORRECT_APP_PASSWORD: outcome === 'same-password' ? 'test-password' : 'intentionally-wrong-password',
        PLATFORM: 'Android',
        configUserAgent: 'test-agent'
      };
      for (const [key, value] of Object.entries(settings)) {
        const previous = process.env[key];
        process.env[key] = value;
        t.after(() => {
          if (previous === undefined) delete process.env[key];
          else process.env[key] = previous;
        });
      }
      let email = '';
      const fetchMock = t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
        if (!succeeds) return new Response(null, { status: 500 });
        const route = new URL(url).pathname;
        if (route.endsWith('/createPartyCore/1')) {
          return Response.json({ createPartyCoreResponse: { party: { partyId: 111 } } }, { status: 201 });
        }
        if (route.endsWith('/instructionBasedEnrolment')) {
          email = JSON.parse(String(init.body)).activateVitalityMembership.partyRoles[0].emailAddresses[0].value;
          return Response.json({
            partyRoleOuts: [{ typeKey: 2, partyId: 222, insurerCode: '333' }],
            vitalityMembership: { id: 444 }
          });
        }
        if (route.endsWith('/register')) return new Response(null, { status: 201 });
        if (route.endsWith('/getUserInstruction')) {
          return Response.json({
            instructions: ['LOGIN_T_AND_C', 'GTBOnboardingJourney', 'OnboardingJourney', 'OnboardCommunPref', 'OnboardingReward']
              .map((typeCode, index) => ({ typeCode, id: index + 1 }))
          });
        }
        return Response.json({});
      });
      t.mock.method(console, 'log', () => {});
      const usernames: string[] = [];
      const passwords: string[] = [];
      let submits = 0;
      let incorrectMessages = 0;
      let lockoutMessages = 0;
      if (file === 'incorrect-password-lockout') {
        const session = new MobileSession('Android');
        const healthyLiving = new HealthyLivingScreen(session);
        const loginScreen = new LoginScreen(session);
        _setGlobal('browser', { pause: async () => {} });
        t.mock.method(executionReporter, 'log', () => {});
        t.mock.method(executionReporter, 'captureScreenshot', async () => undefined);
        t.mock.method(WelcomeScreen.prototype, 'assertWelcomeMessage', async () => {});
        t.mock.method(WelcomeScreen.prototype, 'openHealthyLiving', async () => healthyLiving);
        t.mock.method(HealthyLivingScreen.prototype, 'assertHealthyLivingMessage', async () => {});
        t.mock.method(HealthyLivingScreen.prototype, 'openLogin', async () => loginScreen);
        t.mock.method(LoginScreen.prototype, 'assertHelloVisible', async () => {});
        t.mock.method(LoginScreen.prototype, 'enterUsername', async (username: string) => {
          usernames.push(username);
        });
        t.mock.method(LoginScreen.prototype, 'enterPassword', async (password: string) => {
          passwords.push(password);
        });
        t.mock.method(LoginScreen.prototype, 'dismissKeyboard', async () => {});
        t.mock.method(LoginScreen.prototype, 'submit', async () => { submits++; });
        t.mock.method(LoginScreen.prototype, 'assertIncorrectPasswordMessage', async () => { incorrectMessages++; });
        t.mock.method(LoginScreen.prototype, 'gotItButton', async () => {});
        t.mock.method(LoginScreen.prototype, 'assertLockoutMessage', async () => { lockoutMessages++; });
        t.mock.method(LoginScreen.prototype, 'dismissLockoutMessage', async () => {});
      }

      const mocha = new Mocha({ reporter: Mocha.reporters.Base, timeout: 5_000 });
      const uiGlobals = [
        'before', 'after', 'beforeEach', 'afterEach', 'describe', 'xdescribe',
        'context', 'xcontext', 'it', 'xit', 'specify', 'xspecify'
      ];
      const globalDescriptors = new Map(uiGlobals.map(key => [
        key, Object.getOwnPropertyDescriptor(globalThis, key)
      ]));
      mocha.suite.emit('pre-require', globalThis, file, mocha);
      t.after(() => {
        for (const [key, descriptor] of globalDescriptors) {
          if (descriptor) Object.defineProperty(globalThis, key, descriptor);
          else Reflect.deleteProperty(globalThis, key);
        }
        mocha.dispose();
      });
      const specUrl = new URL(`../testScenarios/${file}.spec.ts`, import.meta.url);
      await import(`${specUrl.href}?provisioning=${outcome}`);
      let bodiesRun = 0;
      let registeredTests = 0;
      mocha.suite.eachTest(mobileTest => {
        registeredTests++;
        const originalBody = mobileTest.fn;
        mobileTest.fn = async () => {
          bodiesRun++;
          assert.equal(testAccounts.member, `mdev--${email}`);
          assert.equal(fetchMock.mock.callCount(), 9);
          if (file === 'incorrect-password-lockout') {
            assert.ok(originalBody);
            assert.ok(mobileTest.ctx);
            await originalBody.call(mobileTest.ctx, error => {
              if (error) throw error;
            });
          }
        };
      });
      assert.equal(registeredTests, 1);
      const errors: Error[] = [];
      const failures = await new Promise<number>(resolve => {
        mocha.run(resolve).on('fail', (_runnable, error) => errors.push(error));
      });
      assert.equal(failures, succeeds ? 0 : 1);
      assert.equal(bodiesRun, succeeds ? 1 : 0);
      if (file === 'incorrect-password-lockout' && succeeds) {
        assert.deepEqual(usernames, [`mdev--${email}`]);
        assert.deepEqual(passwords, ['intentionally-wrong-password']);
        assert.equal(submits, 6);
        assert.equal(incorrectMessages, 5);
        assert.equal(lockoutMessages, 1);
      }
      if (!succeeds) {
        if (outcome === 'same-password') {
          assert.match(errors[0]?.message ?? '', /INCORRECT_APP_PASSWORD must differ from APP_PASSWORD/);
          assert.equal(fetchMock.mock.callCount(), 0);
        } else {
          assert.match(errors[0]?.message ?? '', /expected HTTP 201 but received HTTP 500/);
          assert.throws(() => testAccounts.member, /has not been provisioned/);
        }
      }
    });
  }
}
