import React, { useState, useEffect, useRef } from "react";
import { Copy, RefreshCcw } from "lucide-react";

interface TranscriptLine {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptChunk {
  start: number;
  lines: TranscriptLine[];
}

interface TranscriptViewerProps {
  chunks: TranscriptChunk[];
  onSeek: (time: number) => void;
  isDarkMode: boolean;
  maxHeight?: string;
  onCopyTranscript?: (text: string) => void;
}

const formatTimestamp = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

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
          if (currentTime >= line.start && currentTime < line.start + line.duration) {
            setActiveLineStart(line.start);
            foundLine = true;

            // Auto-scroll if user is not manually scrolling
            if (!isUserScrolling && contentRef.current) {
              const activeElement = contentRef.current.querySelector(
                `[data-start="${line.start}"]`
              );
              if (activeElement) {
                activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
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
        const lines = contentRef.current.querySelectorAll("[data-start]");
        let closestLine: HTMLElement | null = null;
        let minDiff = Infinity;

        lines.forEach((line) => {
          const start = parseFloat((line as HTMLElement).dataset.start || "0");
          const diff = Math.abs(video.currentTime - start);
          if (diff < minDiff) {
            minDiff = diff;
            closestLine = line as HTMLElement;
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
      {/* Header */}
      <div
        className={`transcript-header flex items-center justify-between px-6 py-5 cursor-pointer border-b ${
          isDarkMode
            ? "bg-gradient-to-r from-gray-900/80 to-black/95 border-gray-700/50"
            : "bg-gradient-to-r from-gray-50/80 to-gray-100/60 border-gray-200/60"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <h2
            className={`text-base font-bold tracking-tight ${
              isDarkMode ? "text-blue-100" : "text-gray-900"
            }`}
          >
            Video Transcript
          </h2>
          <span className={`transition-transform ${isExpanded ? "" : "rotate-180"}`}>
            ▲
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            title="Copy transcript"
            className={`p-2 rounded-lg transition-all duration-300 ${
              isDarkMode
                ? "hover:bg-blue-600/20 text-blue-400"
                : "hover:bg-blue-50 text-blue-600"
            }`}
          >
            <Copy size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSync();
            }}
            title="Scroll to current"
            className={`p-2 rounded-lg transition-all duration-300 ${
              isDarkMode
                ? "hover:bg-green-600/20 text-green-500"
                : "hover:bg-green-50 text-green-600"
            }`}
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className={`transcript-content px-6 py-4 overflow-y-auto ${maxHeight}`}
          style={{ maxHeight }}
        >
          {chunks.map((chunk, chunkIndex) => (
            <div key={chunkIndex}>
              {/* Chunk Header (Timestamp) */}
              <button
                onClick={() => onSeek(chunk.start)}
                className={`transcript-chunk-header font-bold text-sm mb-3 mt-5 px-3 py-2 rounded-md border-l-4 inline-block transition-all ${
                  isDarkMode
                    ? "text-blue-400 border-blue-500 hover:translate-x-1"
                    : "text-blue-600 border-blue-600 hover:translate-x-1"
                } font-mono`}
              >
                {formatTimestamp(chunk.start)}
              </button>

              {/* Lines */}
              {chunk.lines.map((line, lineIndex) => (
                <div
                  key={`${chunkIndex}-${lineIndex}`}
                  data-start={line.start}
                  data-active={activeLineStart === line.start}
                  className={`transcript-line mb-2 p-3 rounded-md transition-all duration-300 ${
                    activeLineStart === line.start
                      ? isDarkMode
                        ? "bg-blue-900/30 border-l-4 border-blue-500"
                        : "bg-blue-100/50 border-l-4 border-blue-500"
                      : isDarkMode
                      ? "hover:bg-gray-700/30"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`transcript-text text-sm leading-relaxed font-medium transition-colors ${
                      activeLineStart === line.start
                        ? isDarkMode
                          ? "text-blue-300"
                          : "text-blue-700"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-900"
                    }`}
                  >
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranscriptViewer;
