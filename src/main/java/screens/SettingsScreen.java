package screens;

import genericUtils.MobileSessionInit;

public class SettingsScreen extends BaseScreen {

    public SettingsScreen(MobileSessionInit session) {
        super(session);
    }

    public void assertLoaded() {
        org.testng.Assert.assertTrue(element(
                "//*[@resource-id='txtsettings_001']",
                "//*[@name='txtsettings_001']").isDisplayed());
    }

    public void scrollToLogoutAndTap() throws InterruptedException {
        scrollAndClick(
                "//*[@resource-id='ctrl_logout_001']",
                "//*[@name='ctrl_logout_001']",
                10);
    }

    public void assertLogoutConfirmation() {
        assertTextEquals(element(
                "//*[@resource-id='dialog_body_areyouwanttologout_001']",
                "//*[@name='dialog_body_areyouwanttologout_001']"),
                "Are you sure you want to log out?");
    }

    public void confirmLogout() throws InterruptedException {
        click(
                "//*[@resource-id='dialog_btn1_yeslogout_001']",
                "//*[@name='dialog_btn1_yeslogout_001']");
    }
}

