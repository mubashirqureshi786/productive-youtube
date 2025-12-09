// console.log("Productive YouTube: Content script loaded");

// Type definitions
interface VideoInfo {
  title: string;
  channel: string;
}

interface Settings {
  // Algorithm Blockers
  removeShorts: boolean;
  removeShortsButton: boolean;
  removeHomepageVideos: boolean;
  removeWatchPageSuggestions: boolean;
  showTranscript: boolean;
}

// Multiple selectors to handle YouTube's changing DOM structure
const SHORTS_SELECTORS: string[] = [
  "ytd-reel-shelf-renderer",
  "ytd-rich-shelf-renderer[is-shorts]",
  '[aria-label*="Shorts"]',
  "ytd-shells-renderer",
  '#dismissible[class*="shorts"]',
];

// Shorts button in sidebar - more comprehensive selectors
const SHORTS_BUTTON_SELECTORS: string[] = [
  'ytd-guide-entry-renderer:has(a[href="/shorts"])',
  'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
  'ytd-guide-entry-renderer:has([title="Shorts"])',
  'ytd-mini-guide-entry-renderer:has([title="Shorts"])',
  'a[href="/shorts"]',
  'a[title="Shorts"]',
  '#guide-icon[href*="/shorts"]',
];

// Selectors for video suggestions in the right sidebar when watching a video
const VIDEO_SUGGESTIONS_SELECTORS: string[] = [
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
];

// Selectors for suggested videos on the homepage
const HOMEPAGE_VIDEO_SELECTORS: string[] = [
  "ytd-rich-item-renderer",
  "ytd-rich-grid-row",
  "ytd-rich-grid-renderer",
  "ytd-two-column-browse-results-renderer #primary #contents",
  'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
  'ytd-browse[page-subtype="home"] ytd-rich-item-renderer',
  'ytd-browse[page-subtype="home"] ytd-rich-grid-row',
  "ytd-grid-video-renderer",
  "ytd-video-renderer",
  "ytd-item-section-renderer",
];

// Video suggestions that appear after video ends (the large grid overlay)
const VIDEO_END_SUGGESTIONS_SELECTORS: string[] = [
  ".ytp-suggestion-set",
  ".ytp-videowall-still",
  ".ytp-show-tiles",
  "div.ytp-pause-overlay",
  ".ytp-scroll-min",
  ".ytp-scroll-max",
];

// Default settings
let settings: Settings = {
  removeShorts: true,
  removeShortsButton: true,
  removeHomepageVideos: true,
  removeWatchPageSuggestions: true,
  showTranscript: false,
};

// Load settings from storage
function loadSettings(callback?: () => void): void {
  const keys = Object.keys(settings);
  chrome.storage.local.get(keys, function (result) {
    // Load all settings with defaults
    keys.forEach((key) => {
      if (result[key] !== undefined) {
        settings[key as keyof Settings] = result[key];
      }
    });
    // console.log("Productive YouTube: Settings loaded", settings);

    if (callback) callback();
  });
}

// Helper function to extract titles and channels from individual videos within a shelf
function extractTitlesAndChannelsFromShelf(shelf: Element): VideoInfo[] {
  const videos: VideoInfo[] = [];
  const processedVideos = new Set<string>(); // Prevent duplicates

  // Multiple selectors to find individual video containers within the shelf
  const videoContainerSelectors: string[] = [
    "ytd-reel-item-renderer",
    "ytd-rich-item-renderer",
    "ytd-video-renderer",
    "ytd-compact-video-renderer",
    "ytm-shorts-lockup-view-model-v2", // New 2024 structure
    "ytm-shorts-lockup-view-model", // New 2024 structure
    ".shortsLockupViewModelHost", // New 2024 structure
    '[class*="reel-item"]',
    '[class*="rich-item"]',
    '[class*="shortsLockup"]', // New 2024 structure
  ];

  // Title selectors in order of preference
  const titleSelectors: string[] = [
    "#video-title",
    "#title yt-formatted-string",
    "h3 a span[title]",
    'yt-formatted-string[slot="title"]',
    "#video-title-link",
    "a[title]",
    "h3 span[title]",
    '[id="video-title"]',
    ".ytd-rich-grid-media h3",
    ".reel-item-title",
    "[aria-label]",
  ];

  // Channel selectors in order of preference - prioritize specific channel indicators
  const channelSelectors: string[] = [
    // Highest priority - channel link selectors (most reliable)
    'a[href*="/@"]:not([href*="/shorts/"]):not([href*="/watch"])', // @channel handles
    'a[href*="/channel/"]:not([href*="/shorts/"]):not([href*="/watch"])', // Traditional URLs
    'a[href*="/c/"]:not([href*="/shorts/"]):not([href*="/watch"])', // Custom URLs

    // 2024 YouTube Shorts metadata selectors (based on HTML structure patterns)
    '.shortsLockupViewModelHostMetadataRoundedContainerContent a:not([title]):not([href*="/shorts/"])',
    '.shortsLockupViewModelHostMetadata a:not([title]):not([href*="/shorts/"])',

    // Traditional YouTube Shorts/Rich Item selectors
    ".ytd-rich-grid-media .details.ytd-rich-grid-media #text a",
    ".ytd-rich-grid-media .meta.ytd-rich-grid-media #text a",
    "#meta-contents #channel-name a", // Standard video page selector
    ".ytd-rich-grid-media #byline a",
    ".ytd-video-meta-block #text a",
    "ytd-channel-name #container #text-container #text a",

    // Known channel name containers
    ".ytd-channel-name a",
    "#channel-name a",
    "ytd-channel-name a",
    "ytd-channel-name yt-formatted-string",
    ".metadata-line a",
    ".byline a",
    "#byline a",
    '[aria-label*="by"] a',
    '[aria-label*="by "]',

    // Lower priority - 2024 YouTube Shorts structure (may contain titles)
    ".shortsLockupViewModelHostMetadataRoundedContainerContent span:not([title])",
    ".shortsLockupViewModelHostMetadata span:not([title])",
    '.shortsLockupViewModelHostMetadataRoundedContainerContent [role="text"]:not([title])',
    '.shortsLockupViewModelHostMetadata [role="text"]:not([title])',
    '.shortsLockupViewModelHost [aria-label]:not([aria-label*="views"]):not([aria-label*="ago"]):not([title])',
  ];

  // First try to find video containers
  videoContainerSelectors.forEach((containerSelector) => {
    const videoContainers = shelf.querySelectorAll(containerSelector);

    videoContainers.forEach((container) => {
      let title = "";
      let channel = "";

      // Extract title
      for (const titleSelector of titleSelectors) {
        const titleElement = container.querySelector(
          titleSelector
        ) as HTMLElement;
        if (titleElement) {
          // Extract title from different attribute types
          if (titleElement.hasAttribute("title")) {
            title = titleElement.getAttribute("title") || "";
          } else if (titleElement.textContent) {
            title = titleElement.textContent.trim();
          } else if (titleElement.innerText) {
            title = titleElement.innerText.trim();
          }

          if (title && title.length > 0 && title !== "Shorts") {
            // Check if channel is embedded in title (e.g., "Title by: @channel")
            const byMatch = title.match(/\s+by:\s*(@?\w+)/i);
            if (byMatch) {
              const embeddedChannel = byMatch[1];
              // Clean the title by removing the "by: @channel" part
              title = title.replace(/\s+by:\s*@?\w+/i, "").trim();
              // Set the channel if we haven't found one yet
              if (!channel) {
                channel = embeddedChannel.startsWith("@")
                  ? embeddedChannel
                  : "@" + embeddedChannel;
                // console.log(`Found channel "${channel}" embedded in title`);
              }
            }
            break; // Found title, stop looking
          }
        }
      }

      // Extract channel
      for (const channelSelector of channelSelectors) {
        const channelElement = container.querySelector(
          channelSelector
        ) as HTMLElement & HTMLAnchorElement;
        if (channelElement) {
          // Try different text extraction methods
          let candidateChannel = "";

          // Try title attribute first (often has clean channel name)
          if (channelElement.title) {
            candidateChannel = channelElement.title.trim();
          }
          // Then try text content
          else if (channelElement.textContent) {
            candidateChannel = channelElement.textContent.trim();
          } else if (channelElement.innerText) {
            candidateChannel = channelElement.innerText.trim();
          }

          // Clean up the channel name (remove "by " prefix, etc.)
          candidateChannel = candidateChannel.replace(/^by\s+/i, "").trim();

          // If still no channel, try to extract from href attribute
          if (!candidateChannel && channelElement.href) {
            const href = channelElement.href;
            if (href.includes("/@")) {
              candidateChannel = href.split("/@")[1].split("/")[0];
              candidateChannel = "@" + candidateChannel;
            } else if (href.includes("/channel/")) {
              // Don't use channel ID as it's not user-friendly
              candidateChannel = "";
            } else if (href.includes("/c/")) {
              candidateChannel = href.split("/c/")[1].split("/")[0];
            }
          }

          // Validate channel name - exclude anything that looks like a title or video metadata
          if (
            candidateChannel &&
            candidateChannel.length > 0 &&
            candidateChannel.length < 100 && // Reasonable length limit
            candidateChannel !== title &&
            !candidateChannel.includes(title) && // Don't accept text that contains the full title
            !candidateChannel.includes("http") &&
            !candidateChannel.includes("Subscribe") &&
            !candidateChannel.includes("views") &&
            !candidateChannel.includes("ago") &&
            !candidateChannel.includes("#") && // Exclude hashtags which are usually in titles
            !candidateChannel.includes("🤯") && // Exclude emojis which are usually in titles
            !candidateChannel.includes("🧊") &&
            !candidateChannel.includes("🤣") &&
            !candidateChannel.includes("😲") &&
            !candidateChannel.toLowerCase().includes("short") &&
            !candidateChannel.toLowerCase().includes("nerf") &&
            !candidateChannel.toLowerCase().includes("economy") &&
            !candidateChannel.toLowerCase().includes("truth") &&
            !candidateChannel.toLowerCase().includes("military") &&
            !candidateChannel.toLowerCase().includes("integrity") &&
            candidateChannel !== "Shorts"
          ) {
            channel = candidateChannel;
            // console.log(
            //   `Found channel "${channel}" using selector "${channelSelector}"`
            // );
            break; // Found valid channel, stop looking
          }
        }
      }

      // Debug: If no channel found, log container structure and search for any text elements
      if (!channel && title) {
        // console.log(
        //   `No channel found for "${title}". Container HTML:`,
        //   container.innerHTML.substring(0, 300) + "..."
        // );

        // Try to find any elements that might contain channel info
        const allTextElements = container.querySelectorAll("*");
        const foundTexts: string[] = [];
        allTextElements.forEach((el) => {
          if (
            el.textContent &&
            el.textContent.trim() &&
            el.textContent.trim() !== title &&
            el.textContent.trim().length < 100 &&
            el.textContent.trim().length > 2 &&
            !el.textContent.includes("http") &&
            !el.textContent.includes("ago") &&
            !el.textContent.includes("views")
          ) {
            foundTexts.push(
              `"${el.textContent.trim()}" (${el.tagName.toLowerCase()}.${
                el.className
              })`
            );
          }
        });
        if (foundTexts.length > 0) {
          console.log(`Potential channel candidates:`, foundTexts.slice(0, 5)); // Show first 5
        }
      }

      // If we found both title and channel, add to results
      if (title && channel) {
        const videoKey = `${title}-${channel}`;
        if (!processedVideos.has(videoKey)) {
          processedVideos.add(videoKey);
          videos.push({ title, channel });
        }
      } else if (title) {
        // Add with unknown channel if we at least have title
        const videoKey = `${title}-unknown`;
        if (!processedVideos.has(videoKey)) {
          processedVideos.add(videoKey);
          videos.push({ title, channel: "Unknown Channel" });
        }
      }
    });
  });

  return videos;
}

// Function to find and remove the Shorts section
function removeShorts(): void {
  // Check if feature is enabled
  if (!settings.removeShorts) {
    // If disabled, restore previously hidden elements
    restoreShorts();
    return;
  }

  let removedCount = 0;

  SHORTS_SELECTORS.forEach((selector) => {
    const shortsShelves = document.querySelectorAll(selector);
    shortsShelves.forEach((shelf) => {
      const shelfElement = shelf as HTMLElement;
      if (shelfElement && !shelfElement.dataset.shortsRemoved) {
        // Extract titles and channels before removing/hiding the shelf
        const videos = extractTitlesAndChannelsFromShelf(shelfElement);

        // Log the videos found
        if (videos.length > 0) {
          console.log(
            `YouTube Shorts Remover: Found ${videos.length} Shorts videos in shelf:`
          );
          videos.forEach((video, index) => {
            console.log(`  ${index + 1}. "${video.title}" - ${video.channel}`);
          });
        } else {
          console.log("YouTube Shorts Remover: No videos found in this shelf");
          // Debug: log the shelf structure
          console.log(
            "Shelf HTML structure:",
            shelfElement.innerHTML.substring(0, 500) + "..."
          );
        }

        shelfElement.dataset.shortsRemoved = "true";
        shelfElement.style.display = "none";
        removedCount++;
        console.log(
          `YouTube Shorts Remover: Hidden element with selector: ${selector}`
        );
      }
    });
  });

  if (removedCount > 0) {
    console.log(
      `YouTube Shorts Remover: Hidden ${removedCount} Shorts shelf(s)`
    );
  }
}

// Function to restore Shorts when feature is disabled
function restoreShorts(): void {
  let restoredCount = 0;
  SHORTS_SELECTORS.forEach((selector) => {
    const shortsShelves = document.querySelectorAll(selector);
    shortsShelves.forEach((shelf) => {
      const shelfElement = shelf as HTMLElement;
      if (shelfElement && shelfElement.dataset.shortsRemoved) {
        shelfElement.style.display = "";
        delete shelfElement.dataset.shortsRemoved;
        restoredCount++;
      }
    });
  });
  if (restoredCount > 0) {
    console.log(
      `Productive YouTube: Restored ${restoredCount} Shorts shelf(s)`
    );
  }
}

// Generic restore function
function restoreElements(
  selectors: string[],
  dataAttribute: string,
  logName: string
): void {
  let restoredCount = 0;
  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      if (htmlElement && htmlElement.dataset[dataAttribute]) {
        htmlElement.style.display = "";
        delete htmlElement.dataset[dataAttribute];
        restoredCount++;
      }
    });
  });
  if (restoredCount > 0) {
    console.log(`Productive YouTube: Restored ${restoredCount} ${logName}`);
  }
}

// Function to remove all suggested videos from the homepage
function removeHomepageVideos(): void {
  // Check if feature is enabled
  if (!settings.removeHomepageVideos) {
    restoreElements(
      HOMEPAGE_VIDEO_SELECTORS,
      "homepageVideosRemoved",
      "homepage videos"
    );
    return;
  }

  let removedCount = 0;

  HOMEPAGE_VIDEO_SELECTORS.forEach((selector) => {
    const videoElements = document.querySelectorAll(selector);
    videoElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      if (htmlElement && !htmlElement.dataset.homepageVideosRemoved) {
        // Skip elements that might be part of the header or navigation
        const role = htmlElement.getAttribute("role");
        const ariaLabel = htmlElement.getAttribute("aria-label");

        // Don't hide navigation or header elements
        if (
          role === "navigation" ||
          role === "banner" ||
          (ariaLabel &&
            (ariaLabel.includes("header") || ariaLabel.includes("navigation")))
        ) {
          return;
        }

        htmlElement.dataset.homepageVideosRemoved = "true";
        htmlElement.style.display = "none";
        removedCount++;
        console.log(
          `Homepage Videos Remover: Hidden element with selector: ${selector}`
        );
      }
    });
  });

  if (removedCount > 0) {
    console.log(
      `Homepage Videos Remover: Hidden ${removedCount} homepage video elements`
    );
  }
}

// Throttled function to avoid excessive calls
let timeoutId: number;
function throttledRemoveShorts(): void {
  clearTimeout(timeoutId);
  timeoutId = window.setTimeout(removeShorts, 100);
}

// Throttled function to remove homepage videos
let homepageTimeoutId: number;
function throttledRemoveHomepageVideos(): void {
  clearTimeout(homepageTimeoutId);
  homepageTimeoutId = window.setTimeout(removeHomepageVideos, 100);
}

// Function to remove video suggestions in the right sidebar (excluding playlist content)
function removeVideoSuggestions(): void {
  if (!settings.removeWatchPageSuggestions) {
    restoreElements(
      VIDEO_SUGGESTIONS_SELECTORS,
      "suggestionsRemoved",
      "video suggestions"
    );
    return;
  }

  let removedCount = 0;

  VIDEO_SUGGESTIONS_SELECTORS.forEach((selector) => {
    try {
      const suggestionElements = document.querySelectorAll(selector);
      suggestionElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        // Check if this element is part of a playlist
        const isPlaylistItem =
          htmlElement.closest("#items.ytd-playlist-panel-renderer") ||
          htmlElement.closest("ytd-playlist-panel-video-renderer") ||
          htmlElement.closest("ytd-playlist-panel-renderer") ||
          (htmlElement.id && htmlElement.id.includes("playlist"));

        if (
          !isPlaylistItem &&
          htmlElement &&
          !htmlElement.dataset.suggestionsRemoved
        ) {
          htmlElement.dataset.suggestionsRemoved = "true";
          htmlElement.style.display = "none";
          removedCount++;
          console.log(
            `Video Suggestions Remover: Hidden element with selector: ${selector}`
          );
        } else if (isPlaylistItem) {
          console.log(`Video Suggestions Remover: Skipped playlist item`);
        } else if (htmlElement && htmlElement.dataset.suggestionsRemoved) {
          // Element already processed, skip
        }
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.log(
        `Video Suggestions Remover: Error with selector ${selector}:`,
        errorMessage
      );
    }
  });

  if (removedCount > 0) {
    console.log(
      `Video Suggestions Remover: Hidden ${removedCount} video suggestion elements`
    );
  }
}

// Throttled function for removing video suggestions to avoid excessive calls
let suggestionTimeoutId: number;
function throttledRemoveVideoSuggestions(): void {
  clearTimeout(suggestionTimeoutId);
  suggestionTimeoutId = window.setTimeout(removeVideoSuggestions, 100);
}

// Function to remove Shorts button from sidebar
function removeShortsButton(): void {
  if (!settings.removeShortsButton) {
    // Restore by checking all possible containers
    let restoredCount = 0;
    const allContainers = document.querySelectorAll(
      "ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer"
    );
    allContainers.forEach((container) => {
      const htmlElement = container as HTMLElement;
      if (htmlElement && htmlElement.dataset.shortsButtonRemoved) {
        htmlElement.style.display = "";
        delete htmlElement.dataset.shortsButtonRemoved;
        restoredCount++;
      }
    });
    if (restoredCount > 0) {
      console.log(
        `Productive YouTube: Restored ${restoredCount} Shorts button(s)`
      );
    }
    return;
  }

  let removedCount = 0; // Method 1: Find by direct container selectors
  const containerSelectors = [
    'ytd-guide-entry-renderer:has(a[href="/shorts"])',
    'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
    'ytd-guide-entry-renderer:has([title="Shorts"])',
    'ytd-mini-guide-entry-renderer:has([title="Shorts"])',
  ];

  containerSelectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (htmlElement && !htmlElement.dataset.shortsButtonRemoved) {
          htmlElement.dataset.shortsButtonRemoved = "true";
          htmlElement.style.display = "none";
          removedCount++;
          console.log("Productive YouTube: Hidden Shorts button container");
        }
      });
    } catch (e) {
      // :has() might not be supported in some browsers, continue
    }
  });

  // Method 2: Find links and hide parent containers
  const linkSelectors = ['a[href="/shorts"]', 'a[title="Shorts"]'];
  linkSelectors.forEach((selector) => {
    const links = document.querySelectorAll(selector);
    links.forEach((link) => {
      const parent = link.closest(
        "ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer"
      ) as HTMLElement;
      if (parent && !parent.dataset.shortsButtonRemoved) {
        parent.dataset.shortsButtonRemoved = "true";
        parent.style.display = "none";
        removedCount++;
        console.log("Productive YouTube: Hidden Shorts button via parent");
      }
    });
  });

  if (removedCount > 0) {
    console.log(`Productive YouTube: Hidden ${removedCount} Shorts button(s)`);
  }
}

// Throttled functions for all new features
let shortsButtonTimeoutId: number;
function throttledRemoveShortsButton(): void {
  clearTimeout(shortsButtonTimeoutId);
  shortsButtonTimeoutId = window.setTimeout(removeShortsButton, 100);
}

function getVideoId() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const v = urlParams.get("v");
    if (v) return v;

    // Try global player response (works on many YouTube pages)
    // @ts-ignore
    const yipr = (window as any).ytInitialPlayerResponse;
    if (yipr && yipr.videoDetails && yipr.videoDetails.videoId) {
      return yipr.videoDetails.videoId;
    }

    // Try canonical link or meta tags
    const canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (canonical && canonical.href) {
      const m = canonical.href.match(/[?&]v=([^&]+)/);
      if (m && m[1]) return m[1];
      // fallback: sometimes canonical contains full watch path
      const p = canonical.href.match(/watch\/([a-zA-Z0-9_-]+)/);
      if (p && p[1]) return p[1];
    }

    // Fallback: try to parse from the URL directly
    const fromHref =
      window.location.href.match(/[?&]v=([a-zA-Z0-9_-]+)/) ||
      window.location.href.match(/watch\/([a-zA-Z0-9_-]+)/);
    if (fromHref && fromHref[1]) return fromHref[1];
  } catch (e) {
    console.warn("getVideoId: error while extracting video id", e);
  }

  return null;
}

async function fetchVideoPage(videoId: string) {
  console.log(`Fetching video page for video ID: ${videoId}`);
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
  return response.text();
}

function extractApiKey(html: string) {
  const match = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  if (match && match[1]) {
    console.log("Productive YouTube: API key extracted successfully");
    return match[1];
  }
  console.warn(
    "Productive YouTube: Could not extract API key from video page HTML"
  );
  return null;
}

async function fetchPlayerApi(videoId: string, apiKey: string) {
  console.log("Productive YouTube: Fetching player API response...");
  const response = await fetch(
    `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00",
          },
        },
        videoId: videoId,
      }),
    }
  );
  if (!response.ok) {
    console.error(
      "Productive YouTube: Player API HTTP error:",
      response.status
    );
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log(
    "Productive YouTube: Player API response received, has captions:",
    !!data?.captions
  );
  return data;
}

function extractTranscriptUrl(playerApiResponse: any) {
  console.log("Productive YouTube: Extracting transcript URL...");
  const captionTracks =
    playerApiResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!captionTracks || captionTracks.length === 0) {
    console.warn(
      "Productive YouTube: No caption tracks found in player response"
    );
    return null;
  }

  console.log(
    `Productive YouTube: Found ${captionTracks.length} caption track(s)`
  );

  // Log all available languages for debugging
  captionTracks.forEach((track: any, index: number) => {
    console.log(
      `Track ${index + 1}: ${track.languageCode || "unknown"} - ${
        track.name?.simpleText || "unknown name"
      }`
    );
  });

  // Priority 1: Try to find English caption track (en, en-US, en-GB, etc.)
  let transcriptTrack = captionTracks.find(
    (track: any) =>
      track.baseUrl &&
      track.languageCode &&
      track.languageCode.toLowerCase().startsWith("en")
  );

  // Priority 2: If no English track, try to find auto-generated English
  if (!transcriptTrack) {
    transcriptTrack = captionTracks.find(
      (track: any) =>
        track.baseUrl &&
        track.name?.simpleText &&
        (track.name.simpleText.toLowerCase().includes("english") ||
          track.name.simpleText.toLowerCase().includes("auto-generated"))
    );
  }

  // Priority 3: If still no English track, use any available track with baseUrl
  if (!transcriptTrack) {
    transcriptTrack = captionTracks.find((track: any) => track.baseUrl);
  }

  // Priority 4: Last resort - use first track
  if (!transcriptTrack && captionTracks.length > 0) {
    transcriptTrack = captionTracks[0];
  }

  if (!transcriptTrack || !transcriptTrack.baseUrl) {
    console.warn(
      "Productive YouTube: Could not find caption track with baseUrl"
    );
    return null;
  }

  console.log(
    "Productive YouTube: Selected caption track:",
    transcriptTrack.languageCode || "unknown language",
    "-",
    transcriptTrack.name?.simpleText || "no name"
  );
  return transcriptTrack.baseUrl;
}

async function fetchTranscriptXml(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    if (!text) {
      throw new Error("Empty transcript response");
    }
    return text;
  } catch (error) {
    console.error("Productive YouTube: Error fetching transcript XML:", error);
    throw error;
  }
}

function parseTranscript(xml: string) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    // Check for XML parsing errors
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      console.error("Productive YouTube: XML parsing error");
      return [];
    }

    const textNodes = xmlDoc.getElementsByTagName("text");
    if (textNodes.length === 0) {
      console.warn("Productive YouTube: No text nodes found in transcript XML");
      return [];
    }

    const transcript = [];
    for (let i = 0; i < textNodes.length; i++) {
      const text = textNodes[i].textContent || "";
      const start = parseFloat(textNodes[i].getAttribute("start") || "0");
      if (text.trim()) {
        // Only add non-empty text
        transcript.push({ text, start });
      }
    }
    return transcript;
  } catch (error) {
    console.error("Productive YouTube: Error parsing transcript:", error);
    return [];
  }
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
}

// Helper function to clean transcript text
function cleanTranscriptText(text: string): string {
  // Remove [Music], [Applause], and similar tags
  text = text.replace(/\[music\]/gi, "");
  text = text.replace(/\[applause\]/gi, "");
  text = text.replace(/\[laughter\]/gi, "");
  text = text.replace(/\[.*?\]/g, ""); // Remove any other bracketed content

  // Remove >> symbols (speaker indicators)
  text = text.replace(/>>+/g, "");

  // Remove multiple spaces
  text = text.replace(/\s+/g, " ");

  // Remove leading/trailing spaces
  text = text.trim();

  return text;
}

function displayTranscript(transcript: { text: string; start: number }[]) {
  console.log(
    "Productive YouTube: displayTranscript function called with",
    transcript.length,
    "entries"
  );

  // Try to find the secondary container
  let secondary = document.querySelector("#secondary");

  if (!secondary) {
    console.log(
      "Productive YouTube: #secondary not found, trying alternatives..."
    );
    secondary = document.querySelector(
      "ytd-watch-next-secondary-results-renderer"
    );
  }
  if (!secondary) {
    console.log(
      "Productive YouTube: ytd-watch-next-secondary-results-renderer not found, trying #secondary-inner..."
    );
    secondary = document.querySelector("#secondary-inner");
  }
  if (!secondary) {
    console.log(
      "Productive YouTube: #secondary-inner not found, trying #related..."
    );
    secondary = document.querySelector("#related");
  }
  if (!secondary) {
    console.log(
      "Productive YouTube: No sidebar found, creating fixed position container..."
    );
    // Create a fixed position wrapper
    const fixedWrapper = document.createElement("div");
    fixedWrapper.id = "transcript-fixed-wrapper";
    fixedWrapper.style.cssText = `
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      width: 400px !important;
      max-height: calc(100vh - 100px) !important;
      overflow-y: auto !important;
      z-index: 9999 !important;
    `;
    document.body.appendChild(fixedWrapper);
    secondary = fixedWrapper;
    console.log("Productive YouTube: Created fixed position wrapper");
  }

  if (!secondary) {
    console.error(
      "Productive YouTube: Could not find any suitable container for transcript - giving up"
    );
    return;
  }

  console.log(
    "Productive YouTube: Using container:",
    secondary.tagName || secondary.id || "unknown"
  );

  // Group transcript entries into 25-second chunks with individual lines
  const CHUNK_SIZE = 25; // seconds
  const chunkedTranscript: {
    start: number;
    lines: { text: string; start: number; duration: number }[];
  }[] = [];
  let currentChunk: {
    start: number;
    lines: { text: string; start: number; duration: number }[];
  } | null = null;

  transcript.forEach((line, index) => {
    // Decode HTML entities and clean the text
    let decodedText = decodeHtmlEntities(line.text);
    decodedText = cleanTranscriptText(decodedText);

    // Skip if text is empty after cleaning
    if (!decodedText) return;

    const chunkStart = Math.floor(line.start / CHUNK_SIZE) * CHUNK_SIZE; // Round down to nearest chunk

    // Calculate duration for this line
    const nextStart =
      index < transcript.length - 1
        ? transcript[index + 1].start
        : line.start + 2;
    const lineDuration = nextStart - line.start;

    const lineData = {
      text: decodedText,
      start: line.start,
      duration: lineDuration,
    };

    if (!currentChunk || currentChunk.start !== chunkStart) {
      // Start a new chunk
      if (currentChunk) {
        chunkedTranscript.push(currentChunk);
      }
      currentChunk = {
        start: chunkStart,
        lines: [lineData],
      };
    } else {
      // Add to current chunk
      currentChunk.lines.push(lineData);
    }
  });

  // Don't forget the last chunk
  if (currentChunk) {
    chunkedTranscript.push(currentChunk);
  }

  let container = document.getElementById("transcript-container");
  if (container) {
    console.log("Productive YouTube: Reusing existing transcript container");
    container.innerHTML = "";
  } else {
    console.log("Productive YouTube: Creating new transcript container");
    container = document.createElement("div");
    container.id = "transcript-container";
    container.className = "transcript-container";
    // Add inline styles with !important flags to ensure visibility
    container.style.cssText = `
      background: rgba(255, 255, 255, 0.85) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border: 1px solid rgba(229, 231, 235, 0.5) !important;
      border-radius: 0.5rem !important;
      margin-bottom: 1rem !important;
      margin-top: 1rem !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      width: 100% !important;
      max-width: 400px !important;
      z-index: 1000 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    `;
    secondary.prepend(container);
    console.log(
      "Productive YouTube: Transcript container created and inserted into DOM"
    );
  }

  const header = document.createElement("div");
  header.className = "transcript-header";
  // Add inline styles for header
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid rgba(229, 231, 235, 0.5);
    cursor: pointer;
    background-color: rgba(249, 250, 251, 0.5);
  `;
  container.appendChild(header);

  const title = document.createElement("div");
  title.className = "transcript-title";
  title.textContent = "Video Transcript";
  // Add inline styles for title
  title.style.cssText = `
    font-size: 2rem;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `;
  header.appendChild(title);

  // Add expand/collapse indicator
  const arrowSpan = document.createElement("span");
  arrowSpan.className = "transcript-arrow";
  arrowSpan.style.cssText = `
    margin-left: 0.5rem;
    color: #9ca3af;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `;
  arrowSpan.textContent = "▲";
  title.appendChild(arrowSpan);

  const copyButton = document.createElement("button");
  copyButton.className = "transcript-copy-button";
  copyButton.textContent = "Copy Text";
  // Add inline styles for copy button
  copyButton.style.cssText = `
    background-color:#2986cc;
    color: #eef3fa;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 2rem;
    font-weight: 500;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `;
  copyButton.onmouseover = () => {
    copyButton.style.backgroundColor = "#008df7";
  };
  copyButton.onmouseout = () => {
    copyButton.style.backgroundColor = "#2986cc";
  };
  copyButton.onclick = (e) => {
    e.stopPropagation(); // Prevent header click event from triggering
    const transcriptText = chunkedTranscript
      .flatMap((chunk) => chunk.lines)
      .map((line) => `[${formatTimestamp(line.start)}] ${line.text}`)
      .join(" \n\n");
    navigator.clipboard.writeText(transcriptText);
    copyButton.textContent = "Copied!";
    setTimeout(() => {
      copyButton.textContent = "Copy Text";
    }, 2000);
  };
  header.appendChild(copyButton);

  // Create sync button
  const syncButton = document.createElement("button");
  syncButton.className = "transcript-sync-button";
  syncButton.textContent = "⟳ Sync";
  syncButton.title = "Scroll to current timestamp";
  // Add inline styles for sync button
  syncButton.style.cssText = `
    background-color: #10b981;
    color: #ffffff;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 2rem;
    font-weight: 500;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
    margin-left: 0.5rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `;
  syncButton.onmouseover = () => {
    syncButton.style.backgroundColor = "#059669";
  };
  syncButton.onmouseout = () => {
    syncButton.style.backgroundColor = "#10b981";
  };
  header.appendChild(syncButton);

  const content = document.createElement("div");
  content.className = "transcript-content";
  // Check if watch page suggestions are removed to extend height
  const isFullHeight = settings.removeWatchPageSuggestions;
  const maxHeight = isFullHeight ? "calc(100vh - 180px)" : "24rem";

  // Add inline styles for content
  content.style.cssText = `
    max-height: ${maxHeight};
    overflow-y: auto;
    padding: 1rem;
    background-color: transparent;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `;
  container.appendChild(content);

  // Add sync button click handler
  syncButton.onclick = (e) => {
    e.stopPropagation(); // Prevent header click event from triggering
    const video = document.querySelector("video");
    if (video) {
      const currentTime = video.currentTime;
      const activeLine = content.querySelector(
        ".transcript-line.active"
      ) as HTMLElement;
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // If no active line, find the closest one
        const lines = content.querySelectorAll(".transcript-line");
        let closestLine: HTMLElement | null = null;
        let minDiff = Infinity;

        lines.forEach((line) => {
          const lineEl = line as HTMLElement;
          const start = parseFloat(lineEl.dataset.start || "0");
          const diff = Math.abs(currentTime - start);
          if (diff < minDiff) {
            minDiff = diff;
            closestLine = lineEl;
          }
        });

        if (closestLine) {
          closestLine.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  header.onclick = () => {
    content.style.display = content.style.display === "none" ? "block" : "none";
    const arrow = header.querySelector(".transcript-arrow");
    if (arrow) {
      arrow.textContent = content.style.display === "none" ? "▼" : "▲";
    }
  };

  chunkedTranscript.forEach((chunk) => {
    // Create chunk header with 25s timestamp
    const chunkHeader = document.createElement("div");
    chunkHeader.className = "transcript-chunk-header";
    chunkHeader.style.cssText = `
      color: #2563eb;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      margin-bottom: 0.5rem;
      margin-top: 1rem;
      padding: 0.25rem 0.5rem;
      background-color: rgba(37, 99, 235, 0.1);
      border-radius: 0.25rem;
      display: inline-block;
    `;
    chunkHeader.textContent = formatTimestamp(chunk.start);
    chunkHeader.onclick = () => {
      const video = document.querySelector("video");
      if (video) {
        video.currentTime = chunk.start;
      }
    };
    content.appendChild(chunkHeader);

    // Render each line within the chunk
    chunk.lines.forEach((lineData) => {
      const lineEl = document.createElement("div");
      lineEl.className = "transcript-line";
      lineEl.dataset.start = lineData.start.toString();
      lineEl.dataset.duration = lineData.duration.toString();
      // Add inline styles for transcript line
      lineEl.style.cssText = `
        margin-bottom: 0.5rem;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        transition: all 0.3s ease;
      `;

      lineEl.onmouseover = function () {
        // Check if dark mode is active
        const isDarkMode =
          document.documentElement.classList.contains("dark") ||
          document.querySelector("html")?.getAttribute("dark") !== null ||
          document.body.style.backgroundColor === "rgb(19, 19, 19)" ||
          document.body.style.backgroundColor === "#131313";

        if (!lineEl.classList.contains("active")) {
          lineEl.style.backgroundColor = isDarkMode
            ? "rgba(55, 65, 81, 0.5)"
            : "rgba(243, 244, 246, 0.8)";
        }
      };
      lineEl.onmouseout = function () {
        if (!lineEl.classList.contains("active")) {
          lineEl.style.backgroundColor = "transparent";
        }
      };

      const textEl = document.createElement("span");
      textEl.className = "transcript-text";
      textEl.textContent = lineData.text;
      textEl.style.cssText = `
        color: #1f2937;
        font-size: 1.1rem;
        line-height: 1.6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        transition: color 0.3s ease;
        cursor: pointer;
      `;
      textEl.onclick = () => {
        const video = document.querySelector("video");
        if (video) {
          video.currentTime = lineData.start;
        }
      };

      lineEl.appendChild(textEl);
      content.appendChild(lineEl);
    });
  });

  // Add dark mode support
  const applyDarkModeStyles = (isDarkMode: boolean) => {
    if (isDarkMode) {
      // Dark mode styles
      container.style.cssText = `
        background: rgba(31, 41, 55, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(55, 65, 81, 0.5);
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      `;
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid rgba(55, 65, 81, 0.5);
        cursor: pointer;
        background-color: rgba(17, 24, 39, 0.5);
      `;
      title.style.cssText = `
        font-size: 2rem;
        font-weight: 600;
        color: #f9fafb;
        display: flex;
        align-items: center;
      `;
      arrowSpan.style.cssText = `
        margin-left: 0.5rem;
        color: #9ca3af;
      `;
      copyButton.style.cssText = `
        background-color: #4a5f7d;
        color: #ffffff;
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 2rem;
        font-weight: 500;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
      `;
      copyButton.onmouseover = () => {
        copyButton.style.backgroundColor = "#13334c";
      };
      copyButton.onmouseout = () => {
        copyButton.style.backgroundColor = "#4a5f7d";
      };
      content.style.cssText = `
        max-height: ${maxHeight};
        overflow-y: auto;
        padding: 1rem;
        background-color: transparent;
      `;

      // Update text elements for dark mode
      const timestamps = content.querySelectorAll(".transcript-timestamp");
      timestamps.forEach((ts) => {
        (ts as HTMLElement).style.cssText = `
          color: #60a5fa;
          font-weight: 600;
          cursor: pointer;
          margin-right: 0.75rem;
          display: inline-block;
          min-width: 50px;
          font-size: 2rem;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        `;
      });
      const texts = content.querySelectorAll(".transcript-text");
      texts.forEach((t) => {
        (t as HTMLElement).style.cssText = `
          color: #e5e7eb;
          font-size: 2rem;
          line-height: 1.7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
        `;
      });
    } else {
      // Light mode styles
      container.style.cssText = `
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(229, 231, 235, 0.5);
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      `;
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid rgba(229, 231, 235, 0.5);
        cursor: pointer;
        background-color: rgba(249, 250, 251, 0.5);
      `;
      title.style.cssText = `
        font-size: 2rem;
        font-weight: 600;
        color: #1f2937;
        display: flex;
        align-items: center;
      `;
      arrowSpan.style.cssText = `
        margin-left: 0.5rem;
        color: #9ca3af;
      `;
      copyButton.style.cssText = `
        background-color: #d3d6da;
        color: #1f2937;
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 2rem;
        font-weight: 500;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
      `;
      copyButton.onmouseover = () => {
        copyButton.style.backgroundColor = "#fff";
        copyButton.style.border = "1px solid #575757";
      };
      copyButton.onmouseout = () => {
        copyButton.style.backgroundColor = "#d3d6da";
        copyButton.style.border = "none";
      };
      content.style.cssText = `
        max-height: ${maxHeight};
        overflow-y: auto;
        padding: 1rem;
        background-color: transparent;
      `;

      // Update text elements for light mode
      const timestamps = content.querySelectorAll(".transcript-timestamp");
      timestamps.forEach((ts) => {
        (ts as HTMLElement).style.cssText = `
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
          margin-right: 0.75rem;
          display: inline-block;
          min-width: 50px;
          font-size: 2rem;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        `;
      });
      const texts = content.querySelectorAll(".transcript-text");
      texts.forEach((t) => {
        (t as HTMLElement).style.cssText = `
          color: #1f2937;
          font-size: 2rem;
          line-height: 1.7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
        `;
      });
    }
  };

  const isDarkMode = () => {
    return (
      document.documentElement.classList.contains("dark") ||
      document.querySelector("html")?.getAttribute("dark") !== null ||
      document.body.style.backgroundColor === "rgb(19, 19, 19)" ||
      document.body.style.backgroundColor === "#131313"
    );
  };

  // Apply dark mode initially
  applyDarkModeStyles(isDarkMode());

  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    applyDarkModeStyles(isDarkMode());
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  observer.observe(document.body, { attributes: true });

  const video = document.querySelector("video");
  if (video) {
    video.addEventListener("timeupdate", () => {
      const currentTime = video.currentTime;
      const lines = content.querySelectorAll(".transcript-line");
      const isCurrentlyDarkMode = isDarkMode();

      lines.forEach((line) => {
        const lineEl = line as HTMLElement;
        const start = parseFloat(lineEl.dataset.start || "0");
        const duration = parseFloat(lineEl.dataset.duration || "2");
        const end = start + duration;

        // Highlight if current time is within this specific line's timeframe
        if (currentTime >= start && currentTime < end) {
          lineEl.classList.add("active");
          const textEl = lineEl.querySelector(
            ".transcript-text"
          ) as HTMLElement;
          const timestampEl = lineEl.querySelector(
            ".transcript-timestamp"
          ) as HTMLElement;

          // Add inline styles for active line
          lineEl.style.cssText = `
            margin-bottom: 0.5rem;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: baseline;
            gap: 0.75rem;
            background-color: ${
              isCurrentlyDarkMode
                ? "rgba(30, 58, 138, 0.3)"
                : "rgba(219, 234, 254, 0.5)"
            };
            border-left: 4px solid #3b82f6;
          `;

          if (textEl) {
            textEl.style.color = isCurrentlyDarkMode ? "#93c5fd" : "#1e40af";
            textEl.style.fontWeight = "500";
          }

          if (timestampEl) {
            timestampEl.style.color = "#3b82f6";
          }
        } else {
          lineEl.classList.remove("active");
          const textEl = lineEl.querySelector(
            ".transcript-text"
          ) as HTMLElement;
          const timestampEl = lineEl.querySelector(
            ".transcript-timestamp"
          ) as HTMLElement;

          // Reset to normal styles
          lineEl.style.cssText = `
            margin-bottom: 0.5rem;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: baseline;
            gap: 0.75rem;
          `;

          if (textEl) {
            textEl.style.color = isCurrentlyDarkMode ? "#e5e7eb" : "#1f2937";
            textEl.style.fontWeight = "400";
          }

          if (timestampEl) {
            timestampEl.style.color = "#2563eb";
          }

          lineEl.onmouseover = function () {
            if (!lineEl.classList.contains("active")) {
              lineEl.style.backgroundColor = isCurrentlyDarkMode
                ? "rgba(55, 65, 81, 0.5)"
                : "rgba(243, 244, 246, 0.8)";
            }
          };
          lineEl.onmouseout = function () {
            if (!lineEl.classList.contains("active")) {
              lineEl.style.backgroundColor = "transparent";
            }
          };
        }
      });
    });
  }
}

function formatTimestamp(seconds: number) {
  const date = new Date(0);
  date.setSeconds(seconds);

  // Get total minutes to determine format
  const totalMinutes = Math.floor(seconds / 60);

  if (totalMinutes < 60) {
    // Less than 1 hour - use MM:SS format
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  } else {
    // 1 hour or more - use HH:MM:SS format
    return date.toISOString().substr(11, 8);
  }
}

async function showVideoTranscript() {
  console.log(
    "Productive YouTube: showVideoTranscript called, showTranscript setting:",
    settings.showTranscript
  );

  if (!settings.showTranscript) {
    const existingContainer = document.getElementById("transcript-container");
    if (existingContainer) {
      existingContainer.remove();
      console.log("Productive YouTube: Transcript container removed");
    }
    return;
  }

  try {
    console.log("Productive YouTube: Starting transcript fetch process...");

    const videoId = getVideoId();
    if (!videoId) {
      console.warn("Productive YouTube: Could not get video ID");
      return;
    }
    console.log("Productive YouTube: Video ID found:", videoId);

    // Wait a bit for YouTube to load the player response, then try again
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // First, try to use the existing player response on the page
    let playerApiResponse = null;

    // @ts-ignore
    if (window.ytInitialPlayerResponse) {
      // @ts-ignore
      playerApiResponse = window.ytInitialPlayerResponse;
      console.log(
        "Productive YouTube: Using ytInitialPlayerResponse from page"
      );
      // Debug: log the captions structure
      if (playerApiResponse?.captions) {
        const captionCount =
          playerApiResponse.captions.playerCaptionsTracklistRenderer
            ?.captionTracks?.length || 0;
        console.log(
          "Productive YouTube: Caption tracks available:",
          captionCount
        );
      } else {
        console.log(
          "Productive YouTube: No captions object in player response"
        );
      }
    } else {
      console.log(
        "Productive YouTube: ytInitialPlayerResponse not found on page, fetching from API"
      );
      try {
        // If not available on page, fetch it
        const videoPageHtml = await fetchVideoPage(videoId);
        const apiKey = extractApiKey(videoPageHtml);
        if (!apiKey) {
          console.warn(
            "Productive YouTube: Could not extract API key from video page"
          );
          return;
        }

        playerApiResponse = await fetchPlayerApi(videoId, apiKey);
        console.log(
          "Productive YouTube: Fetched player response from API successfully"
        );
      } catch (fetchError) {
        console.error(
          "Productive YouTube: Failed to fetch from API:",
          fetchError
        );
        return;
      }
    }

    if (!playerApiResponse) {
      console.warn("Productive YouTube: No player API response received");
      return;
    }

    console.log("Productive YouTube: Attempting to extract transcript URL...");
    const transcriptUrl = extractTranscriptUrl(playerApiResponse);
    if (!transcriptUrl) {
      console.warn(
        "Productive YouTube: Could not extract transcript URL - this video may not have captions available"
      );
      return;
    }

    console.log("Productive YouTube: Transcript URL found, fetching XML...");
    const transcriptXml = await fetchTranscriptXml(transcriptUrl);
    const transcript = parseTranscript(transcriptXml);

    if (!transcript || transcript.length === 0) {
      console.warn("Productive YouTube: No transcript content parsed");
      return;
    }

    console.log(
      "Productive YouTube: SUCCESS - Parsed transcript with",
      transcript.length,
      "entries, displaying..."
    );
    displayTranscript(transcript);

    // Initialize AI translation feature after transcript is displayed
    setTimeout(() => {
      initializeTranscriptSelection();
      console.log(
        "Productive YouTube: AI Translation feature initialized for transcript"
      );
    }, 500);
  } catch (error) {
    console.error("Productive YouTube: Error showing video transcript:", error);
  }
}

// Function to determine if we're on a video watch page
function isWatchPage(): boolean {
  return (
    window.location.href.includes("/watch") &&
    !window.location.href.includes("/shorts")
  );
}

// Function to determine if we're on the homepage
function isHomePage(): boolean {
  return window.location.pathname === "/" || window.location.pathname === "";
}

// Extended initialization to handle all features
function initializeFullExtension(): void {
  console.log("Productive YouTube: Initializing...");

  // Load settings and then initialize
  loadSettings(function () {
    // Apply all removals based on settings
    applyAllRemovals();

    // Create observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              shouldCheck = true;
              break;
            }
          }
        }
      });

      if (shouldCheck) {
        applyAllRemovalsThrottled();
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("Productive YouTube: Observer started");
  });
}

// Apply all removal functions based on current page
function applyAllRemovals(): void {
  // Always check these regardless of page
  removeShorts();
  removeShortsButton();

  // Page-specific removals
  if (isWatchPage()) {
    removeVideoSuggestions(); // Always call - function handles restore internally
    showVideoTranscript();
  } else if (isHomePage()) {
    removeHomepageVideos();
  }
}

// Throttled version of applyAllRemovals
function applyAllRemovalsThrottled(): void {
  throttledRemoveShorts();
  throttledRemoveShortsButton();

  if (isWatchPage()) {
    throttledRemoveVideoSuggestions();
  } else if (isHomePage()) {
    throttledRemoveHomepageVideos();
  }
}

// Listen for settings changes and apply them immediately
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === "local") {
    let needsUpdate = false;

    for (let key in changes) {
      if (settings.hasOwnProperty(key)) {
        settings[key as keyof Settings] = changes[key].newValue;
        console.log(`Setting ${key} changed to ${changes[key].newValue}`);
        needsUpdate = true;
      }
    }

    // If settings changed, apply them immediately
    if (needsUpdate) {
      console.log("Applying settings changes immediately...");
      applyAllRemovals();
    }
  }
});

// ==================== AI Translation Feature ====================

interface TranslationResponse {
  urduTranslation: string;
  context: string;
  vocabulary: string[];
  bestWord: string;
}

let translationPopup: HTMLDivElement | null = null;
let isLoadingTranslation = false;

// Helper function to detect YouTube dark mode
function isYouTubeDarkMode(): boolean {
  // Check YouTube's dark mode attribute on html element
  const htmlElement = document.documentElement;
  if (htmlElement.hasAttribute("dark")) {
    return true;
  }

  // Check for dark class
  if (htmlElement.classList.contains("dark")) {
    return true;
  }

  // Check body background color (YouTube uses these in dark mode)
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

// Helper function to update popup theme
function updatePopupTheme(popup: HTMLDivElement): void {
  const isDark = isYouTubeDarkMode();
  console.log("updatePopupTheme called - isDark:", isDark);

  // Update main popup background
  popup.style.background = isDark
    ? "rgba(31, 41, 55, 0.98)"
    : "rgba(255, 255, 255, 0.98)";
  popup.style.boxShadow = `0 8px 32px rgba(0, 0, 0, ${
    isDark ? "0.3" : "0.15"
  })`;

  // Update header
  const header = popup.querySelector(
    "#yt-translation-popup > div:first-child"
  ) as HTMLElement;
  if (header) {
    header.style.background = isDark
      ? "rgba(31, 41, 55, 0.98)"
      : "rgba(255, 255, 255, 0.98)";
    const title = header.querySelector("h3") as HTMLElement;
    if (title) title.style.color = isDark ? "#f9fafb" : "#1f2937";

    const closeBtn = header.querySelector(
      "#close-translation-popup"
    ) as HTMLElement;
    if (closeBtn) closeBtn.style.color = isDark ? "#9ca3af" : "#6b7280";
  }

  // Update content
  const content = popup.querySelector("#translation-content") as HTMLElement;
  if (content) content.style.color = isDark ? "#e5e7eb" : "#374151";

  // Update loading spinner
  const loadingSpinner = popup.querySelector(
    "#translation-loading > div"
  ) as HTMLElement;
  if (loadingSpinner) {
    loadingSpinner.style.borderColor = isDark ? "#374151" : "#f3f4f6";
    loadingSpinner.style.borderTopColor = isDark ? "#60a5fa" : "#3b82f6";
  }
  const loadingText = popup.querySelector(
    "#translation-loading > p"
  ) as HTMLElement;
  if (loadingText) loadingText.style.color = isDark ? "#9ca3af" : "#6b7280";

  // Update all section labels
  const labels = popup.querySelectorAll(
    "#translation-result > div > div:first-child"
  );
  labels.forEach((label) => {
    (label as HTMLElement).style.color = isDark ? "#9ca3af" : "#6b7280";
  });

  // Update selected text box
  const selectedText = popup.querySelector("#selected-text") as HTMLElement;
  if (selectedText) {
    selectedText.style.background = isDark ? "#374151" : "#f9fafb";
    selectedText.style.color = isDark ? "#f9fafb" : "#1f2937";
    selectedText.style.borderLeftColor = isDark ? "#60a5fa" : "#3b82f6";
  }

  // Update Urdu translation box
  const urduTranslation = popup.querySelector(
    "#urdu-translation"
  ) as HTMLElement;
  if (urduTranslation) {
    urduTranslation.style.background = isDark ? "#064e3b" : "#ecfdf5";
    urduTranslation.style.color = isDark ? "#6ee7b7" : "#065f46";
  }

  // Update best word box
  const bestWord = popup.querySelector("#best-word") as HTMLElement;
  if (bestWord) {
    bestWord.style.background = isDark ? "#78350f" : "#fef3c7";
    bestWord.style.color = isDark ? "#fde68a" : "#92400e";
  }

  // Update context box
  const contextText = popup.querySelector("#context-text") as HTMLElement;
  if (contextText) {
    contextText.style.background = isDark ? "#1e3a8a" : "#eff6ff";
    contextText.style.color = isDark ? "#93c5fd" : "#1e40af";
  }

  // Update vocabulary tags
  const vocabTags = popup.querySelectorAll("#vocabulary-list > span");
  vocabTags.forEach((tag) => {
    const tagEl = tag as HTMLElement;
    tagEl.style.background = isDark ? "#1e3a8a" : "#dbeafe";
    tagEl.style.color = isDark ? "#93c5fd" : "#1e40af";
  });

  // Update scrollbar
  const style = popup.querySelector("style");
  if (style) {
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      #yt-translation-popup::-webkit-scrollbar {
        width: 8px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-track {
        background: ${isDark ? "#1f2937" : "#f3f4f6"};
        border-radius: 4px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-thumb {
        background: ${isDark ? "#4b5563" : "#d1d5db"};
        border-radius: 4px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-thumb:hover {
        background: ${isDark ? "#6b7280" : "#9ca3af"};
      }
      
      #close-translation-popup:hover {
        color: ${isDark ? "#f9fafb" : "#1f2937"};
      }
    `;
  }
}

// Create translation popup UI
function createTranslationPopup(): HTMLDivElement {
  const popup = document.createElement("div");
  popup.id = "yt-translation-popup";

  popup.style.cssText = `
    position: fixed;
    z-index: 999999;
    backdrop-filter: blur(20px);
    border-radius: 12px;
    padding: 20px;
    max-width: 420px;
    min-width: 320px;
    max-height: 80vh;
    display: none;
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-y: auto;
    overflow-x: hidden;
  `;

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; position: sticky; top: -20px; padding: 20px 0 16px 0; margin: -20px 0 16px 0; z-index: 10; backdrop-filter: blur(20px);">
      <h3 style="margin: 0; font-size: 16px; font-weight: 600;">AI Translation</h3>
      <button id="close-translation-popup" style="
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      ">×</button>
    </div>
    
    <div id="translation-content" style="line-height: 1.6;">
      <div id="translation-loading" style="text-align: center; padding: 20px;">
        <div style="
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        "></div>
        <p style="margin-top: 12px; font-size: 14px;">Generating translation...</p>
      </div>
      
      <div id="translation-result" style="display: none;">
        <div style="margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">SELECTED TEXT</div>
          <div id="selected-text" style="
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 14px;
            word-wrap: break-word;
          "></div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">اردو ترجمہ</div>
          <div id="urdu-translation" style="
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 15px;
            direction: rtl;
            font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
            word-wrap: break-word;
          "></div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">BEST ALTERNATIVE</div>
          <div id="best-word" style="
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 14px;
            word-wrap: break-word;
          "></div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">SIMILAR VOCABULARY</div>
          <div id="vocabulary-list" style="
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          "></div>
        </div>
        
        <div>
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">CONTEXT</div>
          <div id="context-text" style="
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 13px;
            line-height: 1.6;
            word-wrap: break-word;
          "></div>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      #yt-translation-popup::-webkit-scrollbar {
        width: 8px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-track {
        border-radius: 4px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-thumb {
        border-radius: 4px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-thumb:hover {
      }
      
      #close-translation-popup:hover {
      }
    </style>
  `;

  document.body.appendChild(popup);

  // Apply initial theme
  updatePopupTheme(popup);

  // Track previous theme state to avoid unnecessary updates
  let previousThemeState = isYouTubeDarkMode();

  // Watch for theme changes with improved detection
  const themeObserver = new MutationObserver(() => {
    const currentThemeState = isYouTubeDarkMode();

    // Only update if theme has actually changed
    if (currentThemeState !== previousThemeState) {
      previousThemeState = currentThemeState;
      console.log(
        "AI Popup: Theme changed to",
        currentThemeState ? "dark" : "light"
      );

      // Update popup if it's visible
      if (popup.style.display === "block") {
        updatePopupTheme(popup);
      }
    }
  });

  // Observe changes to html element (YouTube changes 'dark' attribute and class)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["dark", "class"],
    attributeOldValue: true,
  });

  // Also watch for body style changes
  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["style"],
  });

  // Close button handler
  const closeBtn = popup.querySelector("#close-translation-popup");
  closeBtn?.addEventListener("click", () => {
    popup.style.display = "none";
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (popup.style.display === "block" && !popup.contains(e.target as Node)) {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "") {
        popup.style.display = "none";
      }
    }
  });

  return popup;
}

// Get API key from user's storage
// API key no longer needed - using free OpenRouter model

// Translation cache to avoid repeated API calls
const translationCache = new Map<string, TranslationResponse>();
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests (HF has generous limits)

// Call Hugging Face API for translation via background service worker
async function translateWithAI(text: string): Promise<TranslationResponse> {
  // Check cache first
  if (translationCache.has(text)) {
    console.log("Using cached translation for:", text);
    return translationCache.get(text)!;
  }

  // Rate limiting: wait if last request was too recent
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();

  // Send message to background service worker to handle API call (bypasses CORS)
  // No API key needed - using free OpenRouter model
  const response = await chrome.runtime.sendMessage({
    type: "TRANSLATE_TEXT",
    text: text,
  });

  if (!response.success) {
    throw new Error(response.error || "Translation failed");
  }

  const result = response.data;

  // Cache the successful result
  translationCache.set(text, result);

  // Limit cache size to 50 entries
  if (translationCache.size > 50) {
    const firstKey = translationCache.keys().next().value;
    if (firstKey) {
      translationCache.delete(firstKey);
    }
  }

  return result;
}

// Show translation popup with results
function showTranslationPopup(text: string, x: number, y: number): void {
  if (!translationPopup) {
    translationPopup = createTranslationPopup();
  }

  // Dynamic positioning to keep popup within viewport
  const popupWidth = 420;
  const popupMaxHeight = window.innerHeight * 0.8; // 80vh
  const padding = 20;

  // Calculate horizontal position
  let left = x;
  if (left + popupWidth > window.innerWidth - padding) {
    left = window.innerWidth - popupWidth - padding;
  }
  if (left < padding) {
    left = padding;
  }

  // Calculate vertical position
  let top = y + 10;
  if (top + popupMaxHeight > window.innerHeight - padding) {
    // Show above selection if not enough space below
    top = Math.max(padding, y - popupMaxHeight - 10);
  }

  translationPopup.style.left = `${left}px`;
  translationPopup.style.top = `${top}px`;
  translationPopup.style.display = "block";

  // Apply current theme IMMEDIATELY when showing
  setTimeout(() => {
    updatePopupTheme(translationPopup!);
  }, 0);

  // Show loading state
  const loadingDiv = translationPopup.querySelector(
    "#translation-loading"
  ) as HTMLElement;
  const resultDiv = translationPopup.querySelector(
    "#translation-result"
  ) as HTMLElement;
  const selectedTextDiv = translationPopup.querySelector(
    "#selected-text"
  ) as HTMLElement;

  loadingDiv.style.display = "block";
  resultDiv.style.display = "none";
  selectedTextDiv.textContent = text;

  // Fetch translation
  if (!isLoadingTranslation) {
    isLoadingTranslation = true;

    translateWithAI(text)
      .then((result: TranslationResponse) => {
        // Update UI with results
        const urduDiv = translationPopup!.querySelector(
          "#urdu-translation"
        ) as HTMLElement;
        const bestWordDiv = translationPopup!.querySelector(
          "#best-word"
        ) as HTMLElement;
        const vocabDiv = translationPopup!.querySelector(
          "#vocabulary-list"
        ) as HTMLElement;
        const contextDiv = translationPopup!.querySelector(
          "#context-text"
        ) as HTMLElement;

        urduDiv.textContent = result.urduTranslation;
        bestWordDiv.textContent = result.bestWord;
        contextDiv.textContent = result.context;

        // Render vocabulary tags
        const isDark = isYouTubeDarkMode();
        vocabDiv.innerHTML = result.vocabulary
          .map(
            (word: string) => `
          <span style="
            padding: 6px 12px;
            background: ${isDark ? "#1e3a8a" : "#dbeafe"};
            color: ${isDark ? "#93c5fd" : "#1e40af"};
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
          ">${word}</span>
        `
          )
          .join("");

        // Show results
        loadingDiv.style.display = "none";
        resultDiv.style.display = "block";

        // Apply theme to ALL elements after results are shown
        updatePopupTheme(translationPopup!);

        // Also re-apply the vocabulary tag styles as backup
        setTimeout(() => {
          updatePopupTheme(translationPopup!);
          // Re-render vocabulary tags with current theme
          const isDarkNow = isYouTubeDarkMode();
          const vocabSpans = vocabDiv.querySelectorAll("span");
          vocabSpans.forEach((span) => {
            span.style.background = isDarkNow ? "#1e3a8a" : "#dbeafe";
            span.style.color = isDarkNow ? "#93c5fd" : "#1e40af";
          });
        }, 100);
      })
      .catch((error: Error) => {
        console.error("Translation error:", error);
        const isDark = isYouTubeDarkMode();
        loadingDiv.innerHTML = `
          <div style="color: ${
            isDark ? "#f87171" : "#dc2626"
          }; text-align: center;">
            <p style="font-weight: 600; margin-bottom: 8px;">⚠️ Error</p>
            <p style="font-size: 14px;">${error.message}</p>
            <p style="font-size: 12px; color: ${
              isDark ? "#9ca3af" : "#6b7280"
            }; margin-top: 8px;">
              ${
                !error.message.includes("API key")
                  ? ""
                  : "Go to extension settings to add your Gemini API key"
              }
            </p>
          </div>
        `;
      })
      .finally(() => {
        isLoadingTranslation = false;
      });
  }
}

// Initialize text selection handler for transcript
let isTranscriptSelectionInitialized = false;

function initializeTranscriptSelection(): void {
  if (isTranscriptSelectionInitialized) {
    console.log(
      "Transcript selection handler already initialized, skipping..."
    );
    return;
  }

  console.log("Initializing transcript text selection handler...");
  isTranscriptSelectionInitialized = true;

  document.addEventListener("mouseup", (e) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0 && selectedText.length < 300) {
      // Check if selection is within transcript
      const target = e.target as HTMLElement;
      const transcriptContainer = document.getElementById(
        "transcript-container"
      );

      // Check if the target or any parent is a transcript line
      const isInTranscript =
        target.closest(".transcript-line, .transcript-text") !== null ||
        transcriptContainer?.contains(target);

      console.log(
        "Selection:",
        selectedText,
        "Container found:",
        !!transcriptContainer,
        "Within transcript:",
        isInTranscript
      );

      if (isInTranscript) {
        const range = selection!.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        console.log("Showing translation popup for:", selectedText);

        // Show popup near selection
        showTranslationPopup(
          selectedText,
          rect.left + window.scrollX,
          rect.bottom + window.scrollY + 10
        );
      }
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFullExtension);
} else {
  initializeFullExtension();
}
