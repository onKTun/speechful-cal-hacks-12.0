import { useState } from 'react';
import { Sun, Moon, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SpeechfulHero() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-6 md:px-12 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 dark:from-white dark:via-purple-400 dark:to-pink-500">
              Speechful
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex gap-6">
                <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Features
                </a>
                <a href="#about" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  About
                </a>
                <a href="#pricing" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Pricing
                </a>
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
              <a
                href="#"
                className="px-4 md:px-6 py-2 text-sm font-semibold rounded-lg bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/40 text-gray-900 dark:text-white hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all"
              >
                Sign In
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Animated Gradient Blobs */}
          <div className="absolute top-[10%] right-[15%] w-96 h-96 md:w-[500px] md:h-[500px] bg-pink-500/30 dark:bg-pink-500/20 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] md:w-[600px] md:h-[600px] bg-purple-500/40 dark:bg-purple-500/25 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute top-[40%] left-[50%] w-80 h-80 md:w-[400px] md:h-[400px] bg-blue-500/25 dark:bg-blue-500/15 rounded-full blur-3xl opacity-70"></div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 py-20 max-w-6xl mx-auto">
            <div className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 dark:from-white dark:via-purple-400 dark:to-pink-500 mb-4">
              Speechful
            </div>
            
            <div className="text-xs md:text-sm tracking-widest uppercase mb-12 font-light text-gray-500 dark:text-gray-400">
              AI-Powered Communication
            </div>

            <div className="mb-12 px-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-gray-900 dark:text-white">
                Transform Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-purple-600 dark:from-white dark:to-purple-400">
                  Speaking Skills
                </span>
                <br />
                With AI-Powered Coaching
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                Master the art of public speaking with real-time AI feedback, personalized insights, and confidence-building exercises tailored to your unique style.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-16 md:mb-20">
              <Link to="/webcam" className="w-full sm:w-auto px-10 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300">
                Access Demo
              </Link>
              <button className="w-full sm:w-auto px-10 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl bg-gray-100 dark:bg-white/5 border-2 border-gray-300 dark:border-purple-500/30 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-purple-500/10 dark:hover:border-purple-500/60 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                <Play className="w-4 h-4 md:w-5 md:h-5" />
                Watch Overview
              </button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 hover:scale-105 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:bg-white/10 transition-all duration-300">
                <div className="text-4xl md:text-5xl mb-4">🎯</div>
                <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900 dark:text-white">Real-Time Feedback</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Get instant analysis of your pace, tone, and clarity as you speak
                </p>
              </div>

              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 hover:scale-105 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:bg-white/10 transition-all duration-300">
                <div className="text-4xl md:text-5xl mb-4">📊</div>
                <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900 dark:text-white">Performance Analytics</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Track your progress with detailed insights and improvement metrics
                </p>
              </div>

              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 hover:scale-105 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:bg-white/10 transition-all duration-300">
                <div className="text-4xl md:text-5xl mb-4">🎤</div>
                <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900 dark:text-white">Practice Sessions</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Interactive scenarios to build confidence in any speaking situation
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}