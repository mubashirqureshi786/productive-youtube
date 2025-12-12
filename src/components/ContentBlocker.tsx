/**
 * ContentBlocker Component
 * Handles blocking of YouTube content (Shorts, suggestions, etc.)
 */

import { useEffect } from "react";
import { useSettings } from "../hooks";
import {
  hideElementsWithTracking,
  showElementsWithTracking,
} from "../utils/dom";
import {
  SHORTS_SELECTORS,
  SHORTS_BUTTON_SELECTORS,
  VIDEO_SUGGESTIONS_SELECTORS,
  HOMEPAGE_VIDEO_SELECTORS,
} from "../constants/selectors";
import { throttle } from "../utils/helpers";

export function ContentBlocker() {
  const { settings } = useSettings();

  // Separate effect for when settings change - run immediately
  useEffect(() => {
    if (!settings) {
      console.log("ContentBlocker: Waiting for settings...");
      return;
    }

    console.log(
      "ContentBlocker: Settings changed, running blocking logic immediately",
      {
        removeShorts: settings.removeShorts,
        removeShortsButton: settings.removeShortsButton,
        removeHomepageVideos: settings.removeHomepageVideos,
        removeWatchPageSuggestions: settings.removeWatchPageSuggestions,
      }
    );

    // Execute blocking logic immediately when settings change (no throttle)
    let hidden = 0;
    let shown = 0;

    // Handle Shorts
    if (settings.removeShorts) {
      hidden += hideElementsWithTracking(SHORTS_SELECTORS, "shortsHidden");
    } else {
      shown += showElementsWithTracking(SHORTS_SELECTORS, "shortsHidden");
    }

    // Handle Shorts Button
    if (settings.removeShortsButton) {
      hidden += hideElementsWithTracking(
        SHORTS_BUTTON_SELECTORS,
        "shortsButtonHidden"
      );
    } else {
      shown += showElementsWithTracking(
        SHORTS_BUTTON_SELECTORS,
        "shortsButtonHidden"
      );
    }

    // Handle Homepage Videos
    const isHomepage =
      window.location.pathname === "/" ||
      window.location.pathname === "" ||
      window.location.pathname === "/feed/explore" ||
      window.location.pathname.startsWith("/feed");

    if (isHomepage) {
      if (settings.removeHomepageVideos) {
        console.log("ContentBlocker: Settings change - hiding homepage videos");
        hidden += hideElementsWithTracking(
          HOMEPAGE_VIDEO_SELECTORS,
          "homepageHidden"
        );
      } else {
        console.log(
          "ContentBlocker: Settings change - showing homepage videos"
        );
        shown += showElementsWithTracking(
          HOMEPAGE_VIDEO_SELECTORS,
          "homepageHidden"
        );
      }
    }

    // Handle Watch Page Suggestions
    if (window.location.pathname === "/watch") {
      if (settings.removeWatchPageSuggestions) {
        hidden += hideElementsWithTracking(
          VIDEO_SUGGESTIONS_SELECTORS,
          "suggestionsHidden"
        );
      } else {
        shown += showElementsWithTracking(
          VIDEO_SUGGESTIONS_SELECTORS,
          "suggestionsHidden"
        );
      }
    }

    if (hidden > 0) {
      console.log(`ContentBlocker: Immediately hidden ${hidden} elements`);
    }
    if (shown > 0) {
      console.log(`ContentBlocker: Immediately restored ${shown} elements`);
    }
  }, [settings]);

  // Separate effect for DOM monitoring with throttle
  useEffect(() => {
    if (!settings) {
      return;
    }

    const blockContent = throttle(() => {
      let hidden = 0;
      let shown = 0;

      // Handle Shorts
      if (settings.removeShorts) {
        hidden += hideElementsWithTracking(SHORTS_SELECTORS, "shortsHidden");
      } else {
        shown += showElementsWithTracking(SHORTS_SELECTORS, "shortsHidden");
      }

      // Handle Shorts Button
      if (settings.removeShortsButton) {
        hidden += hideElementsWithTracking(
          SHORTS_BUTTON_SELECTORS,
          "shortsButtonHidden"
        );
      } else {
        shown += showElementsWithTracking(
          SHORTS_BUTTON_SELECTORS,
          "shortsButtonHidden"
        );
      }

      // Handle Homepage Videos
      const isHomepage =
        window.location.pathname === "/" ||
        window.location.pathname === "" ||
        window.location.pathname === "/feed/explore" ||
        window.location.pathname.startsWith("/feed");

      if (isHomepage) {
        if (settings.removeHomepageVideos) {
          hidden += hideElementsWithTracking(
            HOMEPAGE_VIDEO_SELECTORS,
            "homepageHidden"
          );
        } else {
          shown += showElementsWithTracking(
            HOMEPAGE_VIDEO_SELECTORS,
            "homepageHidden"
          );
        }
      }

      // Handle Watch Page Suggestions
      if (window.location.pathname === "/watch") {
        if (settings.removeWatchPageSuggestions) {
          hidden += hideElementsWithTracking(
            VIDEO_SUGGESTIONS_SELECTORS,
            "suggestionsHidden"
          );
        } else {
          shown += showElementsWithTracking(
            VIDEO_SUGGESTIONS_SELECTORS,
            "suggestionsHidden"
          );
        }
      }

      if (hidden > 0) {
        console.debug(
          `ContentBlocker: DOM mutation - hidden ${hidden} elements`
        );
      }
      if (shown > 0) {
        console.debug(`ContentBlocker: DOM mutation - shown ${shown} elements`);
      }
    }, 500);

    // Watch for DOM changes (debounced)
    const observer = new MutationObserver(blockContent);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Listen for navigation
    const handleNavigation = () => {
      console.log("ContentBlocker: Page navigation detected");
      setTimeout(() => {
        let hidden = 0;
        let shown = 0;

        // Re-apply all blocking rules after navigation
        if (settings.removeShorts) {
          hidden += hideElementsWithTracking(SHORTS_SELECTORS, "shortsHidden");
        } else {
          shown += showElementsWithTracking(SHORTS_SELECTORS, "shortsHidden");
        }

        if (settings.removeShortsButton) {
          hidden += hideElementsWithTracking(
            SHORTS_BUTTON_SELECTORS,
            "shortsButtonHidden"
          );
        } else {
          shown += showElementsWithTracking(
            SHORTS_BUTTON_SELECTORS,
            "shortsButtonHidden"
          );
        }

        const isHomepage =
          window.location.pathname === "/" ||
          window.location.pathname === "" ||
          window.location.pathname === "/feed/explore" ||
          window.location.pathname.startsWith("/feed");

        if (isHomepage) {
          if (settings.removeHomepageVideos) {
            hidden += hideElementsWithTracking(
              HOMEPAGE_VIDEO_SELECTORS,
              "homepageHidden"
            );
          } else {
            shown += showElementsWithTracking(
              HOMEPAGE_VIDEO_SELECTORS,
              "homepageHidden"
            );
          }
        }

        if (window.location.pathname === "/watch") {
          if (settings.removeWatchPageSuggestions) {
            hidden += hideElementsWithTracking(
              VIDEO_SUGGESTIONS_SELECTORS,
              "suggestionsHidden"
            );
          } else {
            shown += showElementsWithTracking(
              VIDEO_SUGGESTIONS_SELECTORS,
              "suggestionsHidden"
            );
          }
        }

        console.log(
          `ContentBlocker: After navigation - hidden ${hidden}, shown ${shown}`
        );
      }, 100);
    };

    window.addEventListener("yt-navigate-finish", handleNavigation);

    return () => {
      observer.disconnect();
      window.removeEventListener("yt-navigate-finish", handleNavigation);
    };
  }, [settings]);

  return null; // This is a non-visual component
}
