import { useState, useEffect, useRef } from "react";
import { Play, Pause, X, Home } from "lucide-react";
import Webcam from "react-webcam";
import { Link } from "react-router-dom";
import "./tailwind.css";
import { useTheme } from "./ThemeContext";

const SpeechCoach = () => {
  const { isDark } = useTheme();
  const [transcript, setTranscript] = useState("");
  const [mode, setMode] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [sentiment, setSentiment] = useState("");
  const webcamRef = useRef<Webcam>(null);
  const intervalRef = useRef<number | null>(null);
  const sentimentIntervalRef = useRef<number | null>(null);

  // Capture sentiment analysis
  const capture = async () => {
    if (!webcamRef.current) return;

    const image = webcamRef.current.getScreenshot();
    if (!image) return;

    console.log("Image preview:", image.substring(0, 50));

    try {
      const response = await fetch("http://localhost:3000/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: image }),
      });
      const data = await response.json();
      setSentiment(data.result);
    } catch (err) {
      console.error("Sentiment analysis error:", err);
    }
  };

  // Start sentiment capture interval when session starts
  useEffect(() => {
    if (isStarted && !isPaused) {
      sentimentIntervalRef.current = setInterval(capture, 5000);
    } else {
      if (sentimentIntervalRef.current) {
        clearInterval(sentimentIntervalRef.current);
      }
    }
    return () => {
      if (sentimentIntervalRef.current) {
        clearInterval(sentimentIntervalRef.current);
      }
    };
  }, [isStarted, isPaused]);

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
    setSentiment("");
  };

  const handleStop = () => {
    setIsStarted(false);
    setIsPaused(false);
    setElapsedTime(0);
    setShowTranscript(false);
    setSentiment("");
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const getTranscriptOpacity = () => {
    if (!showTranscript) return 0;
    // In rehearsal mode, always show full opacity
    if (mode === "rehearsal") return 1;
    const opacities: { [key: string]: number } = {
      easy: 1,
      medium: 0.7,
      hard: 0.4,
    };
    return opacities[difficulty];
  };

  const getTranscriptAmount = () => {
    if (!showTranscript) return "";
    const words = transcript.split(" ");
    // In rehearsal mode, show all words
    if (mode === "rehearsal") return transcript;
    const amounts: { [key: string]: number } = {
      easy: 1,
      medium: 0.5,
      hard: 0.25,
    };
    const showCount = Math.ceil(words.length * amounts[difficulty]);
    return words.slice(0, showCount).join(" ");
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-slate-900" : "bg-pink-50"
      } transition-colors duration-500`}
    >
      {/* Navigation */}
      
      {/* Back to Home Button - Only visible on splash page */}
      {!isStarted && (
        <div className="fixed top-6 right-6 z-50">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all backdrop-blur-xl border-2 ${
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
        {/* Webcam - Full Screen */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isStarted ? "opacity-100" : "opacity-0"
          }`}
        >
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/webp"
            className="w-full h-full object-cover"
            videoConstraints={{
              facingMode: "user",
            }}
          />
        </div>

        {/* Pastel Overlay when not started */}
        {!isStarted && (
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${isDark ? "bg-slate-900" : "bg-pink-50"}`}
          >
            {/* Decorative Blobs */}
            <div
              className={`absolute top-[10%] right-[15%] w-96 h-96 md:w-[500px] md:h-[500px] ${
                isDark ? "bg-pink-400/20" : "bg-pink-300/40"
              } rounded-full blur-3xl`}
            ></div>
            <div
              className={`absolute bottom-[10%] left-[10%] w-[500px] h-[500px] md:w-[600px] md:h-[600px] ${
                isDark ? "bg-purple-400/25" : "bg-purple-300/50"
              } rounded-full blur-3xl`}
            ></div>
            <div
              className={`absolute top-[40%] left-[50%] w-80 h-80 md:w-[400px] md:h-[400px] ${
                isDark ? "bg-blue-400/20" : "bg-blue-300/40"
              } rounded-full blur-3xl`}
            ></div>
          </div>
        )}

        {/* Main Content - Setup Screen */}
        {!isStarted && (
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
                  onChange={(e) => setTranscript(e.target.value)}
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
                  {["rehearsal", "learning"].map((modeOption) => (
                    <label key={modeOption} className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="mode"
                        value={modeOption}
                        checked={mode === modeOption}
                        onChange={(e) => setMode(e.target.value)}
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
                  mode === "learning"
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className={`mt-8 transition-all duration-700 ease-out transform ${
                  mode === "learning"
                    ? "translate-y-0 opacity-100 delay-150"
                    : "translate-y-4 opacity-0"
                }`}>
                  <label
                    className={`block text-sm font-semibold mb-3 text-left ${
                      isDark ? "text-purple-300" : "text-purple-700"
                    }`}
                  >
                    Difficulty Level
                  </label>
                  <div className="flex gap-4">
                    {["easy", "medium", "hard"].map((level) => (
                      <label key={level} className="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="difficulty"
                          value={level}
                          checked={difficulty === level}
                          onChange={(e) => setDifficulty(e.target.value)}
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
                  onClick={handleStart}
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
        )}

        {/* Session Screen - Transcript Display */}
        {isStarted && (
          <div
            className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-500 ease-in-out opacity-100`}
          >
            {/* Rehearsal Mode - Centered at Top */}
            {mode === "rehearsal" && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6">
                <div
                  className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6`}
                  style={{ opacity: getTranscriptOpacity() }}
                >
                  <div className="text-white text-2xl leading-relaxed line-clamp-2 text-center">
                    {getTranscriptAmount() || (
                      <span className="text-white/60">
                        Transcript will appear here...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Learning Mode - Left Sidebar */}
            {mode === "learning" && (
              <div className="absolute inset-0 flex justify-start items-center p-8">
                <div
                  className={`w-1/3 h-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 flex flex-col justify-between`}
                  style={{ opacity: getTranscriptOpacity() }}
                >
                  {/* Transcript */}
                  <div
                    className="flex-1 overflow-y-auto mt-4 text-white text-2xl leading-relaxed"
                  >
                    {getTranscriptAmount() || (
                      <span className="text-white/60">
                        Transcript will appear here...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sentiment Display */}
        {isStarted && (
          <div
            className={`absolute bottom-24 left-1/2 -translate-x-1/2 transition-opacity duration-500 px-6 md:px-12 ${
              isStarted && sentiment
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
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
        )}

        {/* Timer Display */}
        {isStarted && (
          <div
            className={`absolute top-6 right-6 transition-opacity duration-500 ${
              isStarted ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className={`px-5 py-3 rounded-lg shadow-lg backdrop-blur-2xl border ${
                isDark
                  ? "bg-slate-800/30 border-purple-400/20"
                  : "bg-white/30 border-purple-200/30"
              }`}
            >
              <p
                className={`text-3xl font-semibold tracking-wider text-white"
                }`}
              >
                {Math.floor(elapsedTime / 60)}:
                {(elapsedTime % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </div>
        )}

        {/* Control Buttons - Bottom Right */}
        {isStarted && (
          <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-30">
            {/* Pause Button */}
            <button
              onClick={handleTogglePause}
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
                onClick={handleStop}
                className="p-5 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 shadow-lg hover:scale-110 transition-all hover:bg-white/20"
              >
                <X className="w-7 h-7 text-white hover:text-red-400" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechCoach;
