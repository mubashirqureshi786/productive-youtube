/**
 * YouTube DOM Selectors
 * Centralized selector constants for YouTube's DOM structure
 */

export const SHORTS_SELECTORS = [
  "ytd-reel-shelf-renderer",
  "ytd-rich-shelf-renderer[is-shorts]",
  '[aria-label*="Shorts"]',
  "ytd-shells-renderer",
  '#dismissible[class*="shorts"]',
] as const;

export const SHORTS_BUTTON_SELECTORS = [
  'ytd-guide-entry-renderer:has(a[href="/shorts"])',
  'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
  'ytd-guide-entry-renderer:has([title="Shorts"])',
  'ytd-mini-guide-entry-renderer:has([title="Shorts"])',
  'a[href="/shorts"]',
  'a[title="Shorts"]',
  '#guide-icon[href*="/shorts"]',
] as const;

export const VIDEO_SUGGESTIONS_SELECTORS = [
  "#secondary-inner ytd-compact-video-renderer",
  "#secondary-inner ytd-compact-playlist-renderer",
  "#secondary-inner ytd-reel-shelf-renderer",
  "ytd-watch-next-secondary-results-renderer",
  "#related ytd-video-renderer",
  "#related ytd-compact-video-renderer",
  "#related ytd-reel-shelf-renderer",
  ".ytd-watch-next-secondary-results-renderer #items ytd-video-renderer",
  ".ytd-watch-next-secondary-results-renderer #items ytd-compact-video-renderer",
  "ytd-continuation-item-renderer:has(#related)",
  '[data-session-link]:not([href*="/shorts/"]) > ytd-thumbnail',
  "ytd-item-section-renderer:has(ytd-compact-video-renderer)",
] as const;

// Target individual video cards on homepage, NOT containers
// These selectors target the actual video item elements that appear in the feed
export const HOMEPAGE_VIDEO_SELECTORS = [
  // Primary: Video items in the main homepage grid - MOST IMPORTANT
  "ytd-rich-item-renderer",

  // Video item inside rich grid
  "ytd-rich-grid-renderer ytd-rich-item-renderer",

  // Direct children of rich grid (alternative structure)
  "ytd-rich-grid-renderer > ytd-rich-item-renderer",

  // Individual video renderers (legacy/fallback)
  "ytd-grid-video-renderer",
  "ytd-video-renderer",

  // Fallback: row-based structure
  "ytd-rich-grid-row ytd-rich-item-renderer",
] as const;

export const VIDEO_END_SUGGESTIONS_SELECTORS = [
  ".ytp-suggestion-set",
  ".ytp-videowall-still",
  ".ytp-show-tiles",
  "div.ytp-pause-overlay",
  ".ytp-scroll-min",
  ".ytp-scroll-max",
] as const;
