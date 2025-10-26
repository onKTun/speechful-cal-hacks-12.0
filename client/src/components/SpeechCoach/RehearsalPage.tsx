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
import { Timer } from "./Timer";
import { Controls } from "./Controls";
import { SuggestionDisplay } from "./SuggestionDisplay";
import { FeedbackScreen } from "./FeedbackScreen";
import RehearsalCapture from "../../RehearsalCapture";
import { SentimentDisplay } from "./SentimentDisplay";
import { VisualSuggestion } from "./VisualSuggestion";

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
  const [showFeedback, setShowFeedback] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
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

  // Cleanup video URL on unmount
  useEffect(() => {
    return () => {
      if (videoURL) {
        URL.revokeObjectURL(videoURL);
      }
    };
  }, [videoURL]);

  const startRecording = () => {
    if (!webcamRef.current) {
      console.error("Webcam ref not available");
      return;
    }
    
    if (!webcamRef.current.stream) {
      console.error("Webcam stream not available");
      return;
    }
    
    try {
      console.log("Starting recording with stream:", webcamRef.current.stream);
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm",
      });
      
      mediaRecorderRef.current.addEventListener("dataavailable", (event: BlobEvent) => {
        if (event.data.size > 0) {
          console.log("Recording chunk received:", event.data.size, "bytes");
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      });
      
      // Request data every 1000ms (1 second) to ensure chunks are captured
      mediaRecorderRef.current.start(1000);
      console.log("Recording started with 1s timeslice");
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve();
        return;
      }
      
      try {
        // Listen for the stop event to know when recording is complete
        mediaRecorderRef.current.addEventListener("stop", () => {
          resolve();
        }, { once: true });
        
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("Error stopping recording:", err);
        resolve();
      }
    });
  };

  const handleStart = () => {
    setIsStarted(true);
    setIsPaused(false);
    setElapsedTime(0);
    setShowTranscript(false);
    setCurrentWordIndex(0);
    setEnableHighlighting(false);
    setRecordedChunks([]);
    setVideoURL("");
    setShowFeedback(false);
    
    // Retry logic to ensure webcam stream is ready before recording
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 200; // 200ms between retries
    
    const tryStartRecording = () => {
      if (webcamRef.current?.stream) {
        console.log("Webcam stream ready, starting recording");
        startRecording();
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Webcam stream not ready yet, retry ${retryCount}/${maxRetries}`);
        setTimeout(tryStartRecording, retryInterval);
      } else {
        console.error("Failed to start recording: webcam stream not available after retries");
      }
    };
    
    // Start trying after a brief initial delay
    setTimeout(tryStartRecording, 100);
  };

  const handleStop = async () => {
    console.log("=== STOPPING SESSION ===");
    console.log("Current sentiment data count:", visualSentiment.dataCount);
    console.log("Current visual ratings:", visualSentiment.visualRuntimeRatings);
    
    // Stop recording first
    await stopRecording();
    
    // Stop the session - this also stops AI sentiment calls
    setIsStarted(false);
    setIsPaused(false);
    
    // Wait a brief moment for final chunks to be processed, then show feedback
    setTimeout(() => {
      setRecordedChunks((chunks) => {
        console.log("Processing recorded chunks:", chunks.length, "chunks");
        if (chunks.length > 0) {
          // Create video URL from recorded chunks
          const blob = new Blob(chunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          console.log("Video URL created:", url);
          setVideoURL(url);
          setShowFeedback(true);
        } else {
          // If no chunks recorded (edge case), still show feedback with a placeholder
          console.warn("No video chunks recorded - showing feedback without video");
          setShowFeedback(true);
        }
        return chunks;
      });
    }, 100);
  };

  const handleReset = () => {
    setIsStarted(false);
    setIsPaused(false);
    setElapsedTime(0);
    setShowTranscript(false);
    setCurrentWordIndex(0);
    setShowFeedback(false);
    
    // Reset visual sentiment data
    visualSentiment.reset();
    
    // Clean up video URL to prevent memory leaks
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }
    setVideoURL("");
    setRecordedChunks([]);
    
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        // Already stopped
      }
    }
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  // Show feedback screen after session ends
  if (showFeedback) {
    return (
      <FeedbackScreen
        videoURL={videoURL}
        visualRuntimeRatings={visualSentiment.visualRuntimeRatings}
        dataCount={visualSentiment.dataCount}
        onReset={handleReset}
      />
    );
  }

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

        {/* Sentiment Display 
        <SentimentDisplay sentiment={sentiment} isVisible={isStarted} /> */}

        {/* Visual Suggestion Display */}
        <VisualSuggestion suggestion={visualSentiment.suggestion} isVisible={isStarted} />

        {/* Suggestion Display */}
        <SuggestionDisplay suggestion={visualSentiment.suggestion} isVisible={isStarted}/>

        {/* Emoji Overlay based on Sentiment */}
        <EmojiOverlay sentiment={visualSentiment.sentiment.toString()} isVisible={isStarted} />

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

