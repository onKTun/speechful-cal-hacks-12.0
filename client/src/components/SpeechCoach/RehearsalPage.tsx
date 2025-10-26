// temp, tentatively alive
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Webcam from "react-webcam";
import { Home } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useVisualSentiment } from "../../hooks/useVisualSentiment";
import { SetupScreen } from "./SetupScreen";
import { SessionScreen } from "./SessionScreen";
import { EmojiOverlay } from "./EmojiOverlay";
import { VisualSuggestion } from "./VisualSuggestion";
import { Timer } from "./Timer";
import { Controls } from "./Controls";
import RehearsalCapture from "../../RehearsalCapture";

const RehearsalPage = () => {
  const { isDark } = useTheme();
  const [transcript, setTranscript] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [enableHighlighting, setEnableHighlighting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const intervalRef = useRef<number | null>(null);

  // Use custom hook for visual sentiment capture with suggestions
  const visualSentiment = useVisualSentiment(webcamRef, isStarted, isPaused);

  // Auto-advance word highlighting when enabled and session is running
  useEffect(() => {
    if (isStarted && !isPaused && enableHighlighting && showTranscript) {
      const words = transcript.split(" ").filter((word) => word.trim().length > 0);
      const wordInterval = setInterval(() => {
        setCurrentWordIndex((prev) => {
          // Reset if we've reached the end
          if (prev >= words.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      }, 500); // Advance every 500ms

      return () => clearInterval(wordInterval);
    }
  }, [isStarted, isPaused, enableHighlighting, showTranscript, transcript]);

  // Handle timer and transcript visibility - in rehearsal mode, show immediately
  useEffect(() => {
    if (isStarted && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          // In rehearsal mode, show transcript immediately
          setShowTranscript(true);
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStarted, isPaused]);

  const handleStart = () => {
    setIsStarted(true);
    setIsPaused(false);
    setElapsedTime(0);
    setShowTranscript(false);
    setCurrentWordIndex(0);
    setEnableHighlighting(false);
  };

  const handleStop = () => {
    setIsStarted(false);
    setIsPaused(false);
    setElapsedTime(0);
    setShowTranscript(false);
    setCurrentWordIndex(0);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-slate-900" : "bg-pink-50"
      } transition-colors duration-500`}
    >
      {/* Back to Free Session Selection Button - Only visible on setup screen */}
      {!isStarted && (
        <div className="fixed top-6 right-6 z-50">
          <Link
            to="/webcam"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all backdrop-blur-xl border-2 cursor-pointer ${
              isDark
                ? "bg-slate-800/40 border-purple-400/30 text-purple-100 hover:bg-slate-800/60 hover:border-purple-400/50"
                : "bg-white/60 border-purple-200 text-purple-900 hover:bg-white/80 hover:border-purple-400"
            } hover:scale-105`}
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Back to Mode Selection</span>
          </Link>
        </div>
      )}
      
      <div className="relative min-h-screen overflow-hidden pt-0">
        {/* Webcam Display */}
        <RehearsalCapture isStarted={isStarted} isHovered={isHovered} webcamRef={webcamRef} />

        {/* Setup Screen */}
        {!isStarted && (
          <SetupScreen
            transcript={transcript}
            mode="rehearsal"
            difficulty={difficulty}
            onTranscriptChange={setTranscript}
            onModeChange={() => {}} // Mode is fixed to rehearsal
            onDifficultyChange={setDifficulty}
            onStart={handleStart}
            hideModeSelection={true}
            onButtonHover={() => setIsHovered(true)}
            onButtonUnhover={() => setIsHovered(false)}
          />
        )}

        {/* Session Screen */}
        {isStarted && (
          <SessionScreen
            transcript={transcript}
            mode="rehearsal"
            difficulty={difficulty}
            showTranscript={showTranscript}
            currentWordIndex={currentWordIndex}
            enableHighlighting={enableHighlighting}
          />
        )}

        {/* Emoji Overlay based on Sentiment */}
        <EmojiOverlay sentiment={visualSentiment.sentiment.toString()} isVisible={isStarted} />

        {/* Visual Suggestion Display */}
        <VisualSuggestion suggestion={visualSentiment.suggestion} isVisible={isStarted} />

        {/* Timer Display */}
        <Timer elapsedTime={elapsedTime} isVisible={isStarted} />

        {/* Control Buttons */}
        {isStarted && (
          <Controls
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
            onStop={handleStop}
            enableHighlighting={enableHighlighting}
            onToggleHighlighting={() => setEnableHighlighting(!enableHighlighting)}
          />
        )}
      </div>
    </div>
  );
};

export default RehearsalPage;

