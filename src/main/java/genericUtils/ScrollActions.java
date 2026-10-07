package genericUtils;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Pause;
import org.openqa.selenium.interactions.Sequence;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

/**
 * Generic scroll gestures for mobile screens, kept independent of session
 * lifecycle concerns so it can be reused/tested on its own.
 */
public class ScrollActions {

    private final AppiumDriver driver;
    private final boolean isIOS;

    public ScrollActions(AppiumDriver driver) {
        this(driver, false);
    }

    public ScrollActions(AppiumDriver driver, boolean isIOS) {
        this.driver = driver;
        this.isIOS = isIOS;
    }

    public void scrollUp() {
        scrollUpWithDeviceCoordinates();
    }

    public void scrollUpWithDeviceCoordinates() {
        Dimension screenSize = driver.manage().window().getSize();
        int centerX = screenSize.getWidth() / 2;
        int startY = screenSize.getHeight() / 2;
        int endY = screenSize.getHeight() / 4;

        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "scroll-finger");
        Sequence swipe = new Sequence(finger, 0)
                .addAction(finger.createPointerMove(Duration.ZERO,
                        PointerInput.Origin.viewport(), centerX, startY))
                .addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
                .addAction(new Pause(finger, Duration.ofMillis(150)))
                .addAction(finger.createPointerMove(Duration.ofMillis(isIOS ? 800 : 500),
                        PointerInput.Origin.viewport(), centerX, endY))
                .addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
        driver.perform(Collections.singletonList(swipe));
    }

    public WebElement scrollUpUntilElementFound(By locator, int maxSwipes) throws InterruptedException {
        for (int attempt = 0; attempt <= maxSwipes; attempt++) {
            List<WebElement> elements = driver.findElements(locator);
            if (!elements.isEmpty() && elements.get(0).isDisplayed()) {
                return elements.get(0);
            }

            if (attempt < maxSwipes) {
                scrollUp();
                Thread.sleep(isIOS ? 500 : 1000);
            }
        }

        throw new NoSuchElementException("Element not found after " + maxSwipes + " upward scrolls: " + locator);
    }
}
