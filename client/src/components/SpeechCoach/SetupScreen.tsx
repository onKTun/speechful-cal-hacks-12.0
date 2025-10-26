import { Play } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import type { Mode, Difficulty } from "../../types";

interface SetupScreenProps {
  transcript: string;
  mode: Mode | "";
  difficulty: Difficulty;
  onTranscriptChange: (value: string) => void;
  onModeChange: (value: Mode) => void;
  onDifficultyChange: (value: Difficulty) => void;
  onStart: () => void;
}

export const SetupScreen = ({
  transcript,
  mode,
  difficulty,
  onTranscriptChange,
  onModeChange,
  onDifficultyChange,
  onStart,
}: SetupScreenProps) => {
  const { isDark } = useTheme();

  return (
    <div
      className="relative z-10 min-h-screen flex items-center justify-center p-6 transition-opacity duration-500 opacity-100"
    >
      <div className="max-w-2xl w-full space-y-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1
            className={`text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-linear-to-r ${
              isDark
                ? "from-pink-300 via-purple-300 to-blue-300"
                : "from-pink-400 via-purple-400 to-blue-400"
            } mb-4`}
          >
            Speech Coach
          </h1>
          <p
            className={`text-lg ${
              isDark ? "text-purple-300" : "text-purple-600"
            } font-light`}
          >
            Practice your presentation with AI-powered guidance
          </p>
        </div>

        {/* Transcript Input */}
        <div className="relative">
          <label
            className={`block text-sm font-semibold mb-3 text-left ${
              isDark ? "text-purple-300" : "text-purple-700"
            }`}
          >
            Your Transcript
          </label>
          <textarea
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder="Paste your speech transcript here..."
            className={`w-full h-48 px-6 py-4 rounded-2xl backdrop-blur-xl border text-left resize-none focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-slate-800/40 border-purple-400/30 text-purple-100 placeholder-purple-400 focus:ring-purple-300"
                : "bg-white/60 border-purple-200 text-purple-900 placeholder-purple-400 focus:ring-purple-400"
            }`}
          />
        </div>

        {/* Mode Selection */}
        <div>
          <label
            className={`block text-sm font-semibold mb-3 text-left ${
              isDark ? "text-purple-300" : "text-purple-700"
            }`}
          >
            Select Mode
          </label>
          <div className="flex gap-4">
            {(["rehearsal", "learning"] as Mode[]).map((modeOption) => (
              <label key={modeOption} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value={modeOption}
                  checked={mode === modeOption}
                  onChange={(e) => onModeChange(e.target.value as Mode)}
                  className="sr-only"
                />
                <div
                  className={`px-6 py-4 rounded-xl text-center font-semibold transition-all duration-300 ease-in-out backdrop-blur-xl border-2 ${
                    mode === modeOption
                      ? isDark
                        ? "bg-purple-500/40 border-purple-300 text-purple-100 shadow-lg"
                        : "bg-purple-300/60 border-purple-400 text-purple-900 shadow-lg"
                      : isDark
                      ? "bg-slate-800/30 border-purple-400/20 text-purple-300 hover:bg-slate-800/50"
                      : "bg-white/40 border-purple-200 text-purple-600 hover:bg-white/60"
                  }`}
                >
                  {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
                </div>
              </label>
            ))}
          </div>
          <p
            className={`text-xs mt-2 text-left transition-all duration-300 ease-in-out ${
              isDark ? "text-purple-300" : "text-purple-500"
            }`}
          >
            {mode === "rehearsal" &&
              "• Full transcript available immediately for practice"}
            {mode === "learning" &&
              "• Practice with gradual transcript reveals based on difficulty"}
          </p>
        </div>

        {/* Difficulty Selection - Only show when mode is learning */}
        <div
          className={`transition-all duration-1000 ease-in overflow-hidden ${
            mode === "learning" ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`mt-8 transition-all duration-700 ease-out transform ${
              mode === "learning"
                ? "translate-y-0 opacity-100 delay-150"
                : "translate-y-4 opacity-0"
            }`}
          >
            <label
              className={`block text-sm font-semibold mb-3 text-left ${
                isDark ? "text-purple-300" : "text-purple-700"
              }`}
            >
              Difficulty Level
            </label>
            <div className="flex gap-4">
              {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                <label key={level} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
                    className="sr-only"
                  />
                  <div
                    className={`px-6 py-4 rounded-xl text-center font-semibold transition-all backdrop-blur-xl border-2 ${
                      difficulty === level
                        ? isDark
                          ? "bg-purple-500/40 border-purple-300 text-purple-100 shadow-lg"
                          : "bg-purple-300/60 border-purple-400 text-purple-900 shadow-lg"
                        : isDark
                        ? "bg-slate-800/30 border-purple-400/20 text-purple-300 hover:bg-slate-800/50"
                        : "bg-white/40 border-purple-200 text-purple-600 hover:bg-white/60"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </div>
                </label>
              ))}
            </div>
            <p
              className={`text-xs mt-2 text-left ${
                isDark ? "text-purple-300" : "text-purple-500"
              }`}
            >
              {difficulty === "easy" &&
                "• Transcript shows after 5 seconds (100% visible)"}
              {difficulty === "medium" &&
                "• Transcript shows after 15 seconds (50% visible)"}
              {difficulty === "hard" &&
                "• Transcript shows after 30 seconds (25% visible)"}
            </p>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onStart}
            disabled={!transcript.trim() || !mode}
            className={`group w-full sm:w-auto px-16 py-5 rounded-2xl bg-linear-to-r ${
              isDark
                ? "from-pink-400 via-purple-400 to-blue-400 text-slate-900 shadow-purple-400/30 hover:shadow-xl hover:shadow-purple-400/40"
                : "from-pink-300 via-purple-300 to-blue-300 text-purple-900 shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/60"
            } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300`}
          >
            <span className="flex items-center gap-3">
              <Play className="w-6 h-6" />
              Start Session
            </span>
          </button>
        </div>
        {(!transcript.trim() || !mode) && (
          <p
            className={`text-center text-sm ${
              isDark ? "text-purple-400" : "text-purple-500"
            }`}
          >
            {!transcript.trim() && "Please enter a transcript to begin"}
            {transcript.trim() && !mode && "Please select a mode to begin"}
          </p>
        )}
      </div>
    </div>
  );
};

