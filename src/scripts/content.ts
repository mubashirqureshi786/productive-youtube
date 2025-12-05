console.log("Productive YouTube: Content script loaded");

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
    console.log("Productive YouTube: Settings loaded", settings);

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
                console.log(`Found channel "${channel}" embedded in title`);
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
            console.log(
              `Found channel "${channel}" using selector "${channelSelector}"`
            );
            break; // Found valid channel, stop looking
          }
        }
      }

      // Debug: If no channel found, log container structure and search for any text elements
      if (!channel && title) {
        console.log(
          `No channel found for "${title}". Container HTML:`,
          container.innerHTML.substring(0, 300) + "..."
        );

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
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
}

async function fetchVideoPage(videoId: string) {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
  return response.text();
}

function extractApiKey(html: string) {
  const match = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  return match ? match[1] : null;
}

async function fetchPlayerApi(videoId: string, apiKey: string) {
  const response = await fetch(
    `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20210721.00.00",
          },
        },
        videoId: videoId,
      }),
    }
  );
  return response.json();
}

function extractTranscriptUrl(playerApiResponse: any) {
  const captionTracks =
    playerApiResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!captionTracks) {
    return null;
  }

  const transcriptTrack = captionTracks.find((track: any) => track.kind === "asr");
  return transcriptTrack ? transcriptTrack.baseUrl : null;
}

async function fetchTranscriptXml(url: string) {
  const response = await fetch(url);
  return response.text();
}

function parseTranscript(xml: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");
  const textNodes = xmlDoc.getElementsByTagName("text");
  const transcript = [];
  for (let i = 0; i < textNodes.length; i++) {
    const text = textNodes[i].textContent || "";
    const start = parseFloat(textNodes[i].getAttribute("start") || "0");
    transcript.push({ text, start });
  }
  return transcript;
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

function displayTranscript(transcript: { text: string; start: number }[]) {
  const secondary = document.querySelector("#secondary");
  if (!secondary) {
    return;
  }

  // Group transcript entries into chunks
  // CHUNK_SIZE can be adjusted for experimentation (currently 30 seconds)
  const CHUNK_SIZE = 5; // seconds
  const chunkedTranscript: { start: number; text: string }[] = [];
  let currentChunk: { start: number; text: string } | null = null;
  
  transcript.forEach(line => {
    // Decode HTML entities in the text
    const decodedText = decodeHtmlEntities(line.text);
    const chunkStart = Math.floor(line.start / CHUNK_SIZE) * CHUNK_SIZE; // Round down to nearest chunk
    
    if (!currentChunk || currentChunk.start !== chunkStart) {
      // Start a new chunk
      if (currentChunk) {
        chunkedTranscript.push(currentChunk);
      }
      currentChunk = {
        start: chunkStart,
        text: decodedText
      };
    } else {
      // Add to current chunk
      currentChunk.text += " " + decodedText;
    }
  });
  
  // Don't forget the last chunk
  if (currentChunk) {
    chunkedTranscript.push(currentChunk);
  }

  let container = document.getElementById("transcript-container");
  if (container) {
    container.innerHTML = "";
  } else {
    container = document.createElement("div");
    container.id = "transcript-container";
    container.className = "transcript-container";
    // Add inline styles for proper appearance
    container.style.cssText = `
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    `;
    secondary.prepend(container);
  }

  const header = document.createElement("div");
  header.className = "transcript-header";
  // Add inline styles for header
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    background-color: #f9fafb;
  `;
  container.appendChild(header);

  const title = document.createElement("div");
  title.className = "transcript-title";
  title.textContent = "Video Transcript";
  // Add inline styles for title
  title.style.cssText = `
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
  `;
  header.appendChild(title);

  // Add expand/collapse indicator
  const arrowSpan = document.createElement("span");
  arrowSpan.className = "transcript-arrow";
  arrowSpan.style.cssText = `
    margin-left: 0.5rem;
    color: #9ca3af;
  `;
  arrowSpan.textContent = "▲";
  title.appendChild(arrowSpan);

  const copyButton = document.createElement("button");
  copyButton.className = "transcript-copy-button";
  copyButton.textContent = "Copy Text";
  // Add inline styles for copy button
  copyButton.style.cssText = `
    background-color: #e5e7eb;
    color: #1f2937;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
  `;
  copyButton.onmouseover = () => {
    copyButton.style.backgroundColor = "#d1d5db";
  };
  copyButton.onmouseout = () => {
    copyButton.style.backgroundColor = "#e5e7eb";
  };
  copyButton.onclick = () => {
    const transcriptText = chunkedTranscript.map((chunk) => `[${formatTimestamp(chunk.start)}] ${chunk.text}`).join(" \n\n");
    navigator.clipboard.writeText(transcriptText);
    copyButton.textContent = "Copied!";
    setTimeout(() => {
      copyButton.textContent = "Copy Text";
    }, 2000);
  };
  header.appendChild(copyButton);

  const content = document.createElement("div");
  content.className = "transcript-content";
  // Add inline styles for content
  content.style.cssText = `
    max-height: 24rem;
    overflow-y: auto;
    padding: 1rem;
    background-color: #fff;
  `;
  container.appendChild(content);

  header.onclick = () => {
    content.style.display = content.style.display === "none" ? "block" : "none";
    const arrow = header.querySelector('.transcript-arrow');
    if (arrow) {
      arrow.textContent = content.style.display === "none" ? "▼" : "▲";
    }
  };

  chunkedTranscript.forEach((chunk) => {
    const lineEl = document.createElement("div");
    lineEl.className = "transcript-line";
    lineEl.dataset.start = chunk.start.toString();
    // Add inline styles for transcript line
    lineEl.style.cssText = `
      margin-bottom: 0.75rem;
      padding: 0.75rem;
      border-radius: 0.5rem;
      transition: background-color 0.2s;
    `;
    
    lineEl.onmouseover = function() {
      // Check if dark mode is active
      const isDarkMode = document.documentElement.classList.contains('dark') || 
        document.querySelector('html')?.getAttribute('dark') !== null ||
        document.body.style.backgroundColor === 'rgb(19, 19, 19)' ||
        document.body.style.backgroundColor === '#131313';
      
      lineEl.style.backgroundColor = isDarkMode ? "#374151" : "#f3f4f6";
    };
    lineEl.onmouseout = function() {
      lineEl.style.backgroundColor = "transparent";
    };

    const timestampEl = document.createElement("span");
    timestampEl.className = "transcript-timestamp";
    timestampEl.textContent = formatTimestamp(chunk.start);
    // Add inline styles for timestamp
    timestampEl.style.cssText = `
      color: #2563eb;
      font-weight: 600;
      cursor: pointer;
      margin-right: 0.75rem;
      display: inline-block;
      min-width: 45px;
      font-size: 0.875rem;
    `;
    timestampEl.onclick = () => {
      const video = document.querySelector("video");
      if (video) {
        video.currentTime = chunk.start;
      }
    };

    const textEl = document.createElement("span");
    textEl.className = "transcript-text";
    textEl.textContent = chunk.text;
    // Add inline styles for text
    textEl.style.cssText = `
      color: #1f2937;
      font-size: 1rem;
      line-height: 1.625;
    `;

    lineEl.appendChild(timestampEl);
    lineEl.appendChild(textEl);
    content.appendChild(lineEl);
  });

  // Add dark mode support
  const applyDarkModeStyles = (element: HTMLElement, isDarkMode: boolean) => {
    if (isDarkMode) {
      // Dark mode styles
      container.style.cssText = `
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      `;
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid #374151;
        cursor: pointer;
        background-color: #111827;
      `;
      title.style.cssText = `
        font-size: 1.125rem;
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
        background-color: #374151;
        color: #f9fafb;
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
      `;
      content.style.cssText = `
        max-height: 24rem;
        overflow-y: auto;
        padding: 1rem;
        background-color: #1f2937;
      `;
      
      // Update text elements for dark mode
      const timestamps = content.querySelectorAll('.transcript-timestamp');
      timestamps.forEach(ts => {
        (ts as HTMLElement).style.cssText = `
          color: #60a5fa;
          font-weight: 600;
          cursor: pointer;
          margin-right: 0.75rem;
          display: inline-block;
          min-width: 45px;
          font-size: 0.875rem;
        `;
      });
      const texts = content.querySelectorAll('.transcript-text');
      texts.forEach(t => {
        (t as HTMLElement).style.cssText = `
          color: #e5e7eb;
          font-size: 1rem;
          line-height: 1.625;
        `;
      });
    } else {
      // Light mode styles
      container.style.cssText = `
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      `;
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        cursor: pointer;
        background-color: #f9fafb;
      `;
      title.style.cssText = `
        font-size: 1.125rem;
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
        background-color: #e5e7eb;
        color: #1f2937;
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
      `;
      content.style.cssText = `
        max-height: 24rem;
        overflow-y: auto;
        padding: 1rem;
        background-color: #fff;
      `;
      
      // Update text elements for light mode
      const timestamps = content.querySelectorAll('.transcript-timestamp');
      timestamps.forEach(ts => {
        (ts as HTMLElement).style.cssText = `
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
          margin-right: 0.75rem;
          display: inline-block;
          min-width: 45px;
          font-size: 0.875rem;
        `;
      });
      const texts = content.querySelectorAll('.transcript-text');
      texts.forEach(t => {
        (t as HTMLElement).style.cssText = `
          color: #1f2937;
          font-size: 1rem;
          line-height: 1.625;
        `;
      });
    }
  };

  const isDarkMode = () => {
    return document.documentElement.classList.contains('dark') || 
      document.querySelector('html')?.getAttribute('dark') !== null ||
      document.body.style.backgroundColor === 'rgb(19, 19, 19)' ||
      document.body.style.backgroundColor === '#131313';
  };

  // Apply dark mode initially
  applyDarkModeStyles(container, isDarkMode());
  
  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    applyDarkModeStyles(container, isDarkMode());
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.body, { attributes: true });

  const video = document.querySelector("video");
  if (video) {
    video.addEventListener("timeupdate", () => {
      const currentTime = video.currentTime;
      const lines = content.querySelectorAll(".transcript-line");
      lines.forEach((line) => {
        const lineEl = line as HTMLElement;
        const start = parseFloat(lineEl.dataset.start || "0");
        // Highlight if current time is within this chunk
        if (currentTime >= start && currentTime < start + CHUNK_SIZE) {
          lineEl.classList.add("active");
          // Add inline styles for active line
          const isCurrentlyDarkMode = isDarkMode();
          lineEl.style.cssText = `
            margin-bottom: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s;
            background-color: ${isCurrentlyDarkMode ? '#1e3a8a' : '#dbeafe'};
            border-left: 4px solid #3b82f6;
          `;
        } else {
          lineEl.classList.remove("active");
          // Reset to normal styles
          const isCurrentlyDarkMode = isDarkMode();
          lineEl.style.cssText = `
            margin-bottom: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s;
          `;
          lineEl.onmouseover = function() {
            lineEl.style.backgroundColor = isCurrentlyDarkMode ? "#374151" : "#f3f4f6";
          };
          lineEl.onmouseout = function() {
            lineEl.style.backgroundColor = "transparent";
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    // 1 hour or more - use HH:MM:SS format
    return date.toISOString().substr(11, 8);
  }
}

async function showVideoTranscript() {
  if (!settings.showTranscript) {
    const existingContainer = document.getElementById("transcript-container");
    if (existingContainer) {
      existingContainer.remove();
    }
    return;
  }

  try {
    const videoId = getVideoId();
    if (!videoId) {
      console.log("Could not get video ID");
      return;
    }

    const videoPageHtml = await fetchVideoPage(videoId);
    const apiKey = extractApiKey(videoPageHtml);
    if (!apiKey) {
      console.log("Could not extract API key");
      return;
    }

    const playerApiResponse = await fetchPlayerApi(videoId, apiKey);
    const transcriptUrl = extractTranscriptUrl(playerApiResponse);
    if (!transcriptUrl) {
      console.log("Could not extract transcript URL");
      return;
    }

    const transcriptXml = await fetchTranscriptXml(transcriptUrl);
    const transcript = parseTranscript(transcriptXml);

    displayTranscript(transcript);
  } catch (error) {
    console.error("Error showing video transcript:", error);
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

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFullExtension);
} else {
  initializeFullExtension();
}
