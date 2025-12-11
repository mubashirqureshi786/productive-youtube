/**
 * ContentApp Component
 * Main entry point for content script React app
 */

import { ContentBlocker } from "./ContentBlocker";
import { TranscriptContainer } from "./TranscriptContainer";

export function ContentApp() {
  return (
    <>
      {/* Non-visual component that blocks unwanted content */}
      <ContentBlocker />

      {/* Transcript viewer (only shows on watch pages) */}
      <TranscriptContainer />
    </>
  );
}
