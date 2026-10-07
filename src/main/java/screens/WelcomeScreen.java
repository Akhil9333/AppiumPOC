package screens;

import genericUtils.MobileSessionInit;

public class WelcomeScreen extends BaseScreen {

    public WelcomeScreen(MobileSessionInit session) {
        super(session);
    }

    public void assertWelcomeMessage() {
        assertTextEquals(element(
                "//*[@resource-id='txttheworldslargestsciencebased_001']",
                "//*[@name='txttheworldslargestsciencebased_001']"),
                "The world’s largest science-based behavioural change program that rewards you for making healthier choices.");
    }

    public HealthyLivingScreen openHealthyLiving() throws InterruptedException {
        click(
                "//*[@resource-id='btn_btn_next']",
                "//*[@name='btn_btn_next']");
        return new HealthyLivingScreen(session);
    }
}

