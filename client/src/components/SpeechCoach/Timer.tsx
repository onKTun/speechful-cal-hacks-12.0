import { useTheme } from "../../ThemeContext";

interface TimerProps {
  elapsedTime: number;
  isVisible: boolean;
}

export const Timer = ({ elapsedTime, isVisible }: TimerProps) => {
  const { isDark } = useTheme();

  if (!isVisible) return null;

  return (
    <div
      className={`absolute top-12 right-6 z-30 min-w-30 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`px-5 py-3 rounded-lg shadow-lg backdrop-blur-2xl border ${
          isDark
            ? "bg-slate-800/30 border-purple-400/20"
            : "bg-white/30 border-purple-200/30"
        }`}
      >
        <p className="text-3xl font-semibold tracking-wider text-white">
          {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, "0")}
        </p>
      </div>
    </div>
  );
};

