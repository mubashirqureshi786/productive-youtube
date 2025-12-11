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
    if (!settings) return;

    const blockContent = throttle(() => {
      if (settings.removeShorts) {
        removeElements(SHORTS_SELECTORS);
      }

      if (settings.removeShortsButton) {
        removeElements(SHORTS_BUTTON_SELECTORS);
      }

      if (settings.removeHomepageVideos && window.location.pathname === "/") {
        removeElements(HOMEPAGE_VIDEO_SELECTORS);
      }

      if (settings.removeWatchPageSuggestions && window.location.pathname === "/watch") {
        removeElements(VIDEO_SUGGESTIONS_SELECTORS);
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
