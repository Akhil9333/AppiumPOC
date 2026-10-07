package screens;

import genericUtils.MobileSessionInit;

public class ActivityScreen extends BaseScreen {
    public ActivityScreen(MobileSessionInit session) {
        super(session);
    }

    public ActivityScreen assertActivityHeader() {
        assertTextEquals(element(
                        "//*[@resource-id='txtactivities_001']",
                        "//*[@name='txtactivities_001']"),
                "Activities");
        return new ActivityScreen(session);
    }


    public MHALandingScreen openMHAFeedcard() throws InterruptedException {
        scrollAndClick(
                "//*[@resource-id='Mental Health Assessment Tracking Card_2']",
                "//*[@name='Mental Health Assessment Tracking Card_2']",
                5);
        return new MHALandingScreen(session);
    }
    public ActivityScreen assertMHAInitPoints() {
        assertTextEquals(element(
                        "//*[@resource-id='points_tracker_text_Mental Health Assessment Tracking Card_2']",
                        "//*[@name='points_tracker_text_Mental Health Assessment Tracking Card_2']"),
                "0/600 POINTS");
        return new ActivityScreen(session);
    }
    public ActivityScreen assertMHAInitText() {
        assertTextEquals(element(
                        "//*[@resource-id='activity_card_sub_text_Mental Health Assessment Tracking Card_2']",
                        "//*[@name='activity_card_sub_text_Mental Health Assessment Tracking Card_2']"),
                "Takes <<less than 5>> minutes to complete");
        return new ActivityScreen(session);
    }
//    public boolean visibleMHAIcon() {
//        isVisible(element(
//                        "//*[@resource-id='image_activity_card_Mental Health Assessment Tracking Card_2']",
//                        "//*[@name='image_activity_card_Mental Health Assessment Tracking Card_2']"));
//        return new ActivityScreen(session);
//    }

    public ScreeningVaccinationScreen openScreeningVaccinationFeedcard() throws InterruptedException {
        scrollAndClick(
                "//*[@resource-id='Screenings Vaccinations Tracking_2']",
                "//*[@name='Screenings Vaccinations Tracking_2']",
                5);
        return new ScreeningVaccinationScreen(session);

    }
    public ScreeningVaccinationScreen assertSnVInitPoints() {
        assertTextEquals(element(
                        "//*[@resource-id='points_tracker_text_Screenings Vaccinations Tracking_2']",
                        "//*[@name='points_tracker_text_Screenings Vaccinations Tracking_2']"),
                "0/4,000 POINTS");
        return new ScreeningVaccinationScreen(session);
    }
    public ScreeningVaccinationScreen assertSnVInitText() {
        assertTextEquals(element(
                        "//*[@resource-id='activity_card_sub_text_Screenings Vaccinations Tracking_2']",
                        "//*[@name='activity_card_sub_text_Screenings Vaccinations Tracking_2']"),
                "Submit completed form from healthcare provider");
        return new ScreeningVaccinationScreen(session);
    }
}
