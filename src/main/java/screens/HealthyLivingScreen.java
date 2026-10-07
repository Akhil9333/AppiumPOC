package screens;

import genericUtils.MobileSessionInit;

public class HealthyLivingScreen extends BaseScreen {

    public HealthyLivingScreen(MobileSessionInit session) {
        super(session);
    }

    public void assertHealthyLivingMessage() {
        assertTextEquals(element(
                "//*[@resource-id='reg_welcome_txthealthliv_001']",
                "//*[@name='reg_welcome_txthealthliv_001']"),
                "Healthy living has never been this rewarding");
    }

    public LoginScreen openLogin() throws InterruptedException {
        click(
                "//*[@resource-id='ctrl_btnlogin_001']",
                "//*[@name='ctrl_btnlogin_001']");
        return new LoginScreen(session);
    }
}

