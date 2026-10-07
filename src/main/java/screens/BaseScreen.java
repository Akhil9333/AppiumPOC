package screens;

import genericUtils.MobileSessionInit;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

import java.util.List;

public abstract class BaseScreen {

    protected final MobileSessionInit session;

    protected BaseScreen(MobileSessionInit session) {
        this.session = session;
    }

    protected void scrollUp() {
        session.scrollUp();
    }

    protected By locator(String androidXpath, String iosXpath) {
        return session.getPlatformLocator(session.isIOS, androidXpath, iosXpath);
    }

    protected WebElement element(String androidXpath, String iosXpath) {
        return session.waitForElement(session.wait, session.isIOS, androidXpath, iosXpath);
    }

    protected boolean isVisible(String androidXpath, String iosXpath) {
        return session.isElementVisible(session.wait, session.isIOS, androidXpath, iosXpath);
    }

    protected void click(String androidXpath, String iosXpath) throws InterruptedException {
        session.clickElement(session.wait, locator(androidXpath, iosXpath));
    }

    protected void scrollAndClick(String androidXpath, String iosXpath, int maxSwipes) throws InterruptedException {
        if (maxSwipes < 0) {
            throw new IllegalArgumentException("maxSwipes must not be negative");
        }

        By target = locator(androidXpath, iosXpath);
        for (int swipe = 0; swipe <= maxSwipes; swipe++) {
            for (WebElement candidate : session.driver.findElements(target)) {
                if (candidate.isDisplayed()) {
                    session.clickElement(session.wait, target);
                    return;
                }
            }

            if (swipe < maxSwipes) {
                scrollUp();
                Thread.sleep(session.isIOS ? 500 : 1000);
            }
        }

        throw new NoSuchElementException(
                "Element not found after " + maxSwipes + " upward scrolls: " + target);
    }

    public List<WebElement> printMobileElementsByXpath(String xpath) {
        if (xpath == null || xpath.trim().isEmpty()) {
            throw new IllegalArgumentException("XPath must not be blank");
        }

        List<WebElement> elements = session.driver.findElements(By.xpath(xpath));
        System.out.printf("Found %d mobile elements for XPath: %s%n", elements.size(), xpath);
        for (int index = 0; index < elements.size(); index++) {
            System.out.printf(
                    "Mobile element %d: text=%s, resource-id=%s, content-desc=%s, label=%s, name=%s, class=%s, value=%s%n",
                    index + 1,
                    elements.get(index).getText(),
                    elements.get(index).getAttribute("resource-id"),
                    elements.get(index).getAttribute("content-desc"),
                    elements.get(index).getAttribute("label"),
                    elements.get(index).getAttribute("name"));
        }
        return elements;
    }

    protected void type(String androidXpath, String iosXpath, String value) throws InterruptedException {
        session.typeIntoElement(session.wait, locator(androidXpath, iosXpath), value);
    }

    protected void enterText(String androidTriggerXpath,
                             String iosTriggerXpath,
                             String androidEditableXpath,
                             String iosEditableXpath,
                             String value) throws InterruptedException {
        session.enterText(session.wait, session.isIOS,
                androidTriggerXpath,
                iosTriggerXpath,
                androidEditableXpath,
                iosEditableXpath,
                value);
    }

    protected String visibleText(WebElement element, String incorrectPassword) {
        String text = element.getText();
        if (text != null && !text.trim().isEmpty()) {
            return text.trim();
        }
        String attribute = session.isIOS ? element.getAttribute("label") : element.getAttribute("content-desc");
        return attribute == null ? "" : attribute.trim();
    }

    protected String assertTextEquals(WebElement element, String expected) {
        String attribute = session.isIOS ? "label" : "content-desc";
        String actual = element.getAttribute(attribute);
        actual = actual == null ? "" : actual.trim();
        Assert.assertEquals(actual, expected, "Mobile element text did not match");
        return actual;
    }

    protected String assertTextContains(WebElement element, String expected) {
        String attribute = session.isIOS ? "label" : "content-desc";
        String actual = element.getAttribute(attribute);
        actual = actual == null ? "" : actual.trim();
        Assert.assertTrue(actual.contains(expected),
                "Expected mobile element text to contain '" + expected + "' but was: " + actual);
        return actual;
    }

    protected void assertTextContains(WebElement element, String... fragments) {
        String actual = visibleText(element, "Incorrect Password");
        for (String fragment : fragments) {
            if (actual != null && actual.contains(fragment)) {
                return;
            }
        }


        Assert.fail("Expected text to contain one of the fragments but was: " + actual);
    }

    }
