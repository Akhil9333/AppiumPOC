package screens;

import genericUtils.MobileSessionInit;
import org.json.JSONArray;
import org.json.JSONObject;
import org.testng.Assert;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class MHAQuestionsScreen extends BaseScreen {

    public MHAQuestionsScreen(MobileSessionInit session) {
        super(session);
    }

    public void assert1stSectionHeader() {
        assertTextEquals(element(
                        "//*[@resource-id='tsection_name_text']",
                        "//*[@name='section_name_text']"),
                "Mental health history");
    }

    public void clickSectionNextButton() throws InterruptedException {
        click(
                "//*[@resource-id='btn_ctrl_btnnext_001']",
                "//*[@name='btn_ctrl_btnnext_001']");
    }

    public void clickQuestionNextButton() throws InterruptedException {
        click(
                "//*[@resource-id='btn_vg_next_button'] | //*[@resource-id='btn_vg_submit_button']",
                "//*[@name='btn_vg_next_button'] | //*[@name='btn_vg_submit_button']");
    }

    public void clickSubmitAssessmentButton() throws InterruptedException {
        click(
                "//*[@resource-id='btn_vg_submit_button']",
                "//*[@name='btn_vg_submit_button']");
    }

    public void assertquestions() {
        assertTextEquals(element(
                        "//*[@resource-id='question_0']",
                        "//*[@name='question_0']"),
                "Mental health history");
    }

    public void assertSectionName(String expectedSectionName) {
        assertTextEquals(element(
                        "//*[@resource-id='section_name_text']",
                        "//*[@name='section_name_text']"),
                expectedSectionName);
    }

    public void assertAnswer() {
        assertTextEquals(element(
                        "//*[@resource-id='answer_option_0']",
                        "//*[@name='answer_option_0']"),
                "Mental health history");
    }
//    public void assertSectionName() {
//        assertSectionName("Mental health history");
//    }

    public void enterAnswerAndSelect(String answer) throws InterruptedException {
        if (answer == null || answer.trim().isEmpty()) {
            throw new IllegalArgumentException("Answer must not be blank");
        }

        selectAnswer(0, answer);
        clickQuestionNextButton();
    }

    public void completeAssessment(JSONObject assessment) throws InterruptedException {
        Assert.assertNotNull(assessment, "Assessment JSON must not be null");
        JSONObject assessmentDetails = assessment.getJSONObject("Mental health assessment");
        JSONArray sections = assessmentDetails.getJSONArray("Sections");
        Assert.assertEquals(assessmentDetails.getInt("Count"), sections.length(),
                "Assessment Count must match the number of Sections");

        for (int sectionIndex = 0; sectionIndex < sections.length(); sectionIndex++) {
            JSONObject section = sections.getJSONObject(sectionIndex);
            String sectionName = normalizeConfiguredText(section.getString("Name"));
           //assertSectionName(sectionName);

            JSONArray questions = section.getJSONArray("Questions");
            for (int questionIndex = 0; questionIndex < questions.length(); questionIndex++) {
                JSONObject question = questions.getJSONObject(questionIndex);
                String questionName = normalizeConfiguredText(question.getString("Name"));
               assertQuestion(questionIndex, questionName);

                if ("SelectField".equalsIgnoreCase(question.getString("Type"))) {
                    JSONArray values = question.getJSONArray("Values");
                    Assert.assertTrue(values.length() > 0,
                            "No answer values configured for question: " + questionName);
                    for (int answerIndex = 0; answerIndex < values.length(); answerIndex++) {
                        selectAnswer(questionIndex, values.getString(answerIndex));
                        clickQuestionNextButton();
                    }
                } else {
                    clickQuestionNextButton();
                }
            }

            boolean isLastSection = sectionIndex == sections.length() - 1;
            if (isLastSection) {
                clickSubmitAssessmentButton();
            } else {
                clickSectionNextButton();
            }
        }
    }

    public void completeAssessment(String assessmentJson) throws InterruptedException {
        completeAssessment(new JSONObject(assessmentJson));
    }

    public void completeAssessmentFromResource(String resourceName)
            throws IOException, InterruptedException {
        if (resourceName == null || resourceName.trim().isEmpty()) {
            throw new IllegalArgumentException("Assessment resource name must not be blank");
        }

        String resourcePath = resourceName.startsWith("/")
                ? resourceName.substring(1)
                : resourceName;
        try (InputStream input = Thread.currentThread()
                .getContextClassLoader()
                .getResourceAsStream(resourcePath)) {
            if (input == null) {
                throw new IOException("Assessment resource was not found on the classpath: " + resourcePath);
            }
            completeAssessment(new String(input.readAllBytes(), StandardCharsets.UTF_8));
        }
    }


    private void assertQuestion(int questionIndex, String expectedQuestion) {
        assertTextEquals(element(
                        "//*[@resource-id='question_" + questionIndex + "']",
                        "//*[@name='question_" + questionIndex + "']"),
                expectedQuestion);
    }

    private void selectAnswer(int questionIndex, String answer) throws InterruptedException {
        String normalizedAnswer = answer == null ? "" : normalizeConfiguredText(answer);
        if (normalizedAnswer.isEmpty()) {
            throw new IllegalArgumentException("Answer must not be blank");
        }

        String answerValue = xpathLiteral(normalizedAnswer);
        String androidAnswerXpath = "//*[contains(@resource-id, 'answer_option_') "
                + "and normalize-space(@content-desc)=" + answerValue + "]";
        String iosAnswerXpath = "//*[normalize-space(@label)=" + answerValue
                + " or normalize-space(@name)=" + answerValue + "]";
        Assert.assertTrue(isVisible(androidAnswerXpath, iosAnswerXpath),
                "Configured answer option is not visible for question " + questionIndex
                        + ": " + normalizedAnswer);
        click(
                androidAnswerXpath,
                iosAnswerXpath);
    }

    private String normalizeConfiguredText(String value) {
        return value.replace('\u00a0', ' ').trim();
    }

    private String xpathLiteral(String value) {
        if (!value.contains("'")) {
            return "'" + value + "'";
        }
        if (!value.contains("\"")) {
            return "\"" + value + "\"";
        }

        String[] parts = value.split("'", -1);
        StringBuilder literal = new StringBuilder("concat(");
        for (int index = 0; index < parts.length; index++) {
            if (index > 0) {
                literal.append(", \"'\", ");
            }
            literal.append("'").append(parts[index]).append("'");
        }
        return literal.append(")").toString();
    }
}
