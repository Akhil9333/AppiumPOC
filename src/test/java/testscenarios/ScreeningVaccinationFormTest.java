package testscenarios;

import config.LambdaTestConfig;
import genericUtils.MobileSessionInit;
import genericUtils.TestExecutionListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;
import screens.ActivityScreen;
import screens.HealthyLivingScreen;
import screens.HomeScreen;
import screens.LoginScreen;
import screens.ScreeningVaccinationScreen;
import screens.WelcomeScreen;

@Listeners(TestExecutionListener.class)
public class ScreeningVaccinationFormTest extends MobileSessionInit {

    @Override
    protected String getScenarioName() {
        return "Screening Vaccination Form Submission";
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
    @Parameters(value = {"device", "version", "platform"})
    public void submitScreeningVaccinationForm(@Optional("Galaxy S.*") String device,
                                               @Optional(".*") String version,
                                               @Optional("Android") String platform) throws InterruptedException {
        recordStep("Logging in and navigating to the activity feed.");

        WelcomeScreen welcomeScreen = new WelcomeScreen(this);
        welcomeScreen.assertWelcomeMessage();
        HealthyLivingScreen healthyLivingScreen = welcomeScreen.openHealthyLiving();
        healthyLivingScreen.assertHealthyLivingMessage();
        LoginScreen loginScreen = healthyLivingScreen.openLogin();
        loginScreen.assertHelloVisible();
        loginScreen.enterUsername(LambdaTestConfig.requiredEnv("APP_USERNAME"));
        loginScreen.dismissKeyboard();
        loginScreen.enterPassword(LambdaTestConfig.requiredEnv("APP_PASSWORD"));
        loginScreen.dismissKeyboard();
        loginScreen.submit();

        HomeScreen homeScreen = new HomeScreen(this);
        if (!isIOS) {
            homeScreen.dismissNotificationPopup();
            homeScreen.acceptPermissionDialog();
        }
        homeScreen.assertGreetingVisible();
        ActivityScreen activityScreen = homeScreen.openActivityTab();
        activityScreen.assertActivityHeader();

        ScreeningVaccinationScreen form = activityScreen.openScreeningVaccinationFeedcard();
        recordStep("Opened the screening vaccination form.");
        form.assertFormLoaded();
        form.assertImageElementVisible();
        recordStep("Validated that an image element is visible on the screening vaccination screen.");
        form.selectFluType();
        recordStep("Selected Flu as the screening vaccination type.");
        form.selectCurrentDate();
        recordStep("Selected the current date.");
        form.uploadPdfFromDevice();
        recordStep("Selected a PDF from the device.");
        form.submitForm();
        recordStep("Submitted the screening vaccination form.");
        form.assertSubmissionSuccessful();
        captureCheckpoint("screening-vaccination-submitted");
        form.tapDone();
    }
}
