import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';
import { ProfileScreen } from './ProfileScreen.js';
import { ActivityScreen } from './ActivityScreen.js';

const locators = {
  greeting: {
    android: "//*[@resource-id='vg_text_header_greeting']",
    ios: "//*[@name='vg_text_header_greeting']"
  },
  notificationPopupClose: {
    android: "//*[@resource-id='vg_cancel_icon' or @resource-id='ctrl_btnok_001']",
    ios: "//*[@name='vg_cancel_icon' or @name='ctrl_btnok_001']"
  },
  allowPermission: {
    android: "//*[@text='Allow']",
    ios: "//*[@name='ctrl_btnallow_001']"
  },
  profileTab: {
    android: "//*[@resource-id='vg_icon_bottom_nav_bar_circle_user']",
    ios: "//*[@name='vg_icon_bottom_nav_bar_circle_user']"
  },
  activityTab: {
    android: "//*[@resource-id='vg_icon_bottom_nav_bar_clip_board_check']",
    ios: "//*[@name='vg_icon_bottom_nav_bar_clip_board_check']"
  }
} as const;

export class HomeScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertGreetingVisible(): Promise<void> {
    await this.assertTextContains(
      await this.element(locators.greeting.android, locators.greeting.ios),
      'Good morning',
      'Good afternoon',
      'Good evening'
    );
  }

  async dismissNotificationPopup(): Promise<void> {
    if (await this.isVisible(locators.notificationPopupClose.android, locators.notificationPopupClose.ios)) {
      await this.click(locators.notificationPopupClose.android, locators.notificationPopupClose.ios);
    }
  }

  acceptPermissionDialog(): Promise<void> {
    return this.click(locators.allowPermission.android, locators.allowPermission.ios);
  }

  async openProfileTab(): Promise<ProfileScreen> {
    await this.click(locators.profileTab.android, locators.profileTab.ios);
    return new ProfileScreen(this.session);
  }

  async openActivityTab(): Promise<ActivityScreen> {
    await this.click(locators.activityTab.android, locators.activityTab.ios);
    return new ActivityScreen(this.session);
  }
}
