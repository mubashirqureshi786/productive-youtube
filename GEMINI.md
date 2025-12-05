# Gemini Reference: YouTube Shorts & Video Suggestions Remover

This document is a reference for me, Gemini, to understand and work with this codebase.

## 1. Project Overview

This is a Chrome browser extension that removes YouTube Shorts, homepage videos, and video suggestions from YouTube. It's built with React, TypeScript, and Tailwind CSS.

## 2. Tech Stack

-   **Frontend**: React 18, TypeScript, Tailwind CSS
-   **Build Tool**: Vite
-   **Platform**: Chrome Extension (Manifest V3)

## 3. Project Structure

```
/
├── src/
│   ├── components/
│   │   └── PopupApp.tsx      # Main popup React component
│   ├── scripts/
│   │   └── content.ts        # Core logic to remove YouTube elements
│   ├── popup.html            # Popup entry point
│   └── popup.tsx             # React entry point for popup
├── public/
│   └── manifest.json         # Chrome extension manifest
├── dist/                     # Build output
├── package.json              # Dependencies and scripts
└── vite.config.ts            # Vite configuration
```

## 4. Key Files

-   `src/scripts/content.ts`: This is the most important file. It contains the core logic for removing elements from YouTube pages. It uses a `MutationObserver` to watch for DOM changes and removes elements based on a set of selectors.
-   `src/components/PopupApp.tsx`: This is the main React component for the extension's popup. It allows users to toggle the different features on and off.
-   `public/manifest.json`: This file defines the extension's permissions, content scripts, and other settings.
-   `vite.config.ts`: This file configures the Vite build process.
-   `package.json`: This file lists the project's dependencies and defines the build scripts.

## 5. Development Workflow

-   **Install dependencies**: `npm install`
-   **Build for development**: `npm run watch` (This will watch for file changes and automatically rebuild the extension.)
-   **Load the extension in Chrome**:
    1.  Open `chrome://extensions`.
    2.  Enable "Developer mode".
    3.  Click "Load unpacked" and select the `dist` directory.
-   **Create a production build**: `npm run build`
-   **Package for distribution**: `npm run package` (This will create a `extension.zip` file.)

## 6. Core Logic (content.ts)

The `content.ts` script works as follows:

1.  **Load Settings**: It loads the user's settings from `chrome.storage.local`.
2.  **Identify Page Type**: It determines whether the current page is the homepage, a watch page, or another type of page.
3.  **Remove Elements**: It removes Shorts, homepage videos, and video suggestions based on the user's settings and the page type.
4.  **Observe DOM Changes**: It uses a `MutationObserver` to watch for changes to the DOM. When new nodes are added, it re-runs the removal logic.
5.  **Listen for Settings Changes**: It listens for changes to the user's settings in `chrome.storage` and updates the page accordingly.

## 7. How to Add a New Feature

1.  **Update `Settings` interface** in `content.ts` and `PopupApp.tsx`.
2.  **Update default settings** in `content.ts`.
3.  **Add a new toggle switch** to `PopupApp.tsx`.
4.  **Add a new handler function** in `PopupApp.tsx` to update the settings in `chrome.storage`.
5.  **Implement the new feature's logic** in `content.ts`.
