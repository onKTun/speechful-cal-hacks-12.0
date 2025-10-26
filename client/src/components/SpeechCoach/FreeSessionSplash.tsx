import { Link, useNavigate } from "react-router-dom";
import { Home, Play } from "lucide-react";
import { useTheme } from "../../ThemeContext";

export const FreeSessionSplash = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleModeSelect = (mode: "rehearsal" | "learning") => {
    navigate(`/webcam/${mode}`);
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-slate-900" : "bg-pink-50"
      } transition-colors duration-500`}
    >
      {/* Back to Home Button */}
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

      <div className="relative min-h-screen overflow-hidden pt-0">
        {/* Decorative Background Blobs */}
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

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="max-w-4xl w-full space-y-12">
            {/* Title */}
            <div className="text-center">
              <h1
                className={`text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-linear-to-r ${
                  isDark
                    ? "from-pink-300 via-purple-300 to-blue-300"
                    : "from-pink-400 via-purple-400 to-blue-400"
                } mb-4`}
              >
                Choose Your Practice Mode
              </h1>
              <p
                className={`text-lg md:text-xl ${
                  isDark ? "text-purple-300" : "text-purple-600"
                } font-light`}
              >
                Select how you'd like to practice your speech
              </p>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Rehearsal Mode Card */}
              <div
                onClick={() => handleModeSelect("rehearsal")}
                className={`cursor-pointer group rounded-2xl p-8 backdrop-blur-xl border-2 transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? "bg-slate-800/40 border-purple-400/30 hover:border-purple-400/50 hover:bg-slate-800/60"
                    : "bg-white/60 border-purple-200 hover:border-purple-400 hover:bg-white/80"
                }`}
              >
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">🎯</div>
                  <h2
                    className={`text-2xl font-bold ${
                      isDark ? "text-purple-100" : "text-purple-900"
                    }`}
                  >
                    Rehearsal Mode
                  </h2>
                  <p
                    className={`text-sm ${
                      isDark ? "text-purple-300" : "text-purple-600"
                    }`}
                  >
                    Practice with the full transcript available immediately.
                    Perfect for refining your delivery and memorization.
                  </p>
                  <div className="pt-4">
                    <button
                      className={`group-hover:scale-110 px-8 py-3 rounded-xl bg-linear-to-r transition-all duration-300 ${
                        isDark
                          ? "from-pink-400 via-purple-400 to-blue-400 text-slate-900"
                          : "from-pink-300 via-purple-300 to-blue-300 text-purple-900"
                      } hover:shadow-lg`}
                    >
                      <span className="flex items-center gap-2 justify-center">
                        <Play className="w-5 h-5" />
                        Start Rehearsal
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Learning Mode Card */}
              <div
                onClick={() => handleModeSelect("learning")}
                className={`cursor-pointer group rounded-2xl p-8 backdrop-blur-xl border-2 transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? "bg-slate-800/40 border-purple-400/30 hover:border-purple-400/50 hover:bg-slate-800/60"
                    : "bg-white/60 border-purple-200 hover:border-purple-400 hover:bg-white/80"
                }`}
              >
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">📚</div>
                  <h2
                    className={`text-2xl font-bold ${
                      isDark ? "text-purple-100" : "text-purple-900"
                    }`}
                  >
                    Learning Mode
                  </h2>
                  <p
                    className={`text-sm ${
                      isDark ? "text-purple-300" : "text-purple-600"
                    }`}
                  >
                    Challenge yourself with gradual transcript reveals based on
                    difficulty. Build confidence through progressive learning.
                  </p>
                  <div className="pt-4">
                    <button
                      className={`group-hover:scale-110 px-8 py-3 rounded-xl bg-linear-to-r transition-all duration-300 ${
                        isDark
                          ? "from-pink-400 via-purple-400 to-blue-400 text-slate-900"
                          : "from-pink-300 via-purple-300 to-blue-300 text-purple-900"
                      } hover:shadow-lg`}
                    >
                      <span className="flex items-center gap-2 justify-center">
                        <Play className="w-5 h-5" />
                        Start Learning
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

