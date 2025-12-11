/**
 * Translation Service
 * Handles translation API calls via background script
 */

export interface TranslationResult {
  urduTranslation: string;
  bestWord: string;
  vocabulary: string[];
  context: string;
}

/**
 * Translate text using the background service worker
 */
export async function translateText(text: string): Promise<TranslationResult> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "TRANSLATE_TEXT", text },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || "Translation failed"));
        }
      }
    );
  });
}
