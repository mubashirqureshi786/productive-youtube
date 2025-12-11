/**
 * Settings Service
 * Handles Chrome storage for extension settings
 */

import type { Settings } from "../types";

const DEFAULT_SETTINGS: Settings = {
  removeShorts: true,
  removeShortsButton: true,
  removeHomepageVideos: true,
  removeWatchPageSuggestions: true,
  showTranscript: false,
};

/**
 * Load settings from Chrome storage
 */
export async function loadSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    const keys = Object.keys(DEFAULT_SETTINGS);
    chrome.storage.local.get(keys, (result) => {
      const settings = { ...DEFAULT_SETTINGS };
      keys.forEach((key) => {
        if (result[key] !== undefined) {
          settings[key as keyof Settings] = result[key];
        }
      });
      resolve(settings);
    });
  });
}

/**
 * Save settings to Chrome storage
 */
export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(settings, () => {
      resolve();
    });
  });
}

/**
 * Get a specific setting value
 */
export async function getSetting<K extends keyof Settings>(
  key: K
): Promise<Settings[K]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] ?? DEFAULT_SETTINGS[key]);
    });
  });
}

/**
 * Listen for settings changes
 */
export function onSettingsChange(
  callback: (changes: Partial<Settings>) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === "local") {
      const settingsChanges: Partial<Settings> = {};
      Object.keys(changes).forEach((key) => {
        if (key in DEFAULT_SETTINGS) {
          settingsChanges[key as keyof Settings] = changes[key].newValue;
        }
      });
      if (Object.keys(settingsChanges).length > 0) {
        callback(settingsChanges);
      }
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return cleanup function
  return () => chrome.storage.onChanged.removeListener(listener);
}
