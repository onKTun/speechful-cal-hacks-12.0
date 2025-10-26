import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Webcam from "react-webcam";
import { Home } from "lucide-react";
import "./tailwind.css";
import { useTheme } from "./ThemeContext";
import { useSentimentCapture } from "./hooks/useSentimentCapture";
import { WebcamDisplay } from "./components/SpeechCoach/WebcamDisplay";
import { SetupScreen } from "./components/SpeechCoach/SetupScreen";
import { SessionScreen } from "./components/SpeechCoach/SessionScreen";
import { SentimentDisplay } from "./components/SpeechCoach/SentimentDisplay";
import { Timer } from "./components/SpeechCoach/Timer";
import { Controls } from "./components/SpeechCoach/Controls";
import type { Mode, Difficulty } from "./types";
import { SuggestionDisplay } from "./components/SpeechCoach/SuggestionDisplay";

const SpeechCoach = () => {
  const { isDark } = useTheme();
  const [transcript, setTranscript] = useState("");
  const [mode, setMode] = useState<Mode | "">("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [enableHighlighting, setEnableHighlighting] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const intervalRef = useRef<number | null>(null);

  // Use custom hook for sentiment capture
  const { sentiment, suggestion }= useSentimentCapture(webcamRef, isStarted, isPaused);

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

  // Handle timer and transcript visibility
  useEffect(() => {
    if (isStarted && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          // In rehearsal mode, show transcript immediately
          if (mode === "rehearsal") {
            setShowTranscript(true);
          } else {
            // In learning mode, use difficulty-based delays
            const delays: { [key: string]: number } = {
              easy: 5,
              medium: 15,
              hard: 30,
            };
            if (newTime >= delays[difficulty]) {
              setShowTranscript(true);
            }
          }
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
  }, [isStarted, isPaused, difficulty, mode]);

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
      {/* Back to Home Button - Only visible on splash page */}
      {!isStarted && (
        <div className="fixed top-6 right-6 z-50">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all backdrop-blur-xl border-2 cursor-pointer ${
              isDark
                ? "bg-slate-800/40 border-purple-400/30 text-purple-100 hover:bg-slate-800/60 hover:border-purple-400/50"
                : "bg-white/60 border-purple-200 text-purple-900 hover:bg-white/80 hover:border-purple-400"
            } hover:scale-105`}
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
        </div>
      )}
      
      <div className="relative min-h-screen overflow-hidden pt-0">
        {/* Webcam Display */}
        <WebcamDisplay webcamRef={webcamRef} isStarted={isStarted} />

        {/* Setup Screen */}
        {!isStarted && (
          <SetupScreen
            transcript={transcript}
            mode={mode}
            difficulty={difficulty}
            onTranscriptChange={setTranscript}
            onModeChange={setMode}
            onDifficultyChange={setDifficulty}
            onStart={handleStart}
          />
        )}

        {/* Session Screen */}
        {isStarted && mode && (
          <SessionScreen
            transcript={transcript}
            mode={mode as Mode}
            difficulty={difficulty}
            showTranscript={showTranscript}
            currentWordIndex={currentWordIndex}
            enableHighlighting={enableHighlighting}
          />
        )}

        {/* Sentiment Display
        <SentimentDisplay sentiment={sentiment} isVisible={isStarted} /> */}

        {/* Suggestion Display */}
        <SuggestionDisplay suggestion={suggestion} isVisible={isStarted}/>

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

export default SpeechCoach;
