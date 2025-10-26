import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Webcam from "react-webcam";
import { Home } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { WebcamDisplay } from "./WebcamDisplay";
import { SetupScreen } from "./SetupScreen";
import { SessionScreen } from "./SessionScreen";
import { Timer } from "./Timer";
import { Controls } from "./Controls";
import { Caption } from "./Captions";
import { processTranscript, compareTextAccuracy } from "../../learning/utils/processTranscript";

const LearningPage = () => {
  const { isDark } = useTheme();
  const [transcript, setTranscript] = useState<string>("");
  const [slicedTranscript, setSlicedTranscript] = useState<string[]>([""]); //processed version of the transcript
  const [transcrptionOutput, setTranscriptionOutput] = useState<string[]>([""]) //transcription output is always processed
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
  const webSocket = useRef<WebSocket | undefined>(undefined)

  const threshold = 0.80
 
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
      microphone.current = undefined;
    }
    else{
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
    }
    
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
        const output = processTranscript(data.channel.alternatives[0].transcript, 1) 
        setTranscriptionOutput(output)
      }
    });

    socket.addEventListener("close", () => {
      console.log("client: disconnected from server");
    });
  }, [])
  // Track user location in transcript
  useEffect(() => {
    const trackTranscriptLocation = (transcription: string[]) => {
      // Better validation
      if (!transcription || transcription.length === 0 || transcription.every(word => !word.trim())) {
        return;
      }

      // Prevent index out of bounds
      if (slicedTranscript.length === 0) {
        return;
      }

      // Use dynamic window size based on transcription length
      const windowSize = Math.max(transcription.length, 5);
      const lookBehind = Math.min(8, Math.floor(windowSize / 2));
      const lookAhead = Math.min(5, Math.ceil(windowSize / 2));

      // Ensure indices are valid
      const safeCurrentIndex = Math.max(0, Math.min(currentWordIndex, slicedTranscript.length - 1));

      // Build comparison windows with safe bounds
      const windows = [
        {
          name: "current",
          start: safeCurrentIndex,
          end: Math.min(slicedTranscript.length, safeCurrentIndex + transcription.length)
        },
        {
          name: "behind",
          start: Math.max(0, safeCurrentIndex - lookBehind),
          end: Math.min(slicedTranscript.length, safeCurrentIndex + transcription.length - lookBehind)
        },
        {
          name: "ahead",
          start: safeCurrentIndex,
          end: Math.min(slicedTranscript.length, safeCurrentIndex + transcription.length + lookAhead)
        },
        {
          name: "centered",
          start: Math.max(0, safeCurrentIndex - Math.floor(transcription.length / 2)),
          end: Math.min(slicedTranscript.length, safeCurrentIndex + Math.ceil(transcription.length / 2))
        }
      ];

      // Calculate scores for each window
      const scores = windows.map(window => {
        const words = slicedTranscript.slice(window.start, window.end);
        return {
          ...window,
          score: compareTextAccuracy(transcription.join(' '), words.join(' '))
        };
      });

      const maxScore = scores.reduce((max, curr) => curr.score > max.score ? curr : max, scores[0]);
      console.log(`Best match: ${maxScore.name}, score=${maxScore.score.toFixed(2)}, start=${maxScore.start}, end=${maxScore.end}`);

      // Lower threshold or provide fallback behavior
      if (maxScore.score >= threshold) {
        // Fine-tune position using last few words
        const wordsToCheck = Math.min(3, transcrptionOutput.length);
        if (wordsToCheck === 0) return;

        const lastWords = transcrptionOutput.slice(-wordsToCheck);
        let maxSimilarity = 0;
        let bestIndex = maxScore.end;

        // Ensure we have enough words in the window
        const searchEnd = Math.max(maxScore.start + wordsToCheck, maxScore.end);

        for (let i = maxScore.start; i <= searchEnd - wordsToCheck; i++) {
          const wordWindow = slicedTranscript.slice(i, i + wordsToCheck);
          const similarity = compareTextAccuracy(
            lastWords.join(' '),
            wordWindow.join(' ')
          );
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestIndex = i + wordsToCheck;
          }
        }

        setCurrentWordIndex(Math.min(bestIndex, slicedTranscript.length - 1));
      } else {
        // Gentler fallback: only advance occasionally and slowly
        // Use a counter to advance every N failed attempts instead of every time
        const advanceFrequency = 5; // Only advance every 5 failed attempts
        const advanceAmount = 1; // Move forward by just 1 word

        // You'll need to add this to your component state
        // For now, we'll just log and do nothing (most conservative approach)
        console.log(`Score below threshold (${maxScore.score.toFixed(2)}), holding position`);

        // Alternative: Very slow advancement (uncomment if you want some movement)
         if (Math.random() < 0.2) { // 20% chance to advance
             setCurrentWordIndex(prev => Math.min(prev + advanceAmount, slicedTranscript.length - 1));
         }
      }
    }

    trackTranscriptLocation(transcrptionOutput)
  }, [transcrptionOutput])
  // Auto-advance word highlighting when enabled and session is running
  /*
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
  */
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
      className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-pink-50"
        } transition-colors duration-500`}
    >
      {/* Back to Free Session Selection Button - Only visible on setup screen */}
      {!isStarted && (
        <div className="fixed top-6 right-6 z-50">
          <Link
            to="/webcam"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all backdrop-blur-xl border-2 cursor-pointer ${isDark
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
            onTranscriptChange={(text)=>{
              setTranscript(text)
              setSlicedTranscript(processTranscript(text))
            }}
            onModeChange={() => { }} // Mode is fixed to learning
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

        {/* Caption Display */}
        <Caption text={"Transcription: " + transcrptionOutput.join(" ")} isVisible={isStarted}></Caption>

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

