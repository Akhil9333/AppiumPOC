package screens;

import genericUtils.MobileSessionInit;

public class MHASuccessfulCompleteScreen extends BaseScreen {

    public MHASuccessfulCompleteScreen(MobileSessionInit session) {
        super(session);
    }

    public void assertCompletionMessage() {
        assertTextContains(element(
                        "//*[@resource-id='txtmentalwellbeingasessmentcomplete_001']",
                        "//*[@name='txtmentalwellbeingasessmentcomplete_001']"),
                "Great work on completing your mental health assessment");
    }

    public void assertViewResultsButtonVisible() {
        assertTextEquals(element(
                        "//*[@resource-id='ctrl_btncontinuetofeedback_001']",
                        "//*[@name='ctrl_btncontinuetofeedback_001']"),
                "View results");
    }

    public void clickViewResults() throws InterruptedException {
        click(
                "//*[@resource-id='btn_ctrl_btncontinuetofeedback_001']",
                "//*[@name='btn_ctrl_btncontinuetofeedback_001']");
    }
}
