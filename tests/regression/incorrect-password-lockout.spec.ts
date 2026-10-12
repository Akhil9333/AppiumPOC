import { browser } from '@wdio/globals';
import { executionReporter } from '../../src/utils/ExecutionReporter.js';
import { requiredSetting } from '../../src/config/mobileSessionInit.js';
import { initializeTestAccounts, testAccounts } from '../helpers/user_helpers/TestUser.js';
import { loginWithUsername } from '../helpers/genericFlow.js';

describe('account lockout after incorrect passwords', () => {
  before('provision a new member account for lockout', async () => {
    const incorrectPassword = requiredSetting('INCORRECT_APP_PASSWORD', 'APP_INCORRECT_PASSWORD');
    if (incorrectPassword === requiredSetting('APP_PASSWORD')) {
      throw new Error('INCORRECT_APP_PASSWORD must differ from APP_PASSWORD for the lockout test.');
    }
    await initializeTestAccounts();
  });

  it('locks the dedicated account after five incorrect attempts', async () => {
    executionReporter.log('Running five incorrect password attempts scenario.');
    const { loginScreen } = await loginWithUsername(testAccounts.member);
    await loginScreen.enterPassword(requiredSetting('INCORRECT_APP_PASSWORD', 'APP_INCORRECT_PASSWORD'));
    await loginScreen.dismissKeyboard();

    for (let attempt = 1; attempt <= 5; attempt++) {
      await loginScreen.submit();
      executionReporter.log(`Login Button ${attempt}.`);
      await browser.pause(300);
      await loginScreen.assertIncorrectPasswordMessage();
      executionReporter.log(`Validated incorrect password message for attempt ${attempt}.`);
      await loginScreen.gotItButton();
      executionReporter.log(`Got It Button ${attempt}.`);
    }

    await loginScreen.submit();
    executionReporter.log('Login Button 6.');
    await loginScreen.assertLockoutMessage();
    executionReporter.log('Validated account lockout message after five incorrect password attempts.');
    await loginScreen.dismissLockoutMessage();
    executionReporter.log('Dismissed account lockout message.');
    await executionReporter.captureScreenshot('five-times-incorrect-password');
    executionReporter.log('Completed five times incorrect password test.');
  });
});
