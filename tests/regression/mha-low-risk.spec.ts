import { executionReporter } from '../../src/utils/ExecutionReporter.js';
import { ActivityScreen } from '../../src/pages/ActivityScreen.js';
import { MHALandingScreen } from '../../src/pages/MHALandingScreen.js';
import { MHAQuestionsScreen } from '../../src/pages/MHAQuestionsScreen.js';
import { MHASectionScreen } from '../../src/pages/MHASectionScreen.js';
import { MHASuccessfulCompleteScreen } from '../../src/pages/MHASuccessfulCompleteScreen.js';
import { initializeTestAccounts, testAccounts } from '../helpers/user_helpers/TestUser.js';
import { loginToHome } from '../helpers/genericFlow.js';

describe('mental health assessment journey', () => {
  before('provision a new member account', initializeTestAccounts);

  it('completes the assessment and verifies the results', async () => {
    executionReporter.log('MHA_Validate the Low Risk assessment.');
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
    await questionsScreen.completeAssessmentFromResource('mha-assessment.json');
    executionReporter.log('Validated and answered each MHA question, advancing through every section.');

    const completedScreen = new MHASuccessfulCompleteScreen(session);
    await completedScreen.assertCompletionMessage();
    executionReporter.log('Validated successful MHA assessment completion message.');
    await completedScreen.assertViewResultsButtonVisible();
    executionReporter.log('Validated View results button.');
    await completedScreen.clickViewResults();
    executionReporter.log('Opened MHA assessment results.');
    await mhaScreen.assertLowRiskPointsUpdated();
    executionReporter.log('Validated low risk points updated.');
    await mhaScreen.assertCompltedDate();
    executionReporter.log('Validated completed date.');
    await mhaScreen.assertRiskType('Low risk');
    executionReporter.log('Validated Low risk result.');
  });
});
