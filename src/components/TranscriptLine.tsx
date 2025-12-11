import React from "react";

interface TranscriptLineProps {
  text: string;
  start: number;
  isActive: boolean;
  isDarkMode: boolean;
}

const TranscriptLine: React.FC<TranscriptLineProps> = ({
  text,
  start,
  isActive,
  isDarkMode,
}) => {
  return (
    <div
      data-start={start}
      data-active={isActive}
      className={`mb-2 p-3 rounded-md transition-all duration-300 ${
        isActive
          ? isDarkMode
            ? "bg-blue-900/30 border-l-4 border-blue-500"
            : "bg-blue-100/50 border-l-4 border-blue-500"
          : isDarkMode
          ? "hover:bg-gray-700/30"
          : "hover:bg-gray-100"
      }`}
    >
      <span
        className={`text-sm leading-relaxed font-medium transition-colors select-text ${
          isActive
            ? isDarkMode
              ? "text-blue-300"
              : "text-blue-700"
            : isDarkMode
            ? "text-gray-300"
            : "text-gray-900"
        }`}
      >
        {text}
      </span>
    </div>
  );
};

export default TranscriptLine;
