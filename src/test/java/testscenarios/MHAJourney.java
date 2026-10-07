package testscenarios;

import config.LambdaTestConfig;
import genericUtils.MobileSessionInit;
import genericUtils.TestExecutionListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;
import screens.*;

import java.io.IOException;

@Listeners(TestExecutionListener.class)
public class MHAJourney extends MobileSessionInit {

    @Override
    protected String getScenarioName() {
        return "MHA Journey";
    }

    @Override
    protected String getIosDefaultAppId() {
        return "lt://APP1016040931790946175785731";
    }

    @Override
    protected String getAndroidDefaultAppId() {
        return "lt://APP10160441201790686977713654";
    }

    @Test
//    @Parameters(value = {"device", "version", "platform"})
//    public void loginTest(@Optional("iPhone 14.*") String device,
//                          @Optional(".*") String version,
//                          @Optional("iOS") String platform) throws InterruptedException, IOException {
//        recordStep("MHA Low Rish user.");

        public void loginTest(@Optional("Galaxy S.*") String device,
                @Optional(".*") String version,
                @Optional("android") String platform) throws IOException, InterruptedException {
            recordStep("MHA Journey.");

        WelcomeScreen welcomeScreen = new WelcomeScreen(this);
        welcomeScreen.assertWelcomeMessage();
        recordStep("Validated welcome message on landing screen.");

        HealthyLivingScreen healthyLivingScreen = welcomeScreen.openHealthyLiving();
        recordStep("Navigated from welcome screen to healthy living screen.");
        healthyLivingScreen.assertHealthyLivingMessage();

        LoginScreen loginScreen = healthyLivingScreen.openLogin();
        recordStep("Opened login screen.");
        loginScreen.assertHelloVisible();

        loginScreen.enterUsername(LambdaTestConfig.requiredEnv("MHA_USERNAME"));
        recordStep("Entered username.");
        loginScreen.dismissKeyboard();

        loginScreen.enterPassword(LambdaTestConfig.requiredEnv("APP_PASSWORD"));
        loginScreen.dismissKeyboard();
        recordStep("Entered password.");

        loginScreen.submit();
        recordStep("Clicked submit button on login screen.");

        HomeScreen homeScreen = new HomeScreen(this);
        if (!isIOS) {
            homeScreen.dismissNotificationPopup();
            recordStep("Dismissed notification popup.");

            Thread.sleep(3000);
            homeScreen.acceptPermissionDialog();
            recordStep("Accepted runtime permission dialog.");
        }

        Thread.sleep(1000);
        homeScreen.assertGreetingVisible();
        recordStep("Validated home screen greeting message.");
        captureCheckpoint("home-screen");

        ActivityScreen activityScreen = homeScreen.openActivityTab();
        recordStep("Opened activity tab.");

        activityScreen.assertActivityHeader();
        recordStep("Validated activity header.");


        MHALandingScreen mHAScreen = activityScreen.openMHAFeedcard();
        recordStep("Scrolled and opened MHA feed card.");

        mHAScreen.assertMHAScreenHeader();
        recordStep("Validated MHA screen header.");

        mHAScreen.assertMHAInitPoints();
        recordStep("Validated initial MHA points.");

        mHAScreen.assertTimeInit();
        recordStep("Validated initial MHA time.");

        mHAScreen.clickMHAStartButton();
        recordStep("Clicked MHA start button.");

        mHAScreen.clickIundertandOnDataPrivacyScreen();
        recordStep("Clicked 'I understand' on data privacy screen.");


        MHASectionScreen mhaSectionScreen = new MHASectionScreen(this);
        //mhaSectionScreen.assertStartButtonEnabled();
        mhaSectionScreen.clickStartButton();
        recordStep("Clicked start button on MHA questions screen.");

        MHAQuestionsScreen questionsScreen = new MHAQuestionsScreen(this);
        questionsScreen.completeAssessmentFromResource("mha-assessment.json");
        recordStep("Validated and answered each MHA question, advancing through every section.");


        MHASuccessfulCompleteScreen successfulCompleteScreen = new MHASuccessfulCompleteScreen(this);
        successfulCompleteScreen.assertCompletionMessage();
        recordStep("Validated successful MHA assessment completion message.");
        successfulCompleteScreen.assertViewResultsButtonVisible();
        recordStep("Validated View results button.");
        successfulCompleteScreen.clickViewResults();
        recordStep("Opened MHA assessment results.");

        mHAScreen.assertLowRiskPointsUpdated();
        recordStep("Validated low risk points updated.");
        mHAScreen.assertCompltedDate();
        recordStep("Validated completed date.");


    }
}
