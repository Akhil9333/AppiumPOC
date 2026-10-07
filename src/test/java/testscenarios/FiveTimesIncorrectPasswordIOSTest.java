package testscenarios;

import config.LambdaTestConfig;
import genericUtils.MobileSessionInit;
import genericUtils.TestExecutionListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;
import screens.HealthyLivingScreen;
import screens.LoginScreen;
import screens.WelcomeScreen;

@Listeners(TestExecutionListener.class)
public class FiveTimesIncorrectPasswordIOSTest extends MobileSessionInit {

    @Override
    protected String getScenarioName() {
        return "5 Times Incorrect Password Test";
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
//    public void loginTest(@Optional("iPhone 14  .*") String device,
//                          @Optional(".*") String version,
//                          @Optional("iOS") String platform) throws InterruptedException {
//        recordStep("Running five incorrect password attempts scenario.");

        public void loginTest(@Optional("Galaxy S.*") String device,
                @Optional(".*") String version,
                @Optional("android") String platform) throws InterruptedException {
            recordStep("Running five incorrect password attempts scenario.");

        WelcomeScreen welcomeScreen = new WelcomeScreen(this);
        welcomeScreen.assertWelcomeMessage();
        recordStep("Validated welcome message on landing screen.");

        HealthyLivingScreen healthyLivingScreen = welcomeScreen.openHealthyLiving();
        recordStep("Navigated from welcome screen to healthy living screen.");
        healthyLivingScreen.assertHealthyLivingMessage();

        LoginScreen loginScreen = healthyLivingScreen.openLogin();
        recordStep("Opened login screen.");
        loginScreen.assertHelloVisible();

        loginScreen.enterUsername(LambdaTestConfig.requiredEnv("LOCKOUT_USERNAME"));
        recordStep("Entered username.");
        loginScreen.dismissKeyboard();

        loginScreen.enterPassword(LambdaTestConfig.requiredEnv("APP_INCORRECT_PASSWORD"));
        loginScreen.dismissKeyboard();

        for (int attempt = 1; attempt <= 5; attempt++) {

            //recordStep("Entered password attempt " + attempt + ".");
            loginScreen.submit();
            recordStep("Login Button " + attempt + ".");
            Thread.sleep(500);

            loginScreen.assertIncorrectPasswordMessage();
            recordStep("Validated incorrect password message for attempt " + attempt + ".");

            loginScreen.gotItButton();
            recordStep("Got It Button " + attempt + ".");

        }
        loginScreen.submit();
        recordStep("Login Button " + 6 + ".");

        loginScreen.assertLockoutMessage();
        recordStep("Validated account lockout message after five incorrect password attempts.");

        loginScreen.dismissLockoutMessage();
        recordStep("Dismissed account lockout message.");

        captureCheckpoint("five-times-incorrect-password");
        recordStep("Completed five times incorrect password test.");
    }
}
