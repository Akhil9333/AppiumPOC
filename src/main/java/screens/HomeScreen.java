package screens;

import genericUtils.MobileSessionInit;

public class HomeScreen extends BaseScreen {

    public HomeScreen(MobileSessionInit session) {
        super(session);
    }

    public void assertGreetingVisible() {
        assertTextContains(element(
                "//*[@resource-id='vg_text_header_greeting']",
                "//*[@name='vg_text_header_greeting']"),
                "Good morning",
                "Good afternoon",
                "Good evening");
    }

    public void dismissNotificationPopup() throws InterruptedException {
        click(
                "//*[@resource-id='ctrl_btnok_001']",
                "//*[@name='ctrl_btnok_001']");
    }

    public void acceptPermissionDialog() throws InterruptedException {
        click(
                "//*[@text='Allow']",
                "//*[@name='ctrl_btnallow_001']");
    }

    public ProfileScreen openProfileTab() throws InterruptedException {
        click(
                "//*[@resource-id='vg_icon_bottom_nav_bar_circle_user']",
                "//*[@name='vg_icon_bottom_nav_bar_circle_user']");
        return new ProfileScreen(session);
    }
    public ActivityScreen openActivityTab() throws InterruptedException {
        click(
                "//*[@resource-id='vg_icon_bottom_nav_bar_clip_board_check']",
                "//*[@name='vg_icon_bottom_nav_bar_clip_board_check']");
        return new ActivityScreen(session);

    }


}

