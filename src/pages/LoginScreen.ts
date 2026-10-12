import { browser } from '@wdio/globals';
import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

export class LoginScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertHelloVisible(): Promise<void> {
    await this.assertTextEquals(
      await this.element("//*[@resource-id='txthello_001']", "//*[@name='txthello_001']"),
      'Hello'
    );
  }

  enterUsername(username: string): Promise<void> {
    return this.enterText(
      "//*[@resource-id='txtlblemailaddress_001']",
      "//*[@name='txtlblemailaddress_001']",
      "//*[@resource-id='txtemailaddress_001_text'] | //android.widget.EditText[@focused='true'] | //android.widget.EditText[1]",
      "//*[@name='txtemailaddress_001_text'] | //XCUIElementTypeTextField[@focused='true'] | //XCUIElementTypeTextField[1]",
      username
    );
  }

  dismissKeyboard(): Promise<void> {
    return this.click("//*[@resource-id='txthello_001']", "//*[@name='txthello_001']");
  }

  async enterPassword(password: string): Promise<void> {
    await this.type("//*[@resource-id='txtpassword_001_text']", "//*[@name='txtpassword_001_text']", password);
    await browser.pause(1_000);
  }

  submit(): Promise<void> {
    return this.click("//*[@resource-id='btn_ctrl_btnlogin_001']", "//*[@name='btn_ctrl_btnlogin_001']");
  }

  async assertIncorrectPasswordMessage(): Promise<void> {
    const text = await this.visibleText(
      await this.element("//*[@resource-id='vg_text_popup_title']", "//*[@name='vg_text_popup_title']")
    );
    if (!text.includes('Incorrect email or password')) {
      throw new Error(`Expected incorrect-password message but found: ${text}`);
    }
  }

  dismissIncorrectPasswordMessage(): Promise<void> {
    return this.click("//*[@resource-id='ctrl_btngotit_001']", "//*[@name='ctrl_btngotit_001']");
  }

  gotItButton(): Promise<void> {
    return this.dismissIncorrectPasswordMessage();
  }

  async assertLockoutMessage(): Promise<void> {
    const text = await this.visibleText(
      await this.element("//*[@resource-id='txtunabletologincopy_001']", "//*[@name='txtunabletologincopy_001']")
    );
    if (!text.includes('Your account has been locked due to too many incorrect login attempts')) {
      throw new Error(`Expected account lockout message but found: ${text}`);
    }
  }

  dismissLockoutMessage(): Promise<void> {
    return this.click("//*[@resource-id='ctrl_btnok_001']", "//*[@name='ctrl_btnok_001']");
  }
}
