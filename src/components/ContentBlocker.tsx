/**
 * ContentBlocker Component
 * Handles blocking of YouTube content (Shorts, suggestions, etc.)
 */

import { useEffect } from "react";
import { useSettings } from "../hooks";
import { removeElements } from "../utils/dom";
import {
  SHORTS_SELECTORS,
  SHORTS_BUTTON_SELECTORS,
  VIDEO_SUGGESTIONS_SELECTORS,
  HOMEPAGE_VIDEO_SELECTORS,
} from "../constants/selectors";
import { throttle } from "../utils/helpers";

export function ContentBlocker() {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) {
      console.log("ContentBlocker: Waiting for settings...");
      return;
    }

    console.log("ContentBlocker: Settings changed:", {
      removeShorts: settings.removeShorts,
      removeShortsButton: settings.removeShortsButton,
      removeHomepageVideos: settings.removeHomepageVideos,
      removeWatchPageSuggestions: settings.removeWatchPageSuggestions,
      showTranscript: settings.showTranscript,
    });

    const blockContent = throttle(() => {
      let blocked = 0;

      if (settings.removeShorts) {
        blocked += removeElements(SHORTS_SELECTORS);
      }

      if (settings.removeShortsButton) {
        blocked += removeElements(SHORTS_BUTTON_SELECTORS);
      }

      if (settings.removeHomepageVideos && window.location.pathname === "/") {
        blocked += removeElements(HOMEPAGE_VIDEO_SELECTORS);
      }

      if (
        settings.removeWatchPageSuggestions &&
        window.location.pathname === "/watch"
      ) {
        blocked += removeElements(VIDEO_SUGGESTIONS_SELECTORS);
      }

      if (blocked > 0) {
        console.log(`ContentBlocker: Removed ${blocked} elements`);
      }
    }, 500);

    // Initial block
    blockContent();

    // Watch for DOM changes
    const observer = new MutationObserver(blockContent);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Listen for navigation
    const handleNavigation = () => {
      console.log("ContentBlocker: Page navigation detected");
      setTimeout(blockContent, 100);
    };

    window.addEventListener("yt-navigate-finish", handleNavigation);

    return () => {
      observer.disconnect();
      window.removeEventListener("yt-navigate-finish", handleNavigation);
    };
  }, [settings]);

  return null; // This is a non-visual component
}
