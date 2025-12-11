/**
 * Content Script Entry Point
 * Initializes React app in YouTube page
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { ContentApp } from "./components/ContentApp";
import "./styles/index.css";

let reactRoot: ReactDOM.Root | null = null;

// Wait for DOM and YouTube to be ready
function initializeExtension() {
  console.log("Productive YouTube: Initializing...");

  // Wait a bit for YouTube to fully load
  setTimeout(() => {
    const rootId = "productive-youtube-root";
    let root = document.getElementById(rootId);

    if (!root) {
      root = document.createElement("div");
      root.id = rootId;
      document.body.appendChild(root);
    }

    // Mount React app (only once)
    if (!reactRoot) {
      reactRoot = ReactDOM.createRoot(root);
      reactRoot.render(
        <React.StrictMode>
          <ContentApp />
        </React.StrictMode>
      );
      console.log("Productive YouTube: React app mounted");
    }
  }, 1000); // Give YouTube time to initialize
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeExtension);
} else {
  initializeExtension();
}

// Also reinitialize on YouTube's SPA navigation
window.addEventListener("yt-navigate-finish", () => {
  if (!reactRoot) {
    initializeExtension();
  }
});
