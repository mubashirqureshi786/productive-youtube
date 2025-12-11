# Transcript Refactoring Guide

## Overview

The transcript display functionality has been refactored into a **React component** (`TranscriptViewer.tsx`) for better maintainability, readability, and easier future updates.

## Architecture

### Before (Original `displayTranscript()` function)

- **Location**: `src/scripts/content.ts` (lines 893-1712)
- **Total Lines**: 820 lines of imperative DOM manipulation
- **Issues**:
  - Manual `createElement()` calls everywhere
  - CSS inline styles embedded in strings
  - Complex state management with flags and timeouts
  - Difficult to maintain and debug
  - Hard to reuse or test

### After (React Component)

- **Location**: `src/components/TranscriptViewer.tsx`
- **Size**: 200+ lines of clean, declarative JSX
- **Benefits**:
  - Proper React hooks for state management (`useState`, `useRef`, `useEffect`)
  - CSS managed via Tailwind classes (not inline strings)
  - Clear separation of concerns
  - Easy to test and extend
  - Reusable across the application

## Component Props

```typescript
interface TranscriptViewerProps {
  chunks: TranscriptChunk[]; // Array of transcript chunks
  onSeek: (time: number) => void; // Callback when user clicks timestamp
  isDarkMode: boolean; // Current theme state
  maxHeight?: string; // Custom max height (default: "24rem")
  onCopyTranscript?: (text: string) => void; // Optional copy callback
}
```

## How to Use the React Component

### Step 1: Import the component in your JavaScript/TypeScript file

```typescript
import TranscriptViewer from "./components/TranscriptViewer";
import React from "react";
import ReactDOM from "react-dom/client";

// Or in a content script:
import TranscriptViewer from "../../components/TranscriptViewer";
```

### Step 2: Parse transcript data into the correct format

```typescript
interface TranscriptLine {
  text: string;
  start: number; // Start time in seconds
  duration: number; // Duration in seconds
}

interface TranscriptChunk {
  start: number; // Chunk start time (in 25-second intervals)
  lines: TranscriptLine[];
}

// Example data format:
const chunks: TranscriptChunk[] = [
  {
    start: 0,
    lines: [
      { text: "Hello everyone", start: 0, duration: 2 },
      { text: "Welcome to the video", start: 2, duration: 2.5 },
    ],
  },
  {
    start: 25,
    lines: [{ text: "Today we'll cover...", start: 25, duration: 3 }],
  },
];
```

### Step 3: Render the component

**Option A: In a React app**

```typescript
const root = ReactDOM.createRoot(
  document.getElementById("transcript-container")
);
root.render(
  <TranscriptViewer
    chunks={chunks}
    onSeek={(time) => {
      const video = document.querySelector("video") as HTMLVideoElement;
      if (video) video.currentTime = time;
    }}
    isDarkMode={isYouTubeDarkMode()}
    maxHeight="calc(100vh - 180px)"
    onCopyTranscript={(text) => {
      console.log("Transcript copied:", text);
    }}
  />
);
```

**Option B: In a content script (with ReactDOM)**

```typescript
// Create container if it doesn't exist
let container = document.getElementById("transcript-root");
if (!container) {
  container = document.createElement("div");
  container.id = "transcript-root";
  document.body.appendChild(container);
}

// Render component
const root = ReactDOM.createRoot(container);
root.render(
  <TranscriptViewer
    chunks={chunkedTranscript}
    onSeek={(time) => {
      const video = document.querySelector("video");
      if (video) video.currentTime = time;
    }}
    isDarkMode={isYouTubeDarkMode()}
  />
);
```

## Key Features

### 1. **Expand/Collapse**

- Click the header to toggle transcript visibility
- Arrow indicator shows current state

### 2. **Copy Button**

- Copies full transcript to clipboard
- Format: `[HH:MM:SS] Full chunk text...`
- Icon changes to checkmark on success

### 3. **Sync Button**

- Scrolls to the currently playing line
- Useful for refocusing on the active timestamp

### 4. **Auto-Scroll**

- Automatically scrolls to current line as video plays
- Respects user manual scrolling (3-second timeout)
- Smooth scroll behavior

### 5. **Active Line Highlighting**

- Current playing line highlighted with background color
- Thick left border in accent color
- Text color changes to match theme

### 6. **Dark/Light Mode**

- Full support for YouTube's dark mode
- Tailwind classes automatically switch
- No manual theme switching logic needed

## Styling

All styles use **Tailwind CSS classes** instead of inline styles:

```typescript
// Example of clean styling:
<div className={`rounded-xl overflow-hidden backdrop-blur-2xl border ${
  isDarkMode
    ? "bg-black/95 border-gray-700/60 shadow-2xl shadow-black/50"
    : "bg-white/95 border-gray-200/80 shadow-xl shadow-black/12"
}`}>
```

### Color Scheme

**Light Mode**:

- Background: `bg-white/95`
- Text: `text-gray-900`
- Accents: `text-blue-600`, `text-green-600`

**Dark Mode**:

- Background: `bg-black/95`
- Text: `text-gray-300`
- Accents: `text-blue-400`, `text-green-500`

## State Management

The component uses React hooks for clean state management:

```typescript
const [isExpanded, setIsExpanded] = useState(true); // Expand/collapse
const [activeLineStart, setActiveLineStart] = useState(null); // Current playing line
const [isUserScrolling, setIsUserScrolling] = useState(false); // User scroll flag
```

No need for external state management libraries!

## Comparing with Original Function

### Original (VanillaJS)

```typescript
function displayTranscript(transcript) {
  // 820 lines of:
  const copyButton = document.createElement("button");
  copyButton.className = "transcript-copy-button";
  copyButton.style.cssText = `
    color: #3b82f6;
    padding: 0.5rem;
    border-radius: 6px;
    ...
  `;
  copyButton.onclick = (e) => {
    // Complex logic here
  };
  headerButtons.appendChild(copyButton);
  // ... repeated 50+ times
}
```

### New React Component

```typescript
<button
  onClick={(e) => {
    e.stopPropagation();
    handleCopy();
  }}
  title="Copy transcript"
  className={`p-2 rounded-lg transition-all duration-300 ${
    isDarkMode
      ? "hover:bg-blue-600/20 text-blue-400"
      : "hover:bg-blue-50 text-blue-600"
  }`}
>
  <Copy size={20} />
</button>
```

**Advantages:**

- ✅ Much cleaner and more readable
- ✅ No inline style strings
- ✅ Proper TypeScript support
- ✅ Easy to understand intent
- ✅ Reusable handlers

## Migration Steps (If Converting Old Code)

1. **Extract transcript data** into the proper format
2. **Calculate chunks** (25-second intervals)
3. **Pass to component** with required props
4. **Remove old DOM manipulation** code
5. **Test in both light and dark modes**

## Future Enhancements

The React component makes it easy to add:

- 🔍 Search/filter functionality
- 📍 Bookmark specific timestamps
- 💾 Save transcript to file
- 🔤 Adjustable font sizes
- ⏱️ Timestamp margin adjustments
- 🎨 Custom theme colors

## TypeScript Support

Full TypeScript support included:

```typescript
import TranscriptViewer, {
  TranscriptViewerProps,
  TranscriptChunk,
  TranscriptLine,
} from "./components/TranscriptViewer";

// Type-safe props
const props: TranscriptViewerProps = {
  chunks: [],
  onSeek: () => {},
  isDarkMode: true,
};
```

## Performance

- **Efficient rendering**: Only updates when props change
- **No memory leaks**: Proper cleanup in useEffect
- **Smooth scrolling**: Uses native `scrollIntoView` API
- **Minimal re-renders**: useState updates are optimized

## Troubleshooting

### Component not showing?

- Ensure container element exists in DOM
- Check `chunks` array is not empty
- Verify `isDarkMode` prop is correct

### Styling looks wrong?

- Verify Tailwind CSS is loaded in project
- Check browser DevTools for CSS conflicts
- Ensure no !important overrides in content.ts styles

### Auto-scroll not working?

- Verify video element exists: `document.querySelector("video")`
- Check `onSeek` callback is setting `video.currentTime`
- Ensure chunk data has correct `start` and `duration` values

## Files Modified/Created

```
src/
├── components/
│   └── TranscriptViewer.tsx       (NEW - 200+ lines, React component)
├── scripts/
│   └── content.ts                 (MODIFIED - kept for legacy DOM management)
└── styles/
    └── index.css                  (Existing Tailwind styles)
```

## Next Steps

1. **Test the component** in a content script
2. **Gradually migrate** old DOM code to React
3. **Remove old `displayTranscript()` function** once fully migrated
4. **Add more React components** for other UI features
5. **Build a cohesive React architecture** for the extension

---

**Questions?** Check the component props or refer to the usage examples above!
