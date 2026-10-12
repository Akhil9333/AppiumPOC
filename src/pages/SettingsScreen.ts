import assert from 'node:assert/strict';
import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

export class SettingsScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertLoaded(): Promise<void> {
    assert.ok(await (await this.element("//*[@resource-id='txtsettings_001']", "//*[@name='txtsettings_001']")).isDisplayed());
  }

  scrollToLogoutAndTap(): Promise<void> {
    return this.scrollAndClick("//*[@resource-id='ctrl_logout_001']", "//*[@name='ctrl_logout_001']", 10);
  }

  async assertLogoutConfirmation(): Promise<void> {
    await this.assertTextEquals(
      await this.element("//*[@resource-id='dialog_body_areyouwanttologout_001']", "//*[@name='dialog_body_areyouwanttologout_001']"),
      'Are you sure you want to log out?'
    );
  }

  confirmLogout(): Promise<void> {
    return this.click("//*[@resource-id='dialog_btn1_yeslogout_001']", "//*[@name='dialog_btn1_yeslogout_001']");
  }
}
