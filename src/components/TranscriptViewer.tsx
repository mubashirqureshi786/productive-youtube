import React, { useState, useEffect, useRef } from "react";
import TranscriptHeader from "./TranscriptHeader";
import TranscriptChunk from "./TranscriptChunk";
import { formatTimestamp } from "../utils/helpers";
import type { TranscriptChunk as TranscriptChunkType } from "../types";

interface TranscriptViewerProps {
  chunks: TranscriptChunkType[];
  onSeek: (time: number) => void;
  isDarkMode: boolean;
  maxHeight?: string;
  onCopyTranscript?: (text: string) => void;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  chunks,
  onSeek,
  isDarkMode,
  maxHeight = "24rem",
  onCopyTranscript,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeLineStart, setActiveLineStart] = useState<number | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const video = document.querySelector("video") as HTMLVideoElement;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      let foundLine = false;

      for (const chunk of chunks) {
        for (const line of chunk.lines) {
          if (
            currentTime >= line.start &&
            currentTime < line.start + line.duration
          ) {
            setActiveLineStart(line.start);
            foundLine = true;

            // Auto-scroll if user is not manually scrolling
            if (!isUserScrolling && contentRef.current) {
              const activeElement = contentRef.current.querySelector(
                `[data-start="${line.start}"]`
              );
              if (activeElement) {
                activeElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }
            break;
          }
        }
        if (foundLine) break;
      }

      if (!foundLine) {
        setActiveLineStart(null);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [chunks, isUserScrolling]);

  const handleScroll = () => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsUserScrolling(false);
    }, 3000);
  };

  const handleCopy = async () => {
    const transcriptText = chunks
      .map((chunk) => {
        const chunkTimestamp = formatTimestamp(chunk.start);
        const chunkText = chunk.lines.map((line) => line.text).join(" ");
        return `[${chunkTimestamp}] ${chunkText}`;
      })
      .join("\n\n");

    await navigator.clipboard.writeText(transcriptText);
    onCopyTranscript?.(transcriptText);
  };

  const handleSync = () => {
    const video = document.querySelector("video") as HTMLVideoElement;
    if (video && contentRef.current) {
      const activeLine = contentRef.current.querySelector(
        "[data-active='true']"
      );
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // Find closest line
        const lines =
          contentRef.current.querySelectorAll<HTMLElement>("[data-start]");
        let closestLine: HTMLElement | null = null;
        let minDiff = Infinity;

        lines.forEach((line) => {
          const start = parseFloat(line.dataset.start || "0");
          const diff = Math.abs(video.currentTime - start);
          if (diff < minDiff) {
            minDiff = diff;
            closestLine = line;
          }
        });

        if (closestLine) {
          closestLine.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  return (
    <div
      className={`transcript-container rounded-xl overflow-hidden backdrop-blur-2xl border ${
        isDarkMode
          ? "bg-black/95 border-gray-700/60 shadow-2xl shadow-black/50"
          : "bg-white/95 border-gray-200/80 shadow-xl shadow-black/12"
      }`}
    >
      <TranscriptHeader
        isExpanded={isExpanded}
        isDarkMode={isDarkMode}
        onToggle={() => setIsExpanded(!isExpanded)}
        onCopy={handleCopy}
        onSync={handleSync}
      />

      {isExpanded && (
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="transcript-content px-6 py-4 overflow-y-auto"
          style={{ maxHeight }}
        >
          {chunks.map((chunk, index) => (
            <TranscriptChunk
              key={index}
              timestamp={formatTimestamp(chunk.start)}
              start={chunk.start}
              lines={chunk.lines}
              activeLineStart={activeLineStart}
              isDarkMode={isDarkMode}
              onSeek={onSeek}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TranscriptViewer;
