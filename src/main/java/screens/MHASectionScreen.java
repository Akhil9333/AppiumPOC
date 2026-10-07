package screens;

import genericUtils.MobileSessionInit;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

import java.util.Locale;

public class MHASectionScreen extends BaseScreen {

    public MHASectionScreen(MobileSessionInit session) {
        super(session);
    }

    public void assertStartButtonEnabled() {
        WebElement startButton = element(
                "//*[@resource-id='btnstartassessment_001']",
                "//*[@name='btnstartassessment_001']");
        Assert.assertTrue(startButton.isEnabled(), "MHA Start button is enabled");
    }

    public void clickStartButton() throws InterruptedException {
        click(
                "//*[@resource-id='btn_ctrl_btnstart_001']",
                "//*[@name='btn_ctrl_btnstart_001']");
    }

    public void assertMHAScreenHeader() {
        assertTextEquals(element(
                        "//*[@resource-id='txtmentalwellbeingassessment_001']",
                        "//*[@name='txtmentalwellbeingassessment_001']"),
                "Mental health assessment");
    }



    }
