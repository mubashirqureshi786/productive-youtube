#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const contentPath = path.join(distDir, 'content.js');
const contentScriptPath = path.join(distDir, 'content_script.js');

// First, rename content.js to content_script.js
if (fs.existsSync(contentPath)) {
  fs.renameSync(contentPath, contentScriptPath);
  console.log('✓ Renamed content.js to content_script.js');
}

// Read the content script
let contentScript = fs.readFileSync(contentScriptPath, 'utf-8');

// Find all chunk files
const chunksDir = path.join(distDir, 'chunks');
const chunkFiles = [];

if (fs.existsSync(chunksDir)) {
  const chunks = fs.readdirSync(chunksDir);
  chunks.forEach(f => {
    if (f.endsWith('.js')) {
      chunkFiles.push(f);
    }
  });
}

console.log('Found chunk files:', chunkFiles);

// Read all chunks and concatenate them
let allChunks = '';
chunkFiles.forEach(chunkFile => {
  const chunkPath = path.join(chunksDir, chunkFile);
  const chunkContent = fs.readFileSync(chunkPath, 'utf-8');
  allChunks += chunkContent + '\n';
  console.log(`✓ Loaded chunk: ${chunkFile}`);
});

// Combine chunks and content script
let finalScript = allChunks + '\n' + contentScript;

// Remove all import/export statements (ES module syntax) to make it compatible with content scripts
finalScript = finalScript.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?/g, '');
finalScript = finalScript.replace(/import\s+[\w\s,{}]*\s+from\s*['"][^'"]*['"];?/g, '');
finalScript = finalScript.replace(/export\s*\{[^}]*\};?/g, '');
finalScript = finalScript.replace(/export\s+(default\s+)?/g, '');
finalScript = finalScript.replace(/export\s*\*\s*from\s*['"][^'"]*['"];?/g, '');

console.log('✓ Removed ES module syntax (import/export statements)');

// Fix duplicate variable declarations by renaming variables in the app code (not React chunks)
// The React chunk comes first, then our app code, so we rename in our app code only

// Split into chunk part and app part
const chunkEnd = finalScript.lastIndexOf('const SETTINGS_DEFAULTS_CONFIG');
if (chunkEnd === -1) {
  console.warn('Could not find split point between chunks and app code');
} else {
  const chunksPart = finalScript.substring(0, chunkEnd);
  const appPart = finalScript.substring(chunkEnd);
  
  // In the app part only, rename conflicting top-level const declarations
  // Find the settings variable first
  const settingsPattern = /const\s+([A-Z])\s*=\s*\{removeShorts:!0,removeShortsButton:!0,removeHomepageVideos:!0,removeWatchPageSuggestions:!0,showTranscript:!1\}/;
  const settingsMatch = appPart.match(settingsPattern);
  
  let fixedAppPart = appPart;
  
  if (settingsMatch) {
    const oldVarName = settingsMatch[1];
    console.log(`Found settings variable: ${oldVarName}, renaming to SETTINGS_DEFAULTS_CONFIG`);
    
    // Replace the settings declaration
    fixedAppPart = fixedAppPart.replace(settingsPattern, 'const SETTINGS_DEFAULTS_CONFIG={removeShorts:!0,removeShortsButton:!0,removeHomepageVideos:!0,removeWatchPageSuggestions:!0,showTranscript:!1}');
    
    // Replace in function q() and D()
    fixedAppPart = fixedAppPart.replace(`const t=Object.keys(${oldVarName})`, 'const t=Object.keys(SETTINGS_DEFAULTS_CONFIG)');
    fixedAppPart = fixedAppPart.replace(`const o={...${oldVarName}}`, 'const o={...SETTINGS_DEFAULTS_CONFIG}');
    fixedAppPart = fixedAppPart.replace(`s in ${oldVarName}&&`, 's in SETTINGS_DEFAULTS_CONFIG&&');
    
    console.log('✓ Fixed settings variable declarations');
  }
  
  // Now rename other conflicting const declarations in app part
  // S, E, C, T are selector arrays - rename them to be more descriptive
  fixedAppPart = fixedAppPart.replace(/^const S=\[/m, 'const SHORTS_SELECTORS=[');
  fixedAppPart = fixedAppPart.replace(/\bf\(S,/g, 'f(SHORTS_SELECTORS,');
  fixedAppPart = fixedAppPart.replace(/\bp\(S,/g, 'p(SHORTS_SELECTORS,');
  
  fixedAppPart = fixedAppPart.replace(/^const E=\[/m, 'const SHORTS_BUTTON_SELECTORS=[');
  fixedAppPart = fixedAppPart.replace(/\bf\(E,/g, 'f(SHORTS_BUTTON_SELECTORS,');
  fixedAppPart = fixedAppPart.replace(/\bp\(E,/g, 'p(SHORTS_BUTTON_SELECTORS,');
  
  fixedAppPart = fixedAppPart.replace(/^const C=\[/m, 'const SUGGESTIONS_SELECTORS=[');
  fixedAppPart = fixedAppPart.replace(/\bf\(C,/g, 'f(SUGGESTIONS_SELECTORS,');
  fixedAppPart = fixedAppPart.replace(/\bp\(C,/g, 'p(SUGGESTIONS_SELECTORS,');
  
  fixedAppPart = fixedAppPart.replace(/^const T=\[/m, 'const HOMEPAGE_VIDEO_SELECTORS=[');
  fixedAppPart = fixedAppPart.replace(/\bf\(T,/g, 'f(HOMEPAGE_VIDEO_SELECTORS,');
  fixedAppPart = fixedAppPart.replace(/\bp\(T,/g, 'p(HOMEPAGE_VIDEO_SELECTORS,');
  
  console.log('✓ Renamed selector arrays to avoid conflicts');
  
  finalScript = chunksPart + fixedAppPart;
}

// Write back
fs.writeFileSync(contentScriptPath, finalScript, 'utf-8');
console.log('✓ Bundled all chunks into content_script.js');

// Update manifest to only load content_script.js (no chunks separately)
const manifestPath = path.join(distDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

manifest.content_scripts[0].js = ['content_script.js'];
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log('✓ Updated manifest.json - content_script.js is now self-contained');

// Update web_accessible_resources to include chunks if needed (they might be referenced elsewhere)
if (manifest.web_accessible_resources && manifest.web_accessible_resources[0]) {
  manifest.web_accessible_resources[0].resources = [
    'popup.js',
    'popup.css',
    'content_script.js',
    ...chunkFiles.map(f => 'chunks/' + f)
  ];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('✓ Updated web_accessible_resources');
}

console.log('✓ Build post-processing complete');
