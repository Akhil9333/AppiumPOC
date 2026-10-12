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

export class MHAQuestionsScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assert1stSectionHeader(): Promise<void> {
    await this.assertTextEquals(await this.element("//*[@resource-id='tsection_name_text']", 
      "//*[@name='tsection_name_text']"), 'Mental health history');
  }

  clickSectionNextButton(): Promise<void> {
    return this.click("//*[@resource-id='btn_ctrl_btnnext_001']", 
      "//*[@name='btn_ctrl_btnnext_001']");
  }

  clickQuestionNextButton(): Promise<void> {
    return this.click("//*[@resource-id='btn_vg_next_button'] | //*[@resource-id='btn_vg_submit_button']",
       "//*[@name='btn_vg_next_button'] | //*[@name='btn_vg_submit_button']");
  }

  clickSubmitAssessmentButton(): Promise<void> {
    return this.click("//*[@resource-id='btn_vg_submit_button']", 
      "//*[@name='btn_vg_submit_button']");
  }

  async assertquestions(): Promise<void> {
    await this.assertTextEquals(await this.element("//*[@resource-id='question_0']", 
      "//*[@name='question_0']"), 'Mental health history');
  }

  async assertSectionName(expectedSectionName: string): Promise<void> {
    await this.assertTextEquals(await this.element("//*[@resource-id='section_name_text']", "//*[@name='section_name_text']"), expectedSectionName);
  }

  async assertAnswer(): Promise<void> {
    await this.assertTextEquals(await this.element("//*[@resource-id='answer_option_0']", "//*[@name='answer_option_0']"), 'Mental health history');
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
    await this.assertTextEquals(
      await this.element(`//*[@resource-id='question_${questionIndex}']`, `~question_${questionIndex}`),
      expectedQuestion
    );
  }

  private async selectAnswer(questionIndex: number, answer: string): Promise<void> {
    const normalizedAnswer = normalizeConfiguredText(answer ?? '');
    if (!normalizedAnswer) {
      throw new TypeError('Answer must not be blank');
    }

    const answerValue = xpathLiteral(normalizedAnswer);
    const androidAnswerXpath = `//*[contains(@resource-id, 'answer_option_') and normalize-space(@content-desc)=${answerValue}]`;
    const labelPattern = `[ \\t\\r\\n]*${normalizedAnswer
      .split(' ')
      .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('[ \\t\\r\\n]+')}[ \\t\\r\\n]*`;
    const iosAnswerSelector = `-ios predicate string:name CONTAINS "answer_option_" AND label MATCHES ${JSON.stringify(labelPattern)}`;
    const selector = this.session.getPlatformLocator(androidAnswerXpath, iosAnswerSelector);
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
