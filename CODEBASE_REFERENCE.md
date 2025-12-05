# YouTube Shorts & Video Suggestions Remover - Codebase Reference

**Generated:** October 27, 2025  
**Version:** 1.3.0  
**Type:** Chrome Extension (Manifest V3)  
**Stack:** React 18 + TypeScript + Tailwind CSS + Vite

---

## 📋 Project Overview

A Chrome browser extension that removes YouTube Shorts, homepage videos, and video suggestions from YouTube. Built with modern web technologies including React, TypeScript, and Tailwind CSS.

### Key Features

1. **Remove YouTube Shorts** - Hides Shorts shelves from all YouTube pages
2. **Remove Homepage Videos** - Hides all suggested videos from YouTube homepage
3. **Remove Video Suggestions** - Hides suggested videos from right sidebar (watch page)
4. **Real-time Settings** - Toggle features on/off via popup UI with immediate effect
5. **Smart Detection** - Preserves playlist content while removing suggestions

---

## 📁 Project Structure

```
yt-shorts-remover-react/
├── src/
│   ├── components/
│   │   └── PopupApp.tsx          # Main popup React component with UI
│   ├── scripts/
│   │   └── content.ts            # Content script - removes elements from YouTube
│   ├── styles/
│   │   └── index.css             # Tailwind CSS + custom toggle styles
│   ├── popup.html                # HTML template for extension popup
│   └── popup.tsx                 # React entry point for popup
├── public/
│   ├── manifest.json             # Chrome extension manifest (V3)
│   └── icons/                    # Extension icons (16x16, 48x48, 128x128)
├── dist/                         # Build output directory (gitignored)
├── package.json                  # Dependencies & build scripts
├── vite.config.ts               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── postcss.config.js            # PostCSS configuration
├── README.md                     # User-facing documentation
├── DEVELOPMENT.md                # Developer workflow guide
└── INSTALLATION.md               # Installation instructions
```

---

## 🔧 Technical Stack

### Core Technologies

- **React 18.2.0** - UI framework for popup interface
- **TypeScript 5.2.2** - Type-safe development
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
- **Vite 5.0.8** - Fast build tool and dev server
- **Chrome Extensions API (Manifest V3)** - Browser extension platform

### Build Tools & Dev Dependencies

- `@vitejs/plugin-react` - Vite plugin for React support
- `@types/chrome` - TypeScript definitions for Chrome API
- `autoprefixer` & `postcss` - CSS post-processing
- `rimraf` - Cross-platform directory cleanup

---

## 📄 Key Files Deep Dive

### 1. `public/manifest.json`

**Purpose:** Chrome extension configuration (Manifest V3)

**Key Properties:**

- **Version:** 1.3.0
- **Permissions:** `storage` (for settings), host access to `*.youtube.com`
- **Content Scripts:** Injects `content_script.js` on all YouTube pages at `document_end`
- **Action:** Defines popup UI (`popup.html`)
- **Icons:** 16px, 48px, 128px for different contexts

**Critical Details:**

- Uses Manifest V3 (latest standard)
- Content script runs on all YouTube URLs (`*://*.youtube.com/*`)
- Web accessible resources include `popup.js` and `popup.css`

---

### 2. `src/scripts/content.ts` (613 lines)

**Purpose:** Core extension logic that removes YouTube elements

#### Architecture Overview

```typescript
// Settings interface
interface Settings {
  removeShorts: boolean;
  removeHomepageVideos: boolean;
}

// Video metadata interface
interface VideoInfo {
  title: string;
  channel: string;
}
```

#### Key Functions

**`loadSettings(callback?)`**

- Loads user preferences from `chrome.storage.local`
- Defaults both settings to `true` if not set
- Executes optional callback after loading

**`removeShorts()`**

- Checks if `settings.removeShorts` is enabled
- Iterates through `SHORTS_SELECTORS` array
- Extracts video titles/channels before hiding
- Marks elements with `data-shorts-removed="true"`
- Hides elements using `display: none`

**`removeHomepageVideos()`**

- Checks if `settings.removeHomepageVideos` is enabled
- Uses `HOMEPAGE_VIDEO_SELECTORS` to find video elements
- Skips navigation/header elements (by role/aria-label)
- Marks elements with `data-homepage-videos-removed="true"`

**`removeVideoSuggestions()`**

- Targets right sidebar suggestions on watch pages
- Uses `VIDEO_SUGGESTIONS_SELECTORS`
- **Smart filtering:** Skips playlist items (preserves playlists)
- Marks elements with `data-suggestions-removed="true"`

**`extractTitlesAndChannelsFromShelf(shelf)`**

- Extracts video metadata from Shorts shelves before removal
- Handles multiple YouTube DOM structures (2024+ updates)
- Uses priority-based selector arrays for titles and channels
- Validates channel names (excludes titles, metadata, emojis)
- Returns `VideoInfo[]` array
- Logs extracted videos to console for debugging

#### Helper Functions

- `throttledRemoveShorts()` - Debounces removal calls (100ms)
- `throttledRemoveHomepageVideos()` - Debounces homepage removal
- `throttledRemoveVideoSuggestions()` - Debounces suggestion removal
- `isWatchPage()` - Detects `/watch` URLs (excludes `/shorts`)
- `isHomePage()` - Detects homepage (excludes watch, shorts, search)

#### Selectors (Multiple arrays for DOM resilience)

**`SHORTS_SELECTORS`** (5 selectors)

```typescript
[
  "ytd-reel-shelf-renderer",
  "ytd-rich-shelf-renderer[is-shorts]",
  '[aria-label*="Shorts"]',
  "ytd-shells-renderer",
  '#dismissible[class*="shorts"]',
];
```

**`VIDEO_SUGGESTIONS_SELECTORS`** (12 selectors)

- Targets compact video renderers in `#secondary-inner`
- Includes playlist renderers, reel shelves
- Targets `ytd-watch-next-secondary-results-renderer`
- Handles continuation items and item sections

**`HOMEPAGE_VIDEO_SELECTORS`** (10 selectors)

- Targets `ytd-rich-item-renderer`, `ytd-rich-grid-row`
- Handles multiple YouTube layout versions
- Includes legacy `ytd-grid-video-renderer`

#### Initialization Flow

```
1. loadSettings() - Load user preferences
2. Determine page type (watch/home/other)
3. Apply initial removal based on page
4. Create MutationObserver
5. Observe DOM changes and throttle removals
6. Listen for settings changes via chrome.storage
```

**`initializeFullExtension()`**

- Main entry point called on DOM ready
- Loads settings first, then applies removals
- Sets up `MutationObserver` for dynamic content
- Observes `document.body` with `childList` and `subtree` options
- Applies appropriate removal functions based on page type

**Storage Change Listener**

- Listens to `chrome.storage.onChanged`
- Updates settings in real-time
- Clears pending timeouts
- Immediately re-applies removal logic

---

### 3. `src/components/PopupApp.tsx` (134 lines)

**Purpose:** React component for extension popup UI

#### Component Structure

```tsx
PopupApp (main component)
├── StatusIndicator (shows extension is active)
├── Settings Panel
│   ├── ToggleSwitch (Remove YouTube Shorts)
│   └── ToggleSwitch (Remove Homepage Videos)
└── InfoSection (debugging instructions)
```

#### State Management

```typescript
const [settings, setSettings] = useState<Settings>({
  removeShorts: true,
  removeHomepageVideos: true,
});
```

#### Key Features

- **Loads settings** from `chrome.storage.local` on mount (`useEffect`)
- **Real-time sync** with storage (saves on toggle change)
- **Toggle handlers** update both local state and Chrome storage
- **Tailwind styling** for modern, clean UI
- **Version display** shows "Version 1.3" at bottom

#### Child Components

**`ToggleSwitch`**

- Props: `id`, `label`, `checked`, `onChange`
- Custom CSS toggle using Tailwind classes
- Green checkmark indicator when enabled

**`StatusIndicator`**

- Static component showing "Extension is active and running"
- Green background with checkmark emoji

**`InfoSection`**

- Displays debugging tip (F12 console)
- Blue background for info styling

---

### 4. `src/popup.tsx` (11 lines)

**Purpose:** React entry point for popup

**What it does:**

1. Imports React, ReactDOM, and `PopupApp` component
2. Imports Tailwind styles
3. Finds `#root` div in `popup.html`
4. Creates React root and renders `PopupApp`

---

### 5. `src/popup.html` (11 lines)

**Purpose:** HTML template for extension popup

**Contents:**

- Basic HTML5 structure
- `<div id="root"></div>` for React mounting
- Module script tag pointing to `/src/popup.tsx`
- Meta charset and viewport tags

**Note:** Vite transforms this during build:

- Script path changes from `/src/popup.tsx` to `./popup.js`
- Gets moved to `dist/popup.html`

---

### 6. `src/styles/index.css` (32 lines)

**Purpose:** Tailwind CSS + custom toggle switch styles

**Structure:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  /* Custom toggle switch styles */
}
```

#### Custom Components

- `.toggle-switch` - Container for toggle (w-12 h-6)
- `.toggle-slider` - Background slider (gray -> green)
- `.toggle-slider:before` - White circle that slides
- Animated transitions (300ms duration)
- Uses `translate-x-6` when checked

---

### 7. `vite.config.ts` (37 lines)

**Purpose:** Vite build configuration for Chrome extension

#### Key Configuration

**Input Files:**

```typescript
input: {
  popup: "src/popup.html",
  content: "src/scripts/content.ts",
}
```

**Output File Naming:**

```typescript
entryFileNames: (chunkInfo) => {
  if (chunkInfo.name === "content") {
    return "content_script.js"; // Required name for manifest
  }
  return "[name].js";
};
```

**Critical Settings:**

- `base: "./"` - Relative paths for extension
- `sourcemap: false` - No source maps in production
- `minify: true` - Minified output
- Asset naming preserves `popup.html` and `popup.css`

---

### 8. `tailwind.config.js` (17 lines)

**Purpose:** Tailwind CSS configuration

**Content Paths:**

- `./src/**/*.{js,ts,jsx,tsx}`
- `./src/popup.html`

**Custom Theme Extensions:**

```javascript
colors: {
  "youtube-red": "#FF0000",
  "youtube-dark": "#181818",
  "youtube-gray": "#F9F9F9",
}
fontFamily: {
  youtube: ["YouTube Sans", "Roboto", "Arial", "sans-serif"],
}
```

---

### 9. `package.json` (35 lines)

**Purpose:** Project metadata and scripts

#### NPM Scripts

**`npm run build`**

- Runs `vite build` + `npm run copy-files`
- Produces production-ready extension in `dist/`

**`npm run copy-files`** (inline Node script)

1. Copies `manifest.json` to `dist/`
2. Creates `dist/icons/` directory
3. Copies icon files (icon16.png, icon48.png, icon128.png)
4. Moves `popup.html` from `dist/src/` to `dist/`
5. Updates popup.html script/CSS paths (removes `../`)
6. Removes `dist/src/` directory

**`npm run watch`**

- Runs `vite build --watch` for development
- Auto-rebuilds on file changes

**`npm run package`**

- Builds extension and creates `extension.zip`
- Ready for Chrome Web Store submission

---

### 10. `tsconfig.json` (23 lines)

**Purpose:** TypeScript compiler configuration

**Key Settings:**

- `target: "ES2020"` - Modern JavaScript
- `jsx: "react-jsx"` - New JSX transform (no React import needed)
- `strict: true` - Strict type checking
- `moduleResolution: "bundler"` - Vite bundler resolution
- `types: ["chrome", "vite/client", "node"]` - Type definitions

---

## 🔄 Build Process Flow

### Development (`npm run watch`)

```
1. Vite watches src/ files
2. TypeScript compiles with type checking
3. React components transpiled
4. Tailwind CSS processed via PostCSS
5. Content script bundled as content_script.js
6. Popup bundled as popup.js + popup.css
7. Output to dist/ (incremental)
8. Manual reload in chrome://extensions required
```

### Production (`npm run build`)

```
1. Vite builds optimized production bundle
   ├── Minifies JavaScript
   ├── Optimizes CSS (removes unused Tailwind)
   └── Generates popup.html, popup.js, popup.css, content_script.js
2. npm run copy-files executes
   ├── Copies manifest.json to dist/
   ├── Copies icons to dist/icons/
   ├── Moves popup.html to dist root
   ├── Fixes popup.html asset paths
   └── Cleans up dist/src/ folder
3. Result: Clean dist/ ready for loading in Chrome
```

### Package (`npm run package`)

```
1. Runs production build
2. Creates extension.zip from dist/*
3. Ready for Chrome Web Store distribution
```

---

## 🎯 Chrome Extension Architecture

### Manifest V3 Components

#### 1. **Content Script** (`content_script.js`)

- **Runs on:** All YouTube pages (`*://*.youtube.com/*`)
- **Timing:** `document_end` (after DOM load, before images)
- **Access:** Full DOM access, can manipulate page elements
- **Isolation:** Cannot access page's JavaScript context
- **Communication:** Uses `chrome.storage` API for settings

#### 2. **Popup** (`popup.html`)

- **Triggered by:** Clicking extension icon in toolbar
- **Lifetime:** Temporary (closes when unfocused)
- **Purpose:** User interface for toggling settings
- **Storage:** Saves to `chrome.storage.local`
- **Size:** 320px width (fixed via Tailwind)

#### 3. **Storage API**

- **Type:** `chrome.storage.local`
- **Keys:**
  - `removeShorts` (boolean)
  - `removeHomepageVideos` (boolean)
- **Sync:** Real-time via `chrome.storage.onChanged` listener

---

## 🐛 Debugging & Logging

### Console Logs (Content Script)

**Extension Lifecycle:**

```
"YouTube Shorts & Video Suggestions Remover: Content script loaded"
"YouTube Shorts & Video Suggestions Remover: Settings loaded", {settings}
"YouTube Shorts & Video Suggestions Remover: Initializing..."
"YouTube Shorts & Video Suggestions Remover: Observer started"
```

**Feature Activity:**

```
"YouTube Shorts Remover: Hidden element with selector: {selector}"
"YouTube Shorts Remover: Hidden {count} Shorts shelf(s)"
"YouTube Shorts Remover: Found {count} Shorts videos in shelf:"
"  1. "{title}" - {channel}"
"Homepage Videos Remover: Hidden {count} homepage video elements"
"Video Suggestions Remover: Hidden {count} video suggestion elements"
```

**Settings Changes:**

```
"Setting {key} changed to {value}"
"Applying settings changes immediately..."
```

**Debugging Info:**

```
"No channel found for "{title}". Container HTML: ..."
"Potential channel candidates: [...]"
"Shelf HTML structure: ..."
```

### Where to View Logs

- **Content Script:** YouTube page → F12 → Console tab
- **Popup:** Right-click extension icon → Inspect popup → Console

---

## 🔍 DOM Selector Strategy

### Why Multiple Selectors?

YouTube frequently updates their DOM structure. The extension uses **resilient selector arrays** to handle:

- Layout changes
- A/B testing variations
- Desktop vs mobile web differences
- Gradual rollouts of new UI

### Selector Priority

1. **Specific custom elements** (e.g., `ytd-reel-shelf-renderer`)
2. **Attribute-based** (e.g., `[is-shorts]`, `[aria-label*="Shorts"]`)
3. **Class-based** (e.g., `#dismissible[class*="shorts"]`)
4. **Generic containers** (as fallback)

### Data Attributes for Tracking

- `data-shorts-removed="true"` - Marks processed Shorts shelves
- `data-homepage-videos-removed="true"` - Marks removed homepage videos
- `data-suggestions-removed="true"` - Marks removed suggestions

**Purpose:** Prevents re-processing same elements

---

## 🚀 Performance Optimizations

### 1. **Throttling**

All removal functions use 100ms throttling via `setTimeout`:

```typescript
function throttledRemoveShorts(): void {
  clearTimeout(timeoutId);
  timeoutId = window.setTimeout(removeShorts, 100);
}
```

**Why:** Prevents excessive re-runs during rapid DOM mutations

### 2. **Data Attribute Checks**

Elements marked with `data-*-removed` are skipped:

```typescript
if (htmlElement && !htmlElement.dataset.shortsRemoved) {
  // Process element
}
```

**Why:** Avoids redundant processing

### 3. **MutationObserver Filtering**

Only triggers on added elements (not attributes/character data):

```typescript
if (mutation.addedNodes.length > 0) {
  for (let node of mutation.addedNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      shouldCheck = true;
      break;
    }
  }
}
```

**Why:** Reduces unnecessary callback invocations

### 4. **Page-Specific Logic**

Only runs relevant functions per page type:

```typescript
if (isWatchPage()) {
  removeShorts();
  removeVideoSuggestions(); // Only on watch pages
} else if (isHomePage()) {
  removeShorts();
  removeHomepageVideos(); // Only on homepage
}
```

---

## 🎨 UI/UX Design

### Popup Dimensions

- **Width:** 320px (Tailwind `w-80`)
- **Padding:** 20px (Tailwind `p-5`)
- **Font:** Sans-serif, 14px base

### Color Scheme

- **Active/Success:** Green (`bg-green-50`, `text-green-800`, toggle `bg-green-500`)
- **Info:** Blue (`bg-blue-50`, `border-blue-200`)
- **Neutral:** Gray (`bg-gray-50`, `text-gray-800`)

### Toggle Switch Design

- **Size:** 48px x 24px (w-12 h-6)
- **Slider:** White circle (16px x 16px)
- **Animation:** 300ms ease transition
- **States:** Gray (off) / Green (on)

---

## 🔐 Permissions & Security

### Required Permissions

1. **`storage`** - Save user settings locally
2. **`*://*.youtube.com/*`** - Access YouTube pages to modify DOM

### What the Extension CANNOT Do

- ❌ Access other websites
- ❌ Read browsing history
- ❌ Access personal data
- ❌ Make network requests (no external API calls)
- ❌ Inject ads or tracking

### What It DOES

- ✅ Hides DOM elements on YouTube pages only
- ✅ Stores 2 boolean settings locally
- ✅ Logs to browser console (debugging)

---

## 📝 Development Workflow

### Initial Setup

```bash
cd yt-shorts-remover-react
npm install
```

### Development Cycle

```bash
# 1. Start watch mode
npm run watch

# 2. Load extension in Chrome
# - Open chrome://extensions
# - Enable Developer mode
# - Load unpacked → select dist/ folder

# 3. Make changes to src/ files
# - Vite auto-rebuilds to dist/

# 4. Reload extension
# - Go to chrome://extensions
# - Click reload icon on extension card
# - Refresh YouTube page to test
```

### Production Build

```bash
npm run build
# Check dist/ folder for complete extension
```

### Distribution Package

```bash
npm run package
# Creates extension.zip for Chrome Web Store
```

---

## 🧪 Testing Checklist

### Functionality Tests

- [ ] Shorts shelves hidden on homepage
- [ ] Shorts shelves hidden on watch pages
- [ ] Homepage videos hidden when enabled
- [ ] Right sidebar suggestions hidden on watch pages
- [ ] Playlist videos NOT hidden (preserved)
- [ ] Settings persist after browser restart
- [ ] Real-time toggle updates work without page refresh
- [ ] Extension icon shows in toolbar
- [ ] Popup UI renders correctly
- [ ] Console logs appear as expected

### Page-Specific Tests

- [ ] **Homepage:** Shorts + videos removed
- [ ] **Watch page:** Shorts + suggestions removed (playlists preserved)
- [ ] **Search results:** Shorts removed (videos preserved)
- [ ] **Channel pages:** Shorts removed (regular videos preserved)

### Edge Cases

- [ ] Works with YouTube A/B test variations
- [ ] Handles slow network (late-loading content)
- [ ] No console errors on non-YouTube sites
- [ ] Popup shows current settings correctly
- [ ] MutationObserver doesn't cause performance issues

---

## 🔧 Common Modifications

### Add a New Feature Toggle

**1. Update `Settings` interface** (`content.ts` and `PopupApp.tsx`):

```typescript
interface Settings {
  removeShorts: boolean;
  removeHomepageVideos: boolean;
  newFeature: boolean; // Add this
}
```

**2. Update default settings** (`content.ts`):

```typescript
let settings: Settings = {
  removeShorts: true,
  removeHomepageVideos: true,
  newFeature: true, // Add default
};
```

**3. Add toggle in `PopupApp.tsx`**:

```tsx
<ToggleSwitch
  id="new-feature-toggle"
  label="New Feature Name"
  checked={settings.newFeature}
  onChange={handleNewFeatureToggle}
/>
```

**4. Add handler in `PopupApp.tsx`**:

```tsx
const handleNewFeatureToggle = (checked: boolean) => {
  const newSettings = { ...settings, newFeature: checked };
  setSettings(newSettings);
  chrome.storage.local.set({ newFeature: checked });
};
```

**5. Implement feature logic** in `content.ts`

---

### Update Selectors for New YouTube Layout

**1. Identify new DOM structure** (F12 → Inspect element)

**2. Add to appropriate selector array** (`content.ts`):

```typescript
const SHORTS_SELECTORS: string[] = [
  // ... existing selectors
  "new-selector-here", // Add new one
];
```

**3. Test on live YouTube**

**4. Keep old selectors** (for backward compatibility)

---

### Change Extension Icon

**1. Replace files in `public/icons/`:**

- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

**2. Rebuild:**

```bash
npm run build
```

**3. Reload extension** in Chrome

---

## 🐞 Known Issues & Limitations

### Current Limitations

1. **Manual Reload Required** - Extension doesn't auto-reload on code changes (dev limitation)
2. **YouTube DOM Dependency** - Breaks if YouTube completely restructures their HTML
3. **No Search Results Filtering** - Extension doesn't modify search results page
4. **Console Logging** - Verbose logs may clutter console (intended for debugging)

### Potential Future Issues

- YouTube's frequent DOM updates require selector maintenance
- Manifest V3 service worker restrictions (not applicable here, no background script)
- Performance impact on low-end devices (MutationObserver overhead)

---

## 📚 Additional Documentation Files

### README.md

- User-facing documentation
- Feature list and benefits
- Installation and usage instructions
- Technologies used section
- Project structure overview

### DEVELOPMENT.md

- Quick start commands
- Development workflow
- File structure guide
- Available scripts
- Testing instructions
- Distribution process

### INSTALLATION.md

- Step-by-step installation guide
- Prerequisites (Node.js, Chrome)
- Build process walkthrough
- Loading in Chrome instructions
- Troubleshooting section

---

## 🎯 Extension Behavior Summary

### On Homepage (`youtube.com/`)

- ✅ Removes Shorts shelves
- ✅ Removes all suggested video tiles (if enabled)
- ❌ Does NOT affect search or navigation

### On Watch Page (`youtube.com/watch?v=...`)

- ✅ Removes Shorts shelves
- ✅ Removes right sidebar suggestions (if enabled)
- ✅ **Preserves** playlist panel videos
- ❌ Does NOT affect current video

### On Other Pages (Search, Channel, etc.)

- ✅ Removes Shorts shelves
- ❌ Does NOT remove regular video results

---

## 🔄 State Flow Diagram

```
User Clicks Extension Icon
        ↓
PopupApp.tsx Loads
        ↓
useEffect runs → chrome.storage.local.get()
        ↓
Settings loaded into React state
        ↓
UI renders with current toggle states
        ↓
User toggles switch
        ↓
onChange handler fired
        ↓
React state updated + chrome.storage.local.set()
        ↓
chrome.storage.onChanged event fires
        ↓
content.ts listener updates settings variable
        ↓
Removal functions re-run immediately
        ↓
DOM elements hidden/shown based on new settings
```

---

## 🛠️ Dependencies Reference

### Production Dependencies

```json
"react": "^18.2.0",
"react-dom": "^18.2.0"
```

**Purpose:** UI framework for popup interface

### Dev Dependencies

```json
"@types/chrome": "^0.0.254",        // Chrome API types
"@types/node": "^20.10.0",          // Node.js types
"@types/react": "^18.2.43",         // React types
"@types/react-dom": "^18.2.17",     // ReactDOM types
"@vitejs/plugin-react": "^4.2.1",   // Vite React plugin
"autoprefixer": "^10.4.16",         // CSS vendor prefixes
"postcss": "^8.4.32",               // CSS transformation
"rimraf": "^5.0.5",                 // Cross-platform rm -rf
"tailwindcss": "^3.3.6",            // Utility CSS framework
"typescript": "^5.2.2",             // TypeScript compiler
"vite": "^5.0.8"                    // Build tool
```

---

## 🎓 Code Patterns & Best Practices

### TypeScript Patterns

- **Interfaces for data structures** (Settings, VideoInfo)
- **Type annotations on functions** (`: void`, `: boolean`)
- **Strict null checks** (`element as HTMLElement`)
- **Array typing** (`string[]`, `VideoInfo[]`)

### React Patterns

- **Functional components** with hooks
- **useState for local state** management
- **useEffect for side effects** (loading settings)
- **Props interfaces** for component typing
- **Component composition** (StatusIndicator, ToggleSwitch, InfoSection)

### Chrome Extension Patterns

- **Settings persistence** via `chrome.storage.local`
- **Real-time sync** via `storage.onChanged` listener
- **Content script isolation** (no shared variables with page)
- **MutationObserver** for dynamic content detection
- **Throttling** to optimize performance

### CSS Patterns

- **Utility-first** with Tailwind CSS
- **Custom components** in `@layer components`
- **Semantic class names** (`.toggle-switch`, `.toggle-slider`)
- **Transitions** for smooth animations

---

## 📞 Extension Metadata

- **Name:** YouTube Shorts & Video Suggestions Remover
- **Version:** 1.3.0
- **Manifest:** Version 3
- **Category:** Productivity / Content Filtering
- **Platform:** Chrome (Chromium-based browsers)
- **License:** Not specified in codebase
- **Author:** Not specified in codebase

---

## 🚀 Future Enhancement Ideas

### Potential Features

1. **Additional Filters:**

   - Remove comments section
   - Remove end screen suggestions
   - Filter by video duration

2. **UI Improvements:**

   - Dark mode support
   - More granular controls (e.g., filter by category)
   - Visual feedback when settings change

3. **Advanced Features:**

   - Whitelist specific channels
   - Custom CSS injection
   - Export/import settings

4. **Performance:**

   - Optimize selector matching
   - Reduce MutationObserver overhead
   - Lazy load removal logic

5. **Cross-Browser:**
   - Firefox support (WebExtensions API)
   - Edge/Safari compatibility

---

## ✅ Quick Command Reference

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run watch

# Production build
npm run build

# Clean build directory
npm run clean

# Create distributable ZIP
npm run package

# Development server (not typically used for extensions)
npm run dev

# Preview build (not typically used for extensions)
npm run preview
```

---

## 🔍 Troubleshooting Guide

### Extension Not Working

1. Check console for errors: F12 → Console
2. Verify settings in popup (toggles enabled?)
3. Reload extension: `chrome://extensions` → Reload
4. Refresh YouTube page
5. Check if YouTube DOM changed (selectors outdated?)

### Build Errors

1. Delete `node_modules` and `dist`
2. Run `npm install` again
3. Check Node.js version (16+)
4. Verify no TypeScript errors

### Popup Not Opening

1. Check `dist/` has `popup.html`
2. Verify `manifest.json` in `dist/`
3. Check browser console for errors
4. Try reloading extension

### Settings Not Persisting

1. Check Chrome storage quota
2. Verify `storage` permission in manifest
3. Check console for `chrome.storage` errors

---

## 🎯 End of Reference

This reference document covers the complete codebase structure, architecture, and implementation details of the YouTube Shorts & Video Suggestions Remover extension. Use it as a comprehensive guide for development, debugging, and extending the extension.

**Last Updated:** October 27, 2025  
**Document Version:** 1.0
