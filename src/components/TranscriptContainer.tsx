/**
 * TranscriptContainer Component
 * Manages transcript fetching and display
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import TranscriptViewer from "./TranscriptViewer";
import {
  useSettings,
  useDarkMode,
  useVideoElement,
  usePageNavigation,
} from "../hooks";
import { fetchTranscript } from "../services/transcript";
import type { TranscriptEntry, TranscriptChunk } from "../types";

export function TranscriptContainer() {
  const { settings } = useSettings();
  const isDarkMode = useDarkMode();
  const video = useVideoElement();
  const { pathname, videoId } = usePageNavigation();

  const [chunks, setChunks] = useState<TranscriptChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // Find or create container in YouTube's sidebar
  useEffect(() => {
    if (!settings?.showTranscript || pathname !== "/watch") {
      return;
    }

    const findContainer = () => {
      // Try to find YouTube's secondary sidebar
      let secondary = document.querySelector("#secondary") as HTMLElement;

      if (!secondary) {
        secondary = document.querySelector(
          "ytd-watch-next-secondary-results-renderer"
        ) as HTMLElement;
      }

      if (secondary) {
        let transcriptDiv = document.getElementById(
          "productive-transcript-container"
        );
        if (!transcriptDiv) {
          transcriptDiv = document.createElement("div");
          transcriptDiv.id = "productive-transcript-container";
          secondary.prepend(transcriptDiv);
        }
        setContainer(transcriptDiv);
      }
    };

    findContainer();

    // Keep trying until we find it
    const interval = setInterval(findContainer, 500);

    return () => clearInterval(interval);
  }, [settings?.showTranscript, pathname, videoId]);

  // Fetch transcript
  useEffect(() => {
    if (!settings?.showTranscript || pathname !== "/watch" || !videoId) {
      setChunks([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetchTranscript()
      .then((transcript) => {
        const chunkedData = chunkTranscript(transcript);
        setChunks(chunkedData);
      })
      .catch((err) => {
        console.error("Transcript error:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [settings?.showTranscript, videoId, pathname]);

  const handleSeek = (time: number) => {
    if (video) {
      video.currentTime = time;
    }
  };

  const handleCopy = (text: string) => {
    console.log("Transcript copied:", text.substring(0, 50) + "...");
  };

  if (!settings?.showTranscript || pathname !== "/watch" || !container) {
    return null;
  }

  const content = (() => {
    if (loading) {
      return (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading transcript...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center text-red-500">
          <p>Failed to load transcript</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (chunks.length === 0) {
      return null;
    }

    return (
      <TranscriptViewer
        chunks={chunks}
        onSeek={handleSeek}
        isDarkMode={isDarkMode}
        maxHeight={
          settings.removeWatchPageSuggestions ? "calc(100vh - 180px)" : "24rem"
        }
        onCopyTranscript={handleCopy}
      />
    );
  })();

  return createPortal(content, container);
}

/**
 * Convert flat transcript to 25-second chunks
 */
function chunkTranscript(transcript: TranscriptEntry[]): TranscriptChunk[] {
  const CHUNK_SIZE = 25; // seconds
  const chunks: TranscriptChunk[] = [];
  let currentChunk: TranscriptChunk | null = null;

  transcript.forEach((entry, index) => {
    const chunkStart = Math.floor(entry.start / CHUNK_SIZE) * CHUNK_SIZE;

    const nextStart =
      index < transcript.length - 1
        ? transcript[index + 1].start
        : entry.start + 2;
    const duration = nextStart - entry.start;

    const line = {
      text: entry.text,
      start: entry.start,
      duration,
    };

    if (!currentChunk || currentChunk.start !== chunkStart) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = {
        start: chunkStart,
        lines: [line],
      };
    } else {
      currentChunk.lines.push(line);
    }
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
