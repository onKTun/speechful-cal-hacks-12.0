import { useTheme } from "../../ThemeContext";
import { Lightbulb } from "lucide-react";

interface SuggestionDisplayProps {
  suggestion: string;
  isVisible: boolean;
}

export const SuggestionDisplay = ({ suggestion, isVisible }: SuggestionDisplayProps) => {
  const { isDark } = useTheme();

  if (!isVisible || !suggestion) return null;

  console.log("adding suggestion");

  return (
    <div
      className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 px-6 md:px-12 ${
        isVisible && suggestion 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div
        className={`relative px-8 py-4 rounded-2xl backdrop-blur-xl border-2 shadow-xl transition-all duration-300 hover:scale-[1.02] ${
          isDark
            ? "bg-slate-800/40 border-purple-400/40 shadow-purple-400/30 hover:shadow-purple-400/50 hover:border-purple-400/60"
            : "bg-white/50 border-purple-300 shadow-purple-300/40 hover:shadow-purple-400/60 hover:border-purple-400"
        }`}
      >

        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`shrink-0 p-2 rounded-lg ${
            isDark 
              ? "bg-purple-400/20 text-purple-300" 
              : "bg-purple-200/50 text-purple-600"
          }`}>
            <Lightbulb className="w-6 h-6" />
          </div>

          {/* Suggestion Text */}
          <div className="flex-1">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
              isDark ? "text-purple-300/70" : "text-purple-500/70"
            }`}>
              Coaching Tip
            </p>
            <p
              className={`text-lg md:text-2xl font-semibold leading-tight ${
                isDark ? "text-purple-100" : "text-purple-900"
              }`}
            >
              {suggestion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  
};

