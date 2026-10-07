package screens;

import genericUtils.MobileSessionInit;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;

public class LoginScreen extends BaseScreen {

    public LoginScreen(MobileSessionInit session) {
        super(session);
    }

    public void assertHelloVisible() {
        assertTextEquals(element(
                "//*[@resource-id='txthello_001']",
                "//*[@name='txthello_001']"),
                "Hello");
    }

    public void enterUsername(String username) throws InterruptedException {
        enterText(
                "//*[@resource-id='txtlblemailaddress_001']",
                "//*[@name='txtlblemailaddress_001']",
                "//*[@resource-id='txtemailaddress_001_text'] | //android.widget.EditText[@focused='true'] | //android.widget.EditText[1]",
                "//*[@name='txtemailaddress_001_text'] | //XCUIElementTypeTextField[@focused='true'] | //XCUIElementTypeTextField[1]",
                username);
    }

    public void dismissKeyboard() throws InterruptedException {
        click(
                "//*[@resource-id='txthello_001']",
                "//*[@name='txthello_001']");
    }

    public void enterPassword(String password) throws InterruptedException {
        type(
                "//*[@resource-id='txtpassword_001_text']",
                "//*[@name='txtpassword_001_text']",
                password);
        Thread.sleep(1000);
    }

    public void submit() throws InterruptedException {
        click(
                "//*[@resource-id='btn_ctrl_btnlogin_001']",
                "//*[@name='btn_ctrl_btnlogin_001']");
    }

    public void assertIncorrectPasswordMessage() {
        visibleText(element(
                "//*[@resource-id='vg_text_popup_title']",
                "//*[@name='vg_text_popup_title']"),
                "Incorrect email or password");
    }

    public void dismissIncorrectPasswordMessage() throws InterruptedException {
        click(
                "//*[@resource-id='btn_vg_btn_ok_001']",
                "//*[@name='ctrl_btngotit_001']");
    }
    public void gotItButton() throws InterruptedException {
        click(
                "//*[@resource-id='btn_vg_btn_ok_001']",
                "//*[@name='ctrl_btngotit_001']");
    }

    public void assertLockoutMessage() {
        visibleText(element(
                "//*[@resource-id='txtunabletologincopy_001']",
                "//*[@name='txtunabletologincopy_001']"),
                "Your account has been locked due to too many incorrect login attempts");
    }

    public void dismissLockoutMessage() throws InterruptedException {
        click(
                "//*[@resource-id='ctrl_btnok_001']",
                "//*[@name='ctrl_btnok_001']");
    }
}

