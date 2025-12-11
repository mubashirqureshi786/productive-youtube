import React from "react";
import { Copy, RefreshCcw } from "lucide-react";

interface TranscriptHeaderProps {
  isExpanded: boolean;
  isDarkMode: boolean;
  onToggle: () => void;
  onCopy: () => void;
  onSync: () => void;
}

const TranscriptHeader: React.FC<TranscriptHeaderProps> = ({
  isExpanded,
  isDarkMode,
  onToggle,
  onCopy,
  onSync,
}) => {
  return (
    <div
      className={`flex items-center justify-between px-6 py-5 cursor-pointer border-b ${
        isDarkMode
          ? "bg-gradient-to-r from-gray-900/80 to-black/95 border-gray-700/50"
          : "bg-gradient-to-r from-gray-50/80 to-gray-100/60 border-gray-200/60"
      }`}
      onClick={onToggle}
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
        <span
          className={`transition-transform ${isExpanded ? "" : "rotate-180"}`}
        >
          ▲
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
          title="Copy transcript"
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
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
            onSync();
          }}
          title="Scroll to current"
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
            isDarkMode
              ? "hover:bg-green-600/20 text-green-500"
              : "hover:bg-green-50 text-green-600"
          }`}
        >
          <RefreshCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default TranscriptHeader;
