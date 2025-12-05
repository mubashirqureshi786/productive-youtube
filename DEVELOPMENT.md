# Development Guide

This guide covers development workflow for the React + Tailwind version of the extension.

## Quick Start

```bash
# Install dependencies
npm install

# Development build with watch mode
npm run watch

# Production build
npm run build

# Create distributable package
npm run package
```

## Development Workflow

1. **Start development mode**:

   ```bash
   npm run watch
   ```

2. **Load extension in Chrome** (first time only):

   - Open `chrome://extensions`
   - Enable Developer mode
   - Click "Load unpacked" and select the `dist/` folder

3. **Make changes** to source files in `src/`

4. **Reload extension** after changes:
   - Go to `chrome://extensions`
   - Click reload button on the extension

## File Structure

- `src/popup.tsx` - Main popup entry point
- `src/components/PopupApp.tsx` - Main popup React component
- `src/scripts/content.ts` - Content script logic
- `src/styles/index.css` - Tailwind CSS styles
- `public/manifest.json` - Extension manifest
- `vite.config.ts` - Build configuration

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run watch` - Development build with file watching
- `npm run clean` - Remove build directory
- `npm run package` - Create ZIP for distribution

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Chrome Extensions Manifest V3** - Extension platform

## Making Changes

### Popup UI Changes

Edit `src/components/PopupApp.tsx` and related components.

### Content Script Changes

Edit `src/scripts/content.ts` for YouTube page functionality.

### Styling Changes

Edit `src/styles/index.css` or modify Tailwind classes in components.

### Build Configuration

Edit `vite.config.ts` for build settings.

## Testing

Test the extension by:

1. Loading it in Chrome via developer mode
2. Visiting YouTube pages
3. Checking browser console for logs
4. Testing popup functionality

## Distribution

Create a production build and ZIP file:

```bash
npm run build
npm run package
```

This creates `extension.zip` ready for Chrome Web Store or manual distribution.
