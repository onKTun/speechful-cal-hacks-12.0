import { Play, Pause, X, Highlighter } from "lucide-react";
import { Link } from "react-router-dom";

interface ControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onStop: () => void;
  enableHighlighting?: boolean;
  onToggleHighlighting?: () => void;
}

export const Controls = ({ 
  isPaused, 
  onTogglePause, 
  onStop,
  enableHighlighting = false,
  onToggleHighlighting
}: ControlsProps) => {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-30">
      {/* Highlight Toggle Button */}
      {onToggleHighlighting && (
        <button
          onClick={onToggleHighlighting}
          className={`p-5 rounded-lg backdrop-blur-md border border-white/20 shadow-lg hover:scale-110 transition-all ${
            enableHighlighting 
              ? "bg-yellow-400/20 hover:bg-yellow-400/30" 
              : "bg-white/10 hover:bg-white/20"
          }`}
          title={enableHighlighting ? "Disable highlighting" : "Enable highlighting"}
        >
          <Highlighter className={`w-7 h-7 ${enableHighlighting ? "text-yellow-400" : "text-white"}`} />
        </button>
      )}

      {/* Pause Button */}
      <button
        onClick={onTogglePause}
        className="p-5 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 shadow-lg hover:scale-110 transition-all hover:bg-white/20"
      >
        {isPaused ? (
          <Play className="w-7 h-7 text-white" />
        ) : (
          <Pause className="w-7 h-7 text-white" />
        )}
      </button>

      {/* Stop/X Button */}
      <Link to="/webcam">
        <button
          onClick={onStop}
          className="p-5 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 shadow-lg hover:scale-110 transition-all hover:bg-white/20"
        >
          <X className="w-7 h-7 text-white hover:text-red-400" />
        </button>
      </Link>
    </div>
  );
};

