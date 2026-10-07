import config.LambdaTestConfig;
import framework.MobileSessionInit;
import framework.TestExecutionListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;
import screens.HealthyLivingScreen;
import screens.HomeScreen;
import screens.LoginScreen;
import screens.ProfileScreen;
import screens.SettingsScreen;
import screens.WelcomeScreen;

@Listeners(TestExecutionListener.class)
public class LoginAndLogoutFunctionality_Android extends MobileSessionInit {

    @Override
    protected String getScenarioName() {
        return "Android Login and Logout Functionality Test";
    }

    @Override
    protected String getIosDefaultAppId() {
        return "lt://APP1016040931790946175785731";
    }

    @Override
    protected String getAndroidDefaultAppId() {
        return "lt://APP1016040931790946196736259";
    }

    @Override
    protected long getWaitSeconds() {
        return 400;
    }

    @Override
    protected long getInitialLoadDelayMillis() {
        return 7000;
    }

    @Test
    @Parameters(value = {"device", "version", "platform"})
    public void loginTest(@Optional("Galaxy.*") String device,
                          @Optional("14") String version,
                          @Optional("Android") String platform) throws InterruptedException {
        recordStep("Running Android login/logout scenario.");

        WelcomeScreen welcomeScreen = new WelcomeScreen(this);
        welcomeScreen.assertWelcomeMessage();
        recordStep("Validated welcome message on landing screen.");

        HealthyLivingScreen healthyLivingScreen = welcomeScreen.openHealthyLiving();
        recordStep("Navigated from welcome screen to healthy living screen.");
        healthyLivingScreen.assertHealthyLivingMessage();

        LoginScreen loginScreen = healthyLivingScreen.openLogin();
        recordStep("Opened login screen.");
        loginScreen.assertHelloVisible();

        loginScreen.enterUsername(LambdaTestConfig.requiredEnv("APP_USERNAME"));
        recordStep("Entered username.");
        loginScreen.dismissKeyboard();

        loginScreen.enterPassword(LambdaTestConfig.requiredEnv("APP_PASSWORD"));
        recordStep("Entered password.");
        loginScreen.dismissKeyboard();

        loginScreen.submit();
        recordStep("Submitted login form.");

        HomeScreen homeScreen = new HomeScreen(this);
        homeScreen.dismissNotificationPopup();
        recordStep("Dismissed notification popup.");

        Thread.sleep(3000);
        homeScreen.acceptPermissionDialog();
        recordStep("Accepted runtime permission dialog.");

        Thread.sleep(1000);
        homeScreen.assertGreetingVisible();
        recordStep("Validated home screen greeting message.");
        captureCheckpoint("home-screen");

        ProfileScreen profileScreen = homeScreen.openProfileTab();
        recordStep("Opened profile tab.");

        SettingsScreen settingsScreen = profileScreen.openSettings();
        recordStep("Opened settings screen.");
        settingsScreen.assertLoaded();
        captureCheckpoint("settings-screen");

        settingsScreen.scrollToLogoutAndTap();
        recordStep("Tapped logout button.");
        settingsScreen.assertLogoutConfirmation();
        captureCheckpoint("logout-confirmation");

        settingsScreen.confirmLogout();
        recordStep("Confirmed logout action.");
        captureCheckpoint("logout-complete");
    }
}
