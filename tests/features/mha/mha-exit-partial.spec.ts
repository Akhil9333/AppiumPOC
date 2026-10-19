import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { executionReporter } from '../../../src/utils/ExecutionReporter.js';
import { MHAQuestionsScreen } from '../../../src/pages/MHAQuestionsScreen.js';
import { MHASectionScreen } from '../../../src/pages/MHASectionScreen.js';
import { assertTestAccountReady, testAccounts } from '../../helpers/user_helpers/TestUser.js';
import { loginToHome } from '../../helpers/genericFlow.js';

describe('mental health assessment partial exit', () => {
  before('verify pre-session member account', assertTestAccountReady);

  it('confirms exit after one answer and returns to the landing screen with Start available', async () => {
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
    const firstAnswer: unknown = fixture['Mental health assessment']?.Sections?.[0]?.Questions?.[0]?.Values?.[0];
    if (typeof firstQuestion !== 'string' || !firstQuestion.trim()
      || typeof firstAnswer !== 'string' || !firstAnswer.trim()) {
      throw new Error('The low-risk MHA fixture must contain the first question and a valid answer.');
    }
    const questionsScreen = new MHAQuestionsScreen(session);
    await questionsScreen.enterAnswerAndSelect(firstAnswer);
    await questionsScreen.closeAssessment();
    await questionsScreen.confirmAssessmentExit();
    await landingScreen.assertMHAScreenHeader();
    assert.equal(await landingScreen.isVisibleMHAStartButton(), true, 'MHA Start must be visible after exit');
    await landingScreen.assertMHAInitPoints();
    executionReporter.log('Confirmed partial assessment exit; MHA landing shows Start and no points were awarded.');
    await executionReporter.captureScreenshot('mha-partial-exit-landing');
  });
});
