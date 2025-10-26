import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, RotateCcw } from "lucide-react";
import { useTheme } from "../../ThemeContext";

interface FeedbackScreenProps {
  videoURL: string;
  visualRuntimeRatings: number[][];
  dataCount: number;
  onReset: () => void;
}

export const FeedbackScreen = ({
  videoURL,
  visualRuntimeRatings,
  dataCount,
  onReset,
}: FeedbackScreenProps) => {
  const { isDark } = useTheme();
  const [feedback, setFeedback] = useState<string>("");
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      console.log("=== FETCHING AI FEEDBACK ===");
      console.log("Data count:", dataCount);
      console.log("Visual runtime ratings:", visualRuntimeRatings);
      
      try {
        // If no data collected, provide a default message
        if (!dataCount || dataCount === 0) {
          console.log("No data collected, showing default message");
          setFeedback("Work in progress");
          setIsLoadingFeedback(false);
          return;
        }

        const averagedRatings = visualRuntimeRatings.map((category) => [
          category[0] / dataCount,
          category[1],
          category[2],
        ]);
        console.log("Averaged ratings to send:", averagedRatings);

        const response = await fetch("http://localhost:3000/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ averagedRatings }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorData.error || errorData.details || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log("AI feedback received:", data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Validate that we got feedback text
        if (!data.result || typeof data.result !== 'string') {
          console.error("Invalid feedback format:", data);
          throw new Error("Received invalid feedback format from server");
        }
        
        console.log("Setting feedback:", data.result.substring(0, 100) + "...");
        setFeedback("Work in progress");
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setFeedback("Work in progress");
      } finally {
        setIsLoadingFeedback(false);
      }
    };

    fetchFeedback();
  }, [visualRuntimeRatings, dataCount]);

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-slate-900" : "bg-pink-50"
      } transition-colors duration-500`}
    >
      {/* Navigation Buttons */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <button
          onClick={onReset}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all backdrop-blur-xl border-2 cursor-pointer ${
            isDark
              ? "bg-slate-800/40 border-blue-400/30 text-blue-100 hover:bg-slate-800/60 hover:border-blue-400/50"
              : "bg-white/60 border-blue-200 text-blue-900 hover:bg-white/80 hover:border-blue-400"
          } hover:scale-105`}
        >
          <RotateCcw className="w-5 h-5" />
          <span className="font-semibold">Try Again</span>
        </button>
        <Link
          to="/webcam"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all backdrop-blur-xl border-2 cursor-pointer ${
            isDark
              ? "bg-slate-800/40 border-purple-400/30 text-purple-100 hover:bg-slate-800/60 hover:border-purple-400/50"
              : "bg-white/60 border-purple-200 text-purple-900 hover:bg-white/80 hover:border-purple-400"
          } hover:scale-105`}
        >
          <Home className="w-5 h-5" />
          <span className="font-semibold">Mode Selection</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <h1
          className={`text-4xl md:text-5xl font-bold text-center mb-8 ${
            isDark ? "text-white" : "text-slate-800"
          }`}
        >
          Session Complete! 🎉
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Playback Section */}
          <div
            className={`rounded-2xl p-6 backdrop-blur-xl border-2 ${
              isDark
                ? "bg-slate-800/40 border-purple-400/30"
                : "bg-white/60 border-purple-200"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              Your Recording
            </h2>
            {videoURL ? (
              <video
                controls
                src={videoURL}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div
                className={`flex items-center justify-center h-64 rounded-lg ${
                  isDark ? "bg-slate-700/50" : "bg-white/50"
                }`}
              >
                <p
                  className={`text-center ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Recording not available
                </p>
              </div>
            )}
          </div>

          {/* Feedback Section */}
          <div
            className={`rounded-2xl p-6 backdrop-blur-xl border-2 ${
              isDark
                ? "bg-slate-800/40 border-purple-400/30"
                : "bg-white/60 border-purple-200"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              AI Feedback
            </h2>
            {isLoadingFeedback ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : feedback ? (
              <div className="space-y-3">
                {feedback.split('\n').map((line, index) => {
                  // Check if line starts with a bullet point or number
                  const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+\./);
                  const isHeader = line.trim().match(/^[A-Z][^.!?]*:$/);
                  
                  if (isHeader) {
                    return (
                      <h3
                        key={index}
                        className={`text-xl font-bold mt-4 mb-2 ${
                          isDark ? "text-purple-300" : "text-purple-700"
                        }`}
                      >
                        {line.trim()}
                      </h3>
                    );
                  } else if (isBullet || line.trim().length > 0) {
                    return (
                      <p
                        key={index}
                        className={`flex items-start ${
                          isDark ? "text-slate-200" : "text-slate-700"
                        }`}
                      >
                        {isBullet && (
                          <span className="mr-2 text-purple-500">•</span>
                        )}
                        <span className="text-lg leading-relaxed">{line.trim()}</span>
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              <div
                className={`text-center py-8 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                <p>No feedback available</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div
          className={`mt-8 rounded-2xl p-6 backdrop-blur-xl border-2 ${
            isDark
              ? "bg-slate-800/40 border-purple-400/30"
              : "bg-white/60 border-purple-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-800"
            }`}
          >
            Performance Breakdown
          </h2>
          {dataCount > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Facial Expression", "Eye Contact", "Focus"].map((label, i) => {
                const avg = visualRuntimeRatings[i][0] / dataCount;
                const min = visualRuntimeRatings[i][1];
                const max = visualRuntimeRatings[i][2];
                return (
                  <div
                    key={label}
                    className={`p-4 rounded-lg ${
                      isDark ? "bg-slate-700/50" : "bg-white/50"
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-2 ${
                        isDark ? "text-purple-300" : "text-purple-700"
                      }`}
                    >
                      {label}
                    </h3>
                    <p
                      className={`text-3xl font-bold ${
                        avg >= 7
                          ? "text-green-500"
                          : avg >= 5
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {avg.toFixed(1)}/10
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Range: {min.toFixed(1)} - {max.toFixed(1)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`text-center py-8 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <p>No performance data collected during this session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

