/**
 * Test: Homepage Video Removal
 * Verifies that homepage videos are correctly identified and hidden
 */

import { test, expect } from "@playwright/test";

test.describe("Homepage Video Removal", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to YouTube homepage
    await page.goto("https://www.youtube.com");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Wait for video grid to appear
    await page.waitForSelector("ytd-rich-item-renderer", { timeout: 10000 });
  });

  test("should find homepage video elements", async ({ page }) => {
    // Check that video items exist before extension runs
    const videoItems = await page.locator("ytd-rich-item-renderer").count();

    console.log(`Found ${videoItems} video items on homepage`);
    expect(videoItems).toBeGreaterThan(0);
  });

  test("should hide videos when removeHomepageVideos is enabled", async ({
    page,
  }) => {
    // Set extension setting
    await page.evaluate(() => {
      chrome.storage.local.set({ removeHomepageVideos: true });
    });

    // Wait for extension to process
    await page.waitForTimeout(2000);

    // Check that videos are hidden (have data attribute and display:none)
    const hiddenVideos = await page
      .locator('ytd-rich-item-renderer[data-homepage-hidden="true"]')
      .count();

    console.log(`${hiddenVideos} videos are hidden`);
    expect(hiddenVideos).toBeGreaterThan(0);

    // Verify videos are not visible
    const visibleVideos = await page
      .locator("ytd-rich-item-renderer:visible")
      .count();
    expect(visibleVideos).toBe(0);
  });

  test("should restore videos when removeHomepageVideos is disabled", async ({
    page,
  }) => {
    // First hide videos
    await page.evaluate(() => {
      chrome.storage.local.set({ removeHomepageVideos: true });
    });
    await page.waitForTimeout(1000);

    // Then show them again
    await page.evaluate(() => {
      chrome.storage.local.set({ removeHomepageVideos: false });
    });
    await page.waitForTimeout(1000);

    // Verify videos are visible again
    const visibleVideos = await page
      .locator("ytd-rich-item-renderer:visible")
      .count();
    expect(visibleVideos).toBeGreaterThan(0);

    // Verify no data attribute remains
    const markedVideos = await page
      .locator("ytd-rich-item-renderer[data-homepage-hidden]")
      .count();
    expect(markedVideos).toBe(0);
  });

  test("should handle dynamically loaded videos", async ({ page }) => {
    await page.evaluate(() => {
      chrome.storage.local.set({ removeHomepageVideos: true });
    });
    await page.waitForTimeout(1000);

    // Scroll to load more videos
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(2000);

    // New videos should also be hidden
    const allVideos = await page.locator("ytd-rich-item-renderer").count();
    const hiddenVideos = await page
      .locator('ytd-rich-item-renderer[data-homepage-hidden="true"]')
      .count();

    // Most videos should be hidden (allowing some margin for ads/promoted content)
    expect(hiddenVideos).toBeGreaterThan(allVideos * 0.8);
  });

  test("should not break navigation or other UI elements", async ({ page }) => {
    await page.evaluate(() => {
      chrome.storage.local.set({ removeHomepageVideos: true });
    });
    await page.waitForTimeout(1000);

    // Verify header is still visible
    const header = await page.locator("#masthead-container");
    await expect(header).toBeVisible();

    // Verify sidebar is still visible
    const sidebar = await page.locator("#guide");
    await expect(sidebar).toBeVisible();

    // Verify can still search
    const searchBox = await page.locator("input#search");
    await expect(searchBox).toBeVisible();
    await expect(searchBox).toBeEnabled();
  });
});

/**
 * Manual Test Instructions:
 *
 * 1. Build the extension: npm run build
 * 2. Load unpacked extension from dist/ folder in Chrome
 * 3. Go to youtube.com
 * 4. Open DevTools console
 * 5. Look for logs:
 *    - "ContentBlocker: Active on / with settings: ..."
 *    - "ContentBlocker: Attempting to hide homepage videos..."
 *    - "ContentBlocker: Successfully hid X homepage videos"
 * 6. Verify videos are hidden
 * 7. Open extension popup, toggle "Remove Homepage Videos" OFF
 * 8. Verify videos reappear
 * 9. Toggle ON again
 * 10. Scroll down to load more videos
 * 11. Verify new videos are also hidden
 *
 * Expected Console Output:
 * ✓ Productive YouTube: Initializing...
 * ✓ Productive YouTube: React app mounted
 * ✓ ContentBlocker: Active on / with settings: {removeHomepageVideos: true, ...}
 * ✓ ContentBlocker: Attempting to hide homepage videos...
 * ✓ Selector "ytd-browse[page-subtype="home"] ytd-rich-item-renderer" matched 30 elements, hid 30
 * ✓ ContentBlocker: Successfully hid 30 homepage videos
 * ✓ ContentBlocker: Hidden 30 elements
 */
