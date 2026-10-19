import { browser } from '@wdio/globals';
import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

const locators = {
  hello: {
    android: "//*[@resource-id='txthello_001']",
    ios: "//*[@name='txthello_001']"
  },
  usernameLabel: {
    android: "//*[@resource-id='txtlblemailaddress_001']",
    ios: "//*[@name='txtlblemailaddress_001']"
  },
  usernameField: {
    android: "//*[@resource-id='txtemailaddress_001_text'] | //android.widget.EditText[@focused='true'] | //android.widget.EditText[1]",
    ios: "//*[@name='txtemailaddress_001_text'] | //XCUIElementTypeTextField[@focused='true'] | //XCUIElementTypeTextField[1]"
  },
  passwordField: {
    android: "//*[@resource-id='txtpassword_001_text']",
    ios: "//*[@name='txtpassword_001_text']"
  },
  loginButton: {
    android: "//*[@resource-id='btn_ctrl_btnlogin_001']",
    ios: "//*[@name='btn_ctrl_btnlogin_001']"
  },
  incorrectPasswordMessage: {
    android: "//*[@resource-id='vg_text_popup_title']",
    ios: "//*[@name='vg_text_popup_title']"
  },
  incorrectPasswordDismissButton: {
    android: "//*[@resource-id='ctrl_btngotit_001']",
    ios: "//*[@name='ctrl_btngotit_001']"
  },
  lockoutMessage: {
    android: "//*[@resource-id='txtunabletologincopy_001']",
    ios: "//*[@name='txtunabletologincopy_001']"
  },
  lockoutDismissButton: {
    android: "//*[@resource-id='ctrl_btnok_001']",
    ios: "//*[@name='ctrl_btnok_001']"
  }
} as const;

export class LoginScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertHelloVisible(): Promise<void> {
    await this.assertTextEquals(
      await this.element(locators.hello.android, locators.hello.ios),
      'Hello'
    );
  }

  enterUsername(username: string): Promise<void> {
    return this.enterText(
      locators.usernameLabel.android,
      locators.usernameLabel.ios,
      locators.usernameField.android,
      locators.usernameField.ios,
      username
    );
  }

  dismissKeyboard(): Promise<void> {
    return this.click(locators.hello.android, locators.hello.ios);
  }

  async enterPassword(password: string): Promise<void> {
    await this.type(locators.passwordField.android, locators.passwordField.ios, password);
    await browser.pause(300);
  }

  submit(): Promise<void> {
    return this.click(locators.loginButton.android, locators.loginButton.ios);
  }

  async assertIncorrectPasswordMessage(): Promise<void> {
    const text = await this.visibleText(
      await this.element(locators.incorrectPasswordMessage.android, locators.incorrectPasswordMessage.ios)
    );
    if (!text.includes('Incorrect email or password')) {
      throw new Error(`Expected incorrect-password message but found: ${text}`);
    }
  }

  dismissIncorrectPasswordMessage(): Promise<void> {
    return this.click(locators.incorrectPasswordDismissButton.android, locators.incorrectPasswordDismissButton.ios);
  }

  gotItButton(): Promise<void> {
    return this.dismissIncorrectPasswordMessage();
  }

  async assertLockoutMessage(): Promise<void> {
    const text = await this.visibleText(
      await this.element(locators.lockoutMessage.android, locators.lockoutMessage.ios)
    );
    if (!text.includes('Your account has been locked due to too many incorrect login attempts')) {
      throw new Error(`Expected account lockout message but found: ${text}`);
    }
  }

  dismissLockoutMessage(): Promise<void> {
    return this.click(locators.lockoutDismissButton.android, locators.lockoutDismissButton.ios);
  }
}
