 import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Webcam from "react-webcam";
import { Home } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useSentimentCapture } from "../../hooks/useSentimentCapture";
import { WebcamDisplay } from "./WebcamDisplay";
import { SetupScreen } from "./SetupScreen";
import { SessionScreen } from "./SessionScreen";
import { SentimentDisplay } from "./SentimentDisplay";
import { Timer } from "./Timer";
import { Controls } from "./Controls";

const LearningPage = () => {
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
  const microphone = useRef<MediaRecorder | undefined>(undefined)
  const intervalRef = useRef<number | null>(null);
  const webSocket = useRef<WebSocket|undefined>(undefined)

  const getMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return new MediaRecorder(stream, { mimeType: "audio/webm" });
    } catch (error) {
      console.error("error accessing microphone:", error);
      throw error;
    }
  }
  const openMicrophone = async (microphone: MediaRecorder, socket: WebSocket) => {
    return new Promise((resolve: any) => {
      microphone.onstart = () => {
        console.log("client: microphone opened");
        document.body.classList.add("recording");
        resolve();
      };

      microphone.onstop = () => {
        console.log("client: microphone closed");
        document.body.classList.remove("recording");
      };

      microphone.ondataavailable = (event: any) => {
        console.log("client: microphone data received");
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      microphone.start(1000);
    });
  }
  const closeMicrophone = async (microphone: MediaRecorder) => {
    microphone.stop();
  }

  const handleStart = async () => {
    if (!microphone.current) {
      try {
        microphone.current = await getMicrophone();

      } catch (error) {
        console.error("error getting microphone:", error);
      }
    }
    if (microphone.current && webSocket.current) {
      await openMicrophone(microphone.current, webSocket.current);
    }
    setIsStarted(true);
    setIsPaused(false);
    setElapsedTime(0);
    setShowTranscript(false);
    setCurrentWordIndex(0);
    setEnableHighlighting(false);
  };
  const handleStop = async () => {
    if (microphone.current) {
      await closeMicrophone(microphone.current);
    }
    microphone.current = undefined;
    setIsStarted(false);
    setIsPaused(false);
    setElapsedTime(0);
    setShowTranscript(false);
    setCurrentWordIndex(0);
  };
  const handleTogglePause = async () => {
    if (microphone.current) {
      await closeMicrophone(microphone.current);
    }
    microphone.current = undefined;
    setIsPaused(!isPaused);
  };


  // Handle connection to websocket and microphone access
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    webSocket.current = socket

    //once the websocket is open, this function is called to get microphone access
    const configureMic = async () => {
      console.log("client: waiting to open microphone");
      if (!microphone.current) {
        try {
          microphone.current = await getMicrophone();

        } catch (error) {
          console.error("error getting microphone:", error);
        }
      }

    }

    socket.addEventListener("open", async () => {
      console.log("client: connected to server");
      await configureMic();
    });

    //listener for recieving 
    socket.addEventListener("message", (event) => {
      if (event.data === "") {
        return;
      }

      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        return;
      }

      //this handles where the transcript data is going!
      if (data && data.channel && data.channel.alternatives[0].transcript !== "") {
        //setOutput(data.channel.alternatives[0].transcript)
      }
    });

    socket.addEventListener("close", () => {
      console.log("client: disconnected from server");
    });
  }, [])
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
  // Handle timer and transcript visibility - learning mode uses difficulty-based delays
  useEffect(() => {
    if (isStarted && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          // In learning mode, use difficulty-based delays
          const delays: { [key: string]: number } = {
            easy: 5,
            medium: 15,
            hard: 30,
          };
          if (newTime >= delays[difficulty]) {
            setShowTranscript(true);
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
  }, [isStarted, isPaused, difficulty]);


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
        <WebcamDisplay webcamRef={webcamRef} isStarted={isStarted} isHovered={isHovered} />

        {/* Setup Screen */}
        {!isStarted && (
          <SetupScreen
            transcript={transcript}
            mode="learning"
            difficulty={difficulty}
            onTranscriptChange={setTranscript}
            onModeChange={() => {}} // Mode is fixed to learning
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
            mode="learning"
            difficulty={difficulty}
            showTranscript={showTranscript}
            currentWordIndex={currentWordIndex}
            enableHighlighting={enableHighlighting}
          />
        )}

        {/* Sentiment Display
        <SentimentDisplay sentiment={sentiment} isVisible={isStarted} /> */}



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

export default LearningPage;

