/**
 * Content Script Entry Point
 * Initializes React app in YouTube page
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { ContentApp } from "./components/ContentApp";
import "./styles/index.css";

// Wait for DOM to be ready
function initializeExtension() {
  console.log("Productive YouTube: Initializing...");

  // Create root container for React app
  const rootId = "productive-youtube-root";
  let root = document.getElementById(rootId);

  if (!root) {
    root = document.createElement("div");
    root.id = rootId;
    root.style.cssText = "position: relative; z-index: 9999;";
    document.body.appendChild(root);
  }

  // Mount React app
  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(
    <React.StrictMode>
      <ContentApp />
    </React.StrictMode>
  );

  console.log("Productive YouTube: Initialized successfully");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeExtension);
} else {
  initializeExtension();
}
