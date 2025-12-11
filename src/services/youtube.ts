/**
 * YouTube API Service
 * Handles video ID extraction and YouTube API calls
 */

/**
 * Extract video ID from current YouTube URL
 */
export function getVideoId(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
}

/**
 * Extract API key from YouTube page HTML
 */
export function extractApiKey(html: string): string | null {
  const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  return apiKeyMatch ? apiKeyMatch[1] : null;
}

/**
 * Extract transcript URL from player API response
 */
export function extractTranscriptUrl(playerApiResponse: any): string | null {
  try {
    const captions =
      playerApiResponse?.captions?.playerCaptionsTracklistRenderer
        ?.captionTracks;
    if (!captions || captions.length === 0) return null;

    // Prioritize English captions
    const englishCaption = captions.find(
      (track: any) =>
        track.languageCode === "en" ||
        track.languageCode?.startsWith("en-") ||
        track.name?.simpleText?.toLowerCase().includes("english")
    );

    return englishCaption?.baseUrl || captions[0]?.baseUrl || null;
  } catch (error) {
    console.error("Error extracting transcript URL:", error);
    return null;
  }
}

/**
 * Check if current page is a watch page
 */
export function isWatchPage(): boolean {
  return window.location.pathname === "/watch";
}

/**
 * Check if current page is the homepage
 */
export function isHomePage(): boolean {
  return (
    window.location.pathname === "/" || window.location.pathname === "/feed/you"
  );
}
