import { readFile } from 'node:fs/promises';
import { executionReporter } from '../../../src/utils/ExecutionReporter.js';
import { MHAQuestionsScreen } from '../../../src/pages/MHAQuestionsScreen.js';
import { MHASectionScreen } from '../../../src/pages/MHASectionScreen.js';
import { assertTestAccountReady, testAccounts } from '../../helpers/user_helpers/TestUser.js';
import { loginToHome } from '../../helpers/genericFlow.js';

describe('mental health assessment required answer validation', () => {
  before('verify pre-session member account', assertTestAccountReady);

  it('keeps Next disabled before the first required answer is selected', async () => {
    const { session, homeScreen } = await loginToHome(testAccounts.member);
    const activityScreen = await homeScreen.openActivityTab();
    await activityScreen.assertActivityHeader();
    const landingScreen = await activityScreen.openMHAFeedcard();
    await landingScreen.assertMHAScreenHeader();
    await landingScreen.assertMHAInitPoints();
    await landingScreen.clickMHAStartButton();
    await landingScreen.clickIundertandOnDataPrivacyScreen();
    await new MHASectionScreen(session).clickStartButton();

    const fixture = JSON.parse(await readFile(
      new URL('../../fixtures/mha-low-risk-assessment.json', import.meta.url), 'utf8'
    ));
    const firstQuestion: unknown = fixture['Mental health assessment']?.Sections?.[0]?.Questions?.[0]?.Name;
    if (typeof firstQuestion !== 'string' || !firstQuestion.trim()) {
      throw new Error('The low-risk MHA fixture must contain the first required question.');
    }
    await new MHAQuestionsScreen(session).assertUnansweredQuestionNextDisabled(firstQuestion);
    executionReporter.log('MHA Next is disabled and the first required question remains displayed without an answer.');
    await executionReporter.captureScreenshot('mha-unanswered-next-disabled');
  });
});
