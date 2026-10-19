import assert from 'node:assert/strict';
import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

const locators = {
  settingsHeader: {
    android: "//*[@resource-id='txtsettings_001']",
    ios: "//*[@name='txtsettings_001']"
  },
  logoutButton: {
    android: "//*[@resource-id='ctrl_logout_001']",
    ios: "//*[@name='ctrl_logout_001']"
  },
  logoutConfirmation: {
    android: "//*[@resource-id='dialog_body_areyouwanttologout_001']",
    ios: "//*[@name='dialog_body_areyouwanttologout_001']"
  },
  confirmLogoutButton: {
    android: "//*[@resource-id='dialog_btn1_yeslogout_001']",
    ios: "//*[@name='dialog_btn1_yeslogout_001']"
  }
} as const;

export class SettingsScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertLoaded(): Promise<void> {
    assert.ok(await (await this.element(locators.settingsHeader.android, locators.settingsHeader.ios)).isDisplayed());
  }

  scrollToLogoutAndTap(): Promise<void> {
    return this.scrollAndClick(locators.logoutButton.android, locators.logoutButton.ios, 10);
  }

  async assertLogoutConfirmation(): Promise<void> {
    await this.assertTextEquals(
      await this.element(locators.logoutConfirmation.android, locators.logoutConfirmation.ios),
      'Are you sure you want to log out?'
    );
  }

  confirmLogout(): Promise<void> {
    return this.click(locators.confirmLogoutButton.android, locators.confirmLogoutButton.ios);
  }
}
