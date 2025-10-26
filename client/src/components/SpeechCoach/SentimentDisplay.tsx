import { useTheme } from "../../ThemeContext";

interface SentimentDisplayProps {
  sentiment: string;
  isVisible: boolean;
}

export const SentimentDisplay = ({ sentiment, isVisible }: SentimentDisplayProps) => {
  const { isDark } = useTheme();

  if (!isVisible || !sentiment) return null;

  return (
    <div
      className={`absolute bottom-24 left-1/2 -translate-x-1/2 transition-opacity duration-500 px-6 md:px-12 ${
        isVisible && sentiment ? "opacity-100" : "opacity-0 pointer-events-none"
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
          className={`text-sm font-medium ${
            isDark ? "text-purple-300" : "text-purple-600"
          }`}
        >
          Sentiment: <span className="font-bold">{sentiment}</span>
        </p>
      </div>
    </div>
  );
};

