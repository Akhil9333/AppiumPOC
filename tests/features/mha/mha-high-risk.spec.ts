import { executionReporter } from '../../../src/utils/ExecutionReporter.js';
import { ActivityScreen } from '../../../src/pages/ActivityScreen.js';
import { MHALandingScreen } from '../../../src/pages/MHALandingScreen.js';
import { MHAQuestionsScreen } from '../../../src/pages/MHAQuestionsScreen.js';
import { MHASectionScreen } from '../../../src/pages/MHASectionScreen.js';
import { MHASuccessfulCompleteScreen } from '../../../src/pages/MHASuccessfulCompleteScreen.js';
import { assertTestAccountReady, testAccounts } from '../../helpers/user_helpers/TestUser.js';
import { loginToHome } from '../../helpers/genericFlow.js';

describe('high-risk mental health assessment journey', () => {
  before('verify pre-session member account', assertTestAccountReady);

  it('submits the high-risk assessment and verifies completion', async () => {
    executionReporter.log('MHA_Validate the High Risk assessment.');
    const { session, homeScreen } = await loginToHome(testAccounts.member);

    const activityScreen: ActivityScreen = await homeScreen.openActivityTab();
    executionReporter.log('Opened activity tab.');
    await activityScreen.assertActivityHeader();
    executionReporter.log('Validated activity header.');
    const mhaScreen: MHALandingScreen = await activityScreen.openMHAFeedcard();
    executionReporter.log('Scrolled and opened MHA feed card.');
    await mhaScreen.assertMHAScreenHeader();
    executionReporter.log('Validated MHA screen header.');
    await mhaScreen.assertMHAInitPoints();
    executionReporter.log('Validated initial MHA points.');
    await mhaScreen.assertTimeInit();
    executionReporter.log('Validated initial MHA time.');
    await mhaScreen.clickMHAStartButton();
    executionReporter.log('Clicked MHA start button.');
    await mhaScreen.clickIundertandOnDataPrivacyScreen();
    executionReporter.log("Clicked 'I understand' on data privacy screen.");

    const sectionScreen = new MHASectionScreen(session);
    await sectionScreen.clickStartButton();
    executionReporter.log('Clicked start button on MHA questions screen.');
    const questionsScreen = new MHAQuestionsScreen(session);
    await questionsScreen.completeAssessmentFromResource('mha-high-risk-assessment.json');
    executionReporter.log('Answered each high-risk MHA question and submitted the assessment.');

    const completedScreen = new MHASuccessfulCompleteScreen(session);
    await completedScreen.assertCompletionMessage();
    executionReporter.log('Validated successful MHA assessment completion message.');
    await completedScreen.assertViewResultsButtonVisible();
    executionReporter.log('Validated View results button.');
    await completedScreen.clickViewResults();
    executionReporter.log('Opened MHA assessment results.');
    await mhaScreen.assertCompltedDate();
    executionReporter.log('Validated completed date.');
    await mhaScreen.assertRiskType('High risk');
    executionReporter.log('Validated High risk result.');
  });
});
