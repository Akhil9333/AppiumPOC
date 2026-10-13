import { executionReporter } from '../../src/utils/ExecutionReporter.js';
import { SettingsScreen } from '../../src/pages/SettingsScreen.js';
import { assertTestAccountReady, testAccounts } from '../helpers/user_helpers/TestUser.js';
import { loginToHome } from '../helpers/genericFlow.js';

describe('Mobile login and logout', () => {
  before('verify pre-session member account', assertTestAccountReady);

  it('logs in and logs out successfully', async () => {
    executionReporter.log('Running mobile login/logout scenario.');
    const { homeScreen } = await loginToHome(testAccounts.member);

    const profileScreen = await homeScreen.openProfileTab();
    executionReporter.log('Opened profile tab.');
    const settingsScreen: SettingsScreen = await profileScreen.openSettings();
    executionReporter.log('Opened settings screen.');
    await settingsScreen.assertLoaded();
    await executionReporter.captureScreenshot('settings-screen');
    await settingsScreen.scrollToLogoutAndTap();
    executionReporter.log('Tapped logout button.');
    await settingsScreen.assertLogoutConfirmation();
    await executionReporter.captureScreenshot('logout-confirmation');
    await settingsScreen.confirmLogout();
    executionReporter.log('Confirmed logout action.');
    await executionReporter.captureScreenshot('logout-complete');
  });
});
