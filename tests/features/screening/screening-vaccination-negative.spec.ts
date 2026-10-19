import { browser } from '@wdio/globals';
import { executionReporter } from '../../../src/utils/ExecutionReporter.js';
import { ActivityScreen } from '../../../src/pages/ActivityScreen.js';
import { HomeScreen } from '../../../src/pages/HomeScreen.js';
import { ScreeningVaccinationScreen } from '../../../src/pages/ScreeningVaccinationScreen.js';
import { completeLogin, loginWithUsername } from '../../helpers/genericFlow.js';
import { assertTestAccountReady, testAccounts } from '../../helpers/user_helpers/TestUser.js';

describe('screening vaccination form validation', () => {
  before('verify pre-session member account', assertTestAccountReady);

  it('blocks submission when the proof image is missing', async () => {
    const { session, loginScreen } = await loginWithUsername(testAccounts.member);
    await completeLogin(loginScreen);

    const homeScreen = new HomeScreen(session);
    if (!session.isIOS) {
      await homeScreen.dismissNotificationPopup();
      await homeScreen.acceptPermissionDialog();
    }
    await homeScreen.assertGreetingVisible();
    const activityScreen: ActivityScreen = await homeScreen.openActivityTab();
    await activityScreen.assertActivityHeader();
    const form: ScreeningVaccinationScreen = await activityScreen.openScreeningVaccinationFeedcard();
    await form.openSubmissionForm();
    await form.acceptDataPrivacyNotice();
    await form.assertFormLoaded();
    await form.selectFluType();
    await form.selectCurrentDate();

    executionReporter.log('Attempting submission without uploading proof.');
    await form.submitForm();
    await form.assertSubmissionBlockedWithoutProof();
    executionReporter.log('Submission was blocked: no success message appeared and the form remained open.');
    await executionReporter.captureScreenshot('screening-vaccination-missing-proof-blocked');
    await browser.pause(15_000);
  });
});