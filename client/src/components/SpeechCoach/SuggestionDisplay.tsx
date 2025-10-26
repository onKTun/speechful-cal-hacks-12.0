import { useTheme } from "../../ThemeContext";

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
      className={`absolute bottom-40 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-500 px-6 md:px-12 ${
        isVisible && suggestion ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`px-6 py-3 rounded-xl shadow-lg ${
          isDark
            ? "bg-slate-800/50 backdrop-blur-xl border-purple-400/30"
            : "bg-white/50 backdrop-blur-xl border-purple-200"
        }`}
      >
        <p
          className={`text-4xl font-medium ${
            isDark ? "text-purple-300" : "text-purple-600"
          }`}
        >
          <span className="font-bold">{suggestion}</span>
        </p>
      </div>
    </div>
  );

  
};

