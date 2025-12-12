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
  console.log("Document ready state:", document.readyState);
  console.log("Body exists:", !!document.body);

  // Mount immediately - YouTube is usually ready by run_at: document_end
  const rootId = "productive-youtube-root";
  let root = document.getElementById(rootId);

  if (!root) {
    root = document.createElement("div");
    root.id = rootId;
    document.body.appendChild(root);
    console.log("Created root element");
  }

  // Mount React app (only once)
  if (!reactRoot) {
    try {
      reactRoot = ReactDOM.createRoot(root);
      reactRoot.render(
        <React.StrictMode>
          <ContentApp />
        </React.StrictMode>
      );
      console.log("Productive YouTube: React app mounted successfully");
    } catch (error) {
      console.error("Productive YouTube: Failed to mount React app:", error);
    }
  } else {
    console.log("Productive YouTube: React app already mounted");
  }
}

// Initialize immediately since run_at is document_end
initializeExtension();

// Also reinitialize on YouTube's SPA navigation
window.addEventListener("yt-navigate-finish", () => {
  console.log("Productive YouTube: Page navigation detected");
  if (!reactRoot) {
    initializeExtension();
  }
});
