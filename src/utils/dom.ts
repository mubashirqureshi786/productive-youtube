/**
 * DOM Manipulation Utilities
 * Helpers for safely querying and manipulating the DOM
 */

/**
 * Remove elements matching selectors
 */
export function removeElements(selectors: readonly string[]): number {
  let removedCount = 0;

  selectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        el.remove();
        removedCount++;
      });
    } catch (error) {
      console.warn(`Error with selector "${selector}":`, error);
    }
  });

  return removedCount;
}

/**
 * Hide elements matching selectors
 */
export function hideElements(selectors: readonly string[]): number {
  let hiddenCount = 0;

  selectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      elements.forEach((el) => {
        el.style.display = "none";
        hiddenCount++;
      });
    } catch (error) {
      console.warn(`Error with selector "${selector}":`, error);
    }
  });

  return hiddenCount;
}

/**
 * Show elements matching selectors
 */
export function showElements(selectors: readonly string[]): number {
  let shownCount = 0;

  selectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      elements.forEach((el) => {
        el.style.display = "";
        shownCount++;
      });
    } catch (error) {
      console.warn(`Error with selector "${selector}":`, error);
    }
  });

  return shownCount;
}

/**
 * Wait for element to appear in DOM
 */
export function waitForElement(
  selector: string,
  timeout = 5000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Create and inject an element into the DOM
 */
export function injectElement(
  parent: Element,
  tagName: string,
  attributes: Record<string, string> = {},
  position: "prepend" | "append" = "append"
): HTMLElement {
  const element = document.createElement(tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "style") {
      element.style.cssText = value;
    } else if (key === "class") {
      element.className = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  if (position === "prepend") {
    parent.prepend(element);
  } else {
    parent.appendChild(element);
  }

  return element;
}
