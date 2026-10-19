import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

interface AssessmentQuestion {
  Name: string;
  Type: string;
  Values?: string[];
}

interface AssessmentSection {
  Name: string;
  Questions: AssessmentQuestion[];
}

interface AssessmentDocument {
  'Mental health assessment': {
    Count: number;
    Sections: AssessmentSection[];
  };
}

const locators = {
  firstSectionHeader: {
    android: "//*[@resource-id='tsection_name_text']",
    ios: "//*[@name='tsection_name_text']"
  },
  sectionNextButton: {
    android: "//*[@resource-id='btn_ctrl_btnnext_001']",
    ios: "//*[@name='btn_ctrl_btnnext_001']"
  },
  questionNextButton: {
    android: "//*[@resource-id='btn_vg_next_button'] | //*[@resource-id='btn_vg_submit_button']",
    ios: "//*[@name='btn_vg_next_button'] | //*[@name='btn_vg_submit_button']"
  },
  submitAssessmentButton: {
    android: "//*[@resource-id='btn_vg_submit_button']",
    ios: "//*[@name='btn_vg_submit_button']"
  },
  unansweredQuestionNextButton: {
    android: "//*[@resource-id='btn_vg_next_button']",
    ios: "//*[@name='btn_vg_next_button']"
  },
  closeAssessmentButton: {
    android: "//*[@resource-id='vg_close_button']",
    ios: "//*[@name='vg_close_button']"
  },
  exitConfirmation: {
    android: "//*[@resource-id='txtareyousureyouwanttoclosethesurvey_001']",
    ios: "//*[@name='txtareyousureyouwanttoclosethesurvey_001']"
  },
  confirmExitButton: {
    android: "//*[@resource-id='ctrl_txtyes_001']",
    ios: "//*[@name='ctrl_txtyes_001']"
  },
  firstQuestion: {
    android: "//*[@resource-id='question_0']",
    ios: "//*[@name='question_0']"
  },
  sectionName: {
    android: "//*[@resource-id='section_name_text']",
    ios: "//*[@name='section_name_text']"
  },
  firstAnswerOption: {
    android: "//*[@resource-id='answer_option_0']",
    ios: "//*[@name='answer_option_0']"
  },
  question: (questionIndex: number) => ({
    android: `//*[@resource-id='question_${questionIndex}']`,
    ios: `~question_${questionIndex}`
  }),
  answerOption: (answer: string) => {
    const normalizedAnswer = normalizeConfiguredText(answer);
    const answerValue = xpathLiteral(normalizedAnswer);
    const android = `//*[contains(@resource-id, 'answer_option_') and normalize-space(@content-desc)=${answerValue}]`;
    const labelPattern = `[ \\t\\r\\n]*${normalizedAnswer
      .split(' ')
      .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('[ \\t\\r\\n]+')}[ \\t\\r\\n]*`;
    const ios = `-ios predicate string:name CONTAINS "answer_option_" AND label MATCHES ${JSON.stringify(labelPattern)}`;
    return { android, ios };
  }
} as const;

export class MHAQuestionsScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assert1stSectionHeader(): Promise<void> {
    await this.assertTextEquals(await this.element(locators.firstSectionHeader.android, locators.firstSectionHeader.ios), 'Mental health history');
  }

  clickSectionNextButton(): Promise<void> {
    return this.click(locators.sectionNextButton.android, locators.sectionNextButton.ios);
  }

  clickQuestionNextButton(): Promise<void> {
    return this.click(locators.questionNextButton.android, locators.questionNextButton.ios);
  }

  clickSubmitAssessmentButton(): Promise<void> {
    return this.click(locators.submitAssessmentButton.android, locators.submitAssessmentButton.ios);
  }

  async assertUnansweredQuestionNextDisabled(expectedQuestion: string): Promise<void> {
    await this.assertQuestion(0, normalizeConfiguredText(expectedQuestion));
    const nextButton = await this.element(
      locators.unansweredQuestionNextButton.android, locators.unansweredQuestionNextButton.ios
    );
    assert.equal(await nextButton.isEnabled(), false, 'MHA Next must be disabled before selecting an answer');
    await this.assertQuestion(0, normalizeConfiguredText(expectedQuestion));
  }

  closeAssessment(): Promise<void> {
    return this.click(locators.closeAssessmentButton.android, locators.closeAssessmentButton.ios);
  }

  async confirmAssessmentExit(): Promise<void> {
    await this.assertTextEquals(
      await this.element(
        locators.exitConfirmation.android,
        locators.exitConfirmation.ios
      ),
      'Are you sure you want to exit this assessment?'
    );
    await this.click(locators.confirmExitButton.android, locators.confirmExitButton.ios);
  }

  async assertquestions(): Promise<void> {
    await this.assertTextEquals(await this.element(locators.firstQuestion.android, locators.firstQuestion.ios), 'Mental health history');
  }

  async assertSectionName(expectedSectionName: string): Promise<void> {
    await this.assertTextEquals(await this.element(locators.sectionName.android, locators.sectionName.ios), expectedSectionName);
  }

  async assertAnswer(): Promise<void> {
    await this.assertTextEquals(await this.element(locators.firstAnswerOption.android, locators.firstAnswerOption.ios), 'Mental health history');
  }

  async enterAnswerAndSelect(answer: string): Promise<void> {
    if (!answer.trim()) {
      throw new TypeError('Answer must not be blank');
    }
    await this.selectAnswer(0, answer);
    await this.clickQuestionNextButton();
  }

  async completeAssessment(assessment: AssessmentDocument): Promise<void> {
    assert.ok(assessment, 'Assessment JSON must not be null');
    const details = assessment['Mental health assessment'];
    assert.ok(details, 'Assessment must include "Mental health assessment"');
    assert.equal(details.Count, details.Sections.length, 'Assessment Count must match the number of Sections');

    for (let sectionIndex = 0; sectionIndex < details.Sections.length; sectionIndex++) {
      const section = details.Sections[sectionIndex];
      this.recordStep(`Starting MHA section ${sectionIndex + 1}/${details.Sections.length}: ${section.Name}`);
      for (let questionIndex = 0; questionIndex < section.Questions.length; questionIndex++) {
        const question = section.Questions[questionIndex];
        const isFinalQuestion = sectionIndex === details.Sections.length - 1
          && questionIndex === section.Questions.length - 1;
        this.recordStep(`MHA question ${questionIndex + 1}/${section.Questions.length}: ${question.Name}`);
        await this.assertQuestion(questionIndex, normalizeConfiguredText(question.Name));

        if (question.Type.toLowerCase() === 'selectfield') {
          const values = question.Values ?? [];
          assert.ok(values.length > 0, `No answer values configured for question: ${question.Name}`);
          for (let answerIndex = 0; answerIndex < values.length; answerIndex++) {
            await this.selectAnswer(questionIndex, values[answerIndex]);
            if (!isFinalQuestion || answerIndex < values.length - 1) {
              await this.clickQuestionNextButton();
            }
          }
        } else if (!isFinalQuestion) {
          await this.clickQuestionNextButton();
        }
      }

      if (sectionIndex === details.Sections.length - 1) {
        await this.clickSubmitAssessmentButton();
      } else {
        await this.clickSectionNextButton();
      }
    }
  }

  async completeAssessmentFromResource(resourceName: string): Promise<void> {
    if (!resourceName.trim()) {
      throw new TypeError('Assessment resource name must not be blank');
    }

    const fileName = path.basename(resourceName);
    const resourcePath = new URL(`../../tests/fixtures/${fileName}`, import.meta.url);
    const assessment = JSON.parse(await readFile(resourcePath, 'utf8')) as AssessmentDocument;
    await this.completeAssessment(assessment);
  }

  private async assertQuestion(questionIndex: number, expectedQuestion: string): Promise<void> {
    const questionLocator = locators.question(questionIndex);
    await this.assertTextEquals(
      await this.element(questionLocator.android, questionLocator.ios),
      expectedQuestion
    );
  }

  private async selectAnswer(questionIndex: number, answer: string): Promise<void> {
    const normalizedAnswer = normalizeConfiguredText(answer ?? '');
    if (!normalizedAnswer) {
      throw new TypeError('Answer must not be blank');
    }

    const answerLocator = locators.answerOption(normalizedAnswer);
    const selector = this.session.getPlatformLocator(answerLocator.android, answerLocator.ios);
    this.recordStep(`Selecting answer for MHA question ${questionIndex + 1}: ${normalizedAnswer}`);
    await this.session.clickElement(selector);
  }
}

function normalizeConfiguredText(value: string): string {
  return value.replace(/\u00a0/g, ' ').trim();
}

function xpathLiteral(value: string): string {
  if (!value.includes("'")) {
    return `'${value}'`;
  }
  if (!value.includes('"')) {
    return `"${value}"`;
  }
  return `concat(${value.split("'").map((part, index) => `${index ? `, "'", ` : ''}'${part}'`).join('')})`;
}
