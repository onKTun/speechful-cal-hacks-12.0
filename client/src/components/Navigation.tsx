import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useTheme } from "../ThemeContext";

interface NavigationProps {
  showBackButton?: boolean;
}

export const Navigation = ({ showBackButton = false }: NavigationProps) => {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 px-6 py-6 md:px-12 ${
        isDark ? "bg-slate-900/90" : "bg-pink-50/90"
      } backdrop-blur-sm`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div
          className={`text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r ${
            isDark
              ? "from-pink-300 via-purple-300 to-blue-300"
              : "from-pink-400 via-purple-400 to-blue-400"
          }`}
        >
          Speechful
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex gap-6">
            <a
              href="#features"
              className={`text-sm font-medium ${
                isDark
                  ? "text-purple-300 hover:text-purple-100"
                  : "text-purple-600 hover:text-purple-800"
              } transition-colors`}
            >
              Features
            </a>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg cursor-pointer ${
              isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-purple-200 hover:bg-purple-300"
            } transition-colors`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg
                className="w-6 h-6 text-purple-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.675l.707-.707M6.025 17.675l-.707.707M18.364 18.364l.707.707M5.636 5.636l-.707-.707M12 18a6 6 0 100-12 6 6 0 000 12z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
            )}
          </button>
          {showBackButton && (
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
          )}
          
        </div>
      </div>
    </nav>
  );
};

