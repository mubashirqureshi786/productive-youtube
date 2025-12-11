/**
 * Utility functions for the Productive YouTube extension
 */

/**
 * Detects if YouTube is in dark mode
 */
export function isYouTubeDarkMode(): boolean {
  const htmlElement = document.documentElement;
  
  // Check YouTube's dark mode attribute
  if (htmlElement.hasAttribute("dark")) return true;
  if (htmlElement.classList.contains("dark")) return true;

  // Check body background color
  const bodyBg = window.getComputedStyle(document.body).backgroundColor;
  if (
    bodyBg === "rgb(15, 15, 15)" ||
    bodyBg === "rgb(24, 24, 24)" ||
    bodyBg === "rgb(33, 33, 33)"
  ) {
    return true;
  }

  // Fallback to system preference
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/**
 * Format seconds to timestamp string (MM:SS or HH:MM:SS)
 */
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Decode HTML entities in text
 */
export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Clean transcript text from unwanted characters
 */
export function cleanTranscriptText(text: string): string {
  return text
    .replace(/\[Music\]/gi, "")
    .replace(/\[Applause\]/gi, "")
    .replace(/\[Laughter\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
