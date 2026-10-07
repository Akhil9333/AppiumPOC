package screens;

import genericUtils.MobileSessionInit;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

import java.time.LocalDate;

public class ScreeningVaccinationScreen extends BaseScreen {

    public ScreeningVaccinationScreen(MobileSessionInit session) {
        super(session);
    }

    public void assertFormLoaded() {
        Assert.assertTrue(isVisible(
                        "//*[contains(@text, 'Type') or contains(@content-desc, 'Type')]",
                        "//*[contains(@name, 'Type') or contains(@label, 'Type')]"),
                "Screening vaccination form type field was not displayed");
        Assert.assertTrue(isVisible(
                        "//*[contains(@text, 'Date') or contains(@content-desc, 'Date')]",
                        "//*[contains(@name, 'Date') or contains(@label, 'Date')]"),
                "Screening vaccination form date field was not displayed");
        Assert.assertTrue(isVisible(
                        "//*[contains(@text, 'Upload') or contains(@content-desc, 'Upload')]",
                        "//*[contains(@name, 'Upload') or contains(@label, 'Upload')]"),
                "Screening vaccination form upload control was not displayed");
    }

    public void assertImageElementVisible() {
        Assert.assertTrue(isVisible(
                        "//android.widget.ImageView",
                        "//XCUIElementTypeImage"),
                "No visible image element was found on the screening vaccination screen");
    }

    public void selectFluType() throws InterruptedException {
        click(
                "//*[contains(@text, 'Type') or contains(@content-desc, 'Type')]",
                "//*[contains(@name, 'Type') or contains(@label, 'Type')]");
        click(
                "//*[@text='Flu' or @content-desc='Flu']",
                "//*[@name='Flu' or @label='Flu']");
    }

    public void selectCurrentDate() throws InterruptedException {
        click(
                "//*[contains(@text, 'Date') or contains(@content-desc, 'Date')]",
                "//*[contains(@name, 'Date') or contains(@label, 'Date')]");

        String today = Integer.toString(LocalDate.now().getDayOfMonth());
        String dayXpath = "//*[@text='" + today + "' or @content-desc='" + today + "']";
        String iosDayXpath = "//*[@name='" + today + "' or @label='" + today + "']";
        Assert.assertTrue(isVisible(dayXpath, iosDayXpath),
                "Current day was not available in the date picker");
        click(dayXpath, iosDayXpath);

        String androidConfirm = "//*[@text='OK' or @text='Done' or @text='Select']";
        String iosConfirm = "//*[@name='Done' or @label='Done' or @name='Select' or @label='Select']";
        if (isVisible(androidConfirm, iosConfirm)) {
            click(androidConfirm, iosConfirm);
        }
    }

    public void uploadPdfFromDevice() throws InterruptedException {
        click(
                "//*[contains(@text, 'Upload') or contains(@content-desc, 'Upload')]",
                "//*[contains(@name, 'Upload') or contains(@label, 'Upload')]");
        click(
                "//*[@text='Select PDF' or @content-desc='Select PDF']",
                "//*[@name='Select PDF' or @label='Select PDF']");

        String androidPdf = "//*[contains(translate(@text, 'PDF', 'pdf'), '.pdf') "
                + "or contains(translate(@content-desc, 'PDF', 'pdf'), '.pdf')]";
        String iosPdf = "//*[contains(translate(@name, 'PDF', 'pdf'), '.pdf') "
                + "or contains(translate(@label, 'PDF', 'pdf'), '.pdf')]";
        WebElement pdf = element(androidPdf, iosPdf);
        pdf.click();
    }

    public void submitForm() throws InterruptedException {
        click(
                "//*[@text='Submit' or @content-desc='Submit']",
                "//*[@name='Submit' or @label='Submit']");
    }

    public void assertSubmissionSuccessful() {
        Assert.assertTrue(isVisible(
                        "//*[contains(translate(@text, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'proof submitted successfully') "
                                + "or contains(translate(@content-desc, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'proof submitted successfully')]",
                        "//*[contains(translate(@name, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'proof submitted successfully') "
                                + "or contains(translate(@label, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'proof submitted successfully')]"),
                "Proof submission success message was not displayed");
    }

    public void tapDone() throws InterruptedException {
        click(
                "//*[@text='Done' or @content-desc='Done']",
                "//*[@name='Done' or @label='Done']");
    }
}
