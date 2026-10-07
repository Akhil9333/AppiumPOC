package screens;

import genericUtils.MobileSessionInit;

import static io.appium.java_client.touch.offset.ElementOption.element;

public class MHALandingScreen extends BaseScreen {

    public MHALandingScreen(MobileSessionInit session) {
        super(session);
    }

    public void assertMHAScreenHeader() {
        assertTextEquals(element(
                        "//*[@resource-id='txtmentalwellbeingassessment_001']",
                        "//*[@name='txtmentalwellbeingassessment_001']"),
                "Mental health assessment");
    }
    public void assertMHAInitPoints() {
            assertTextEquals(element(
                            "//*[@resource-id='txtpoints_001']",
                            "//*[@name='txtpoints_001']"),
                    "0/600 POINTS");
        }
    public void assertTimeInit() {
        assertTextEquals(element(
                        "//*[@resource-id='txttime005']",
                        "//*[@name='txttime005']"),
                "Takes 5 minutes to complete");
    }

    public void isVisibleMHAStartButton() {
        isVisible(
                "//*[@resource-id='btnstartassessment_001']",
                "//*[@name='btnstartassessment_001']");

    }
    public void clickMHAStartButton() throws InterruptedException {
        click(
                "//*[@resource-id='btn_ctrl_btnstartassessment_001']",
                "//*[@name='btn_ctrl_btnstartassessment_001']");
    }
    public void clickIundertandOnDataPrivacyScreen() throws InterruptedException {
        click(
                "//*[@resource-id='btn_vg_button_i_understand']",
                "//*[@name='btn_vg_button_i_understand']");
    }
    public void assertLowRiskPointsUpdated() {
        assertTextContains(element(
                        "//*[@resource-id='txtpoints_001']",
                        "//*[@name='txtpoints_001']"),
                "300/600 POINTS");
    }
    public void assertCompltedDate() {
        assertTextContains(element(
                        "//*[@resource-id='txtcompleteddate_001']",
                        "//*[@name='txtcompleteddate_001']"),
                "Completed:");
    }



}
