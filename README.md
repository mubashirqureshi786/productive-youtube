# YouTube Shorts & Video Suggestions Remover - React Version

This is a React + TypeScript + Tailwind CSS version of the YouTube Shorts & Video Suggestions Remover browser extension.

## Features

- **Modern React UI**: Clean, responsive popup interface built with React and Tailwind CSS
- **TypeScript Support**: Full type safety and better development experience
- **Toggle Controls**: Easy-to-use switches to enable/disable features
- **Remove YouTube Shorts**: Hide Shorts shelves from YouTube pages
- **Remove Homepage Videos**: Hide all suggested videos from the YouTube homepage
- **Remove Video Suggestions**: Hide suggested videos from the right sidebar on watch pages
- **Real-time Settings**: Changes take effect immediately without page reload

## Development Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the React project directory:

   ```bash
   cd yt-shorts-remover-react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands

- **Development build with watch mode**:

  ```bash
  npm run watch
  ```

- **Production build**:

  ```bash
  npm run build
  ```

- **Clean build directory**:

  ```bash
  npm run clean
  ```

- **Create extension package**:
  ```bash
  npm run package
  ```

### Building the Extension

1. Run the build command:

   ```bash
   npm run build
   ```

2. The built extension will be in the `dist/` folder

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Project Structure

```
yt-shorts-remover-react/
├── src/
│   ├── components/
│   │   └── PopupApp.tsx          # Main popup React component
│   ├── scripts/
│   │   └── content.ts            # Content script (TypeScript)
│   ├── styles/
│   │   └── index.css             # Tailwind CSS styles
│   ├── popup.html                # Popup HTML template
│   └── popup.tsx                 # Popup entry point
├── public/
│   ├── manifest.json             # Extension manifest
│   └── icons/                    # Extension icons
├── dist/                         # Built extension (created after build)
├── package.json
├── vite.config.ts               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md
```

## Technologies Used

- **React 18**: For building the popup UI
- **TypeScript**: For type safety and better development experience
- **Tailwind CSS**: For modern, responsive styling
- **Vite**: For fast development and optimized builds
- **Chrome Extension Manifest V3**: Latest extension platform

## Key Differences from Original

1. **Modern Build System**: Uses Vite instead of plain HTML/JS
2. **Component-Based UI**: React components with proper state management
3. **Type Safety**: Full TypeScript support with proper type definitions
4. **Modern CSS**: Tailwind CSS for consistent, maintainable styling
5. **Hot Reload**: Development server with fast refresh during development

## Configuration

The extension uses the same configuration system as the original:

- Settings are stored in Chrome's local storage
- Changes are applied in real-time
- All selectors and logic remain the same for compatibility

## Building for Production

The production build optimizes the code for size and performance:

- Minified JavaScript and CSS
- Tree-shaking to remove unused code
- Optimized React production build
- Proper source maps for debugging

## Extension Loading

After building, load the extension from the `dist/` folder in Chrome's extension management page with developer mode enabled.
