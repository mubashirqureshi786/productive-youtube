# Installation Instructions - React Version

Follow these steps to install the React + Tailwind version of the YouTube Shorts & Video Suggestions Remover extension.

## Prerequisites

- Node.js (version 16 or higher) - [Download here](https://nodejs.org/)
- Google Chrome browser
- Basic familiarity with command line/terminal

## Step 1: Setup Development Environment

1. **Navigate to the React project folder**:

   ```bash
   cd yt-shorts-remover-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Step 2: Build the Extension

1. **Build for production**:

   ```bash
   npm run build
   ```

   This creates an optimized build in the `dist/` folder.

2. **Verify the build**:
   Check that the `dist/` folder contains:
   - `manifest.json`
   - `popup.html`
   - `popup.js`
   - `popup.css`
   - `content_script.js`
   - `icons/` folder

## Step 3: Install in Chrome

1. **Open Chrome Extensions page**:

   - Type `chrome://extensions` in your address bar
   - Or go to Chrome menu → More tools → Extensions

2. **Enable Developer Mode**:

   - Toggle the "Developer mode" switch in the top right corner

3. **Load the extension**:

   - Click "Load unpacked" button
   - Navigate to and select the `dist/` folder inside `yt-shorts-remover-react/`
   - Click "Select Folder"

4. **Verify installation**:
   - The extension should appear in your extensions list
   - You should see the extension icon in your Chrome toolbar

## Step 4: Test the Extension

1. **Visit YouTube**:

   - Go to [youtube.com](https://youtube.com)
   - You should notice Shorts and suggested videos are hidden

2. **Open the popup**:

   - Click the extension icon in your toolbar
   - You should see the React-powered popup with toggle switches

3. **Test the toggles**:
   - Try turning features on/off
   - Changes should take effect immediately

## Development Mode (Optional)

If you want to develop or modify the extension:

1. **Start development mode**:

   ```bash
   npm run watch
   ```

2. **Make changes** to files in `src/`

3. **Reload extension** in Chrome after changes:
   - Go to `chrome://extensions`
   - Click the reload icon on your extension

## Troubleshooting

### Build Issues

- **Node.js version**: Ensure you have Node.js 16 or higher
- **Dependencies**: Try deleting `node_modules` and running `npm install` again
- **Permissions**: Make sure you have write permissions to the project folder

### Extension Loading Issues

- **Manifest errors**: Check the console in `chrome://extensions` for error messages
- **File paths**: Ensure the `dist/` folder contains all required files
- **Browser cache**: Try reloading the extension or restarting Chrome

### Runtime Issues

- **Console logs**: Press F12 on YouTube to see extension logs
- **Permissions**: Ensure the extension has permissions for YouTube
- **Conflicts**: Disable other YouTube-related extensions temporarily

## Updating the Extension

When you make changes:

1. **Rebuild**:

   ```bash
   npm run build
   ```

2. **Reload in Chrome**:
   - Go to `chrome://extensions`
   - Click the reload icon on your extension

## Uninstalling

To remove the extension:

1. Go to `chrome://extensions`
2. Find the extension in the list
3. Click "Remove"
4. Confirm the removal

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all build files are present in `dist/`
3. Ensure you're using a supported version of Chrome
4. Try rebuilding the extension from scratch
