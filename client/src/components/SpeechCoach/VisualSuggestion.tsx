// temp, tentatively alive
import React from "react";
import { useTheme } from "../../ThemeContext";

interface VisualSuggestionProps {
  suggestion: string;
  isVisible: boolean;
}

export const VisualSuggestion: React.FC<VisualSuggestionProps> = ({
  suggestion,
  isVisible,
}) => {
  const { isDark } = useTheme();

  if (!isVisible || !suggestion) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
      <div
        className={`px-6 py-3 rounded-xl backdrop-blur-xl border-2 shadow-lg transition-all duration-300 ${
          isDark
            ? "bg-slate-800/60 border-purple-400/40 text-purple-100"
            : "bg-white/70 border-purple-300 text-purple-900"
        }`}
      >
        <p className="text-lg font-semibold text-center">{suggestion}</p>
      </div>
    </div>
  );
};

