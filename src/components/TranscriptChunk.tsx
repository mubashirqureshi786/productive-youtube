import React from "react";
import TranscriptLine from "./TranscriptLine";

interface TranscriptChunkProps {
  timestamp: string;
  start: number;
  lines: Array<{
    text: string;
    start: number;
    duration: number;
  }>;
  activeLineStart: number | null;
  isDarkMode: boolean;
  onSeek: (time: number) => void;
}

const TranscriptChunk: React.FC<TranscriptChunkProps> = ({
  timestamp,
  start,
  lines,
  activeLineStart,
  isDarkMode,
  onSeek,
}) => {
  return (
    <div>
      {/* Chunk Header (Timestamp) */}
      <button
        onClick={() => onSeek(start)}
        className={`font-bold text-sm mb-3 mt-5 px-3 py-2 rounded-md border-l-4 inline-block transition-all hover:translate-x-1 ${
          isDarkMode
            ? "text-blue-400 border-blue-500"
            : "text-blue-600 border-blue-600"
        } font-mono`}
      >
        {timestamp}
      </button>

      {/* Lines */}
      {lines.map((line, index) => (
        <TranscriptLine
          key={`${start}-${index}`}
          text={line.text}
          start={line.start}
          isActive={activeLineStart === line.start}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
};

export default TranscriptChunk;
