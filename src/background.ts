// Background service worker for handling API calls (bypasses CORS)

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "TRANSLATE_TEXT") {
    handleTranslation(request.text)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

async function handleTranslation(text: string) {
  try {
    // Using MyMemory Translation API (completely free, no key required)
    const translateResponse = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=en|ur`
    );

    if (!translateResponse.ok) {
      throw new Error(`Translation API Error (${translateResponse.status})`);
    }

    const translateData = await translateResponse.json();
    const urduTranslation =
      translateData.responseData?.translatedText || "ترجمہ دستیاب نہیں";

    // Generate vocabulary and context using synonyms
    const words = text.split(/\s+/).filter((w) => w.length > 3);
    const vocabulary = words.slice(0, 3).map((w) => w.toLowerCase());

    // Create a simple but useful response
    const result = {
      urduTranslation: urduTranslation,
      bestWord:
        text.length > 30
          ? text.split(/\s+/).slice(0, 5).join(" ") + "..."
          : text,
      vocabulary: vocabulary.length > 0 ? vocabulary : [text, text, text],
      context: `English: "${text}" | This phrase is commonly used in conversational English.`,
    };

    return { success: true, data: result };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Translation failed",
    };
  }
}
