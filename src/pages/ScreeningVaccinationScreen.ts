import assert from 'node:assert/strict';
import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

export class ScreeningVaccinationScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertFormLoaded(): Promise<void> {
    assert.ok(await this.isVisible("//*[contains(@text, 'Type') or contains(@content-desc, 'Type')]", "//*[contains(@name, 'Type') or contains(@label, 'Type')]"), 'Screening vaccination form type field was not displayed');
    assert.ok(await this.isVisible("//*[contains(@text, 'Date') or contains(@content-desc, 'Date')]", "//*[contains(@name, 'Date') or contains(@label, 'Date')]"), 'Screening vaccination form date field was not displayed');
    assert.ok(await this.isVisible("//*[contains(@text, 'Upload') or contains(@content-desc, 'Upload')]", "//*[contains(@name, 'Upload') or contains(@label, 'Upload')]"), 'Screening vaccination form upload control was not displayed');
  }

  async assertImageElementVisible(): Promise<void> {
    assert.ok(await this.isVisible('//android.widget.ImageView', '//XCUIElementTypeImage'), 'No visible image element was found on the screening vaccination screen');
  }

  async selectFluType(): Promise<void> {
    await this.click("//*[contains(@text, 'Type') or contains(@content-desc, 'Type')]", "//*[contains(@name, 'Type') or contains(@label, 'Type')]");
    await this.click("//*[@text='Flu' or @content-desc='Flu']", "//*[@name='Flu' or @label='Flu']");
  }

  async selectCurrentDate(): Promise<void> {
    await this.click("//*[contains(@text, 'Date') or contains(@content-desc, 'Date')]", "//*[contains(@name, 'Date') or contains(@label, 'Date')]");

    const today = String(new Date().getDate());
    const dayXpath = `//*[@text='${today}' or @content-desc='${today}']`;
    const iosDayXpath = `//*[@name='${today}' or @label='${today}']`;
    assert.ok(await this.isVisible(dayXpath, iosDayXpath), 'Current day was not available in the date picker');
    await this.click(dayXpath, iosDayXpath);

    const androidConfirm = "//*[@text='OK' or @text='Done' or @text='Select']";
    const iosConfirm = "//*[@name='Done' or @label='Done' or @name='Select' or @label='Select']";
    if (await this.isVisible(androidConfirm, iosConfirm)) {
      await this.click(androidConfirm, iosConfirm);
    }
  }

  async uploadPdfFromDevice(): Promise<void> {
    await this.click("//*[contains(@text, 'Upload') or contains(@content-desc, 'Upload')]", "//*[contains(@name, 'Upload') or contains(@label, 'Upload')]");
    await this.click("//*[@text='Select PDF' or @content-desc='Select PDF']", "//*[@name='Select PDF' or @label='Select PDF']");

    const androidPdf = "//*[contains(translate(@text, 'PDF', 'pdf'), '.pdf') or contains(translate(@content-desc, 'PDF', 'pdf'), '.pdf')]";
    const iosPdf = "//*[contains(translate(@name, 'PDF', 'pdf'), '.pdf') or contains(translate(@label, 'PDF', 'pdf'), '.pdf')]";
    await (await this.element(androidPdf, iosPdf)).click();
  }

  submitForm(): Promise<void> {
    return this.click("//*[@text='Submit' or @content-desc='Submit']", "//*[@name='Submit' or @label='Submit']");
  }

  async assertSubmissionSuccessful(): Promise<void> {
    assert.ok(
      await this.isVisible(
        "//*[contains(translate(@text, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'proof submitted successfully') or contains(translate(@content-desc, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'proof submitted successfully')]",
        "//*[contains(translate(@name, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'proof submitted successfully') or contains(translate(@label, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'proof submitted successfully')]"
      ),
      'Proof submission success message was not displayed'
    );
  }

  tapDone(): Promise<void> {
    return this.click("//*[@text='Done' or @content-desc='Done']", "//*[@name='Done' or @label='Done']");
  }
}
