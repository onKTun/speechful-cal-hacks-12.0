import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext.tsx';
import './tailwind.css'


export default function Landing() {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-pink-50'} transition-colors duration-500`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 px-6 py-6 md:px-12 ${isDark ? 'bg-slate-900/90' : 'bg-pink-50/90'} backdrop-blur-sm`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className={`text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r ${isDark ? 'from-pink-300 via-purple-300 to-blue-300' : 'from-pink-400 via-purple-400 to-blue-400'}`}>
            Speechful
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex gap-6">
              <a href="#features" className={`text-sm font-medium ${isDark ? 'text-purple-300 hover:text-purple-100' : 'text-purple-600 hover:text-purple-800'} transition-colors`}>Features</a>
              <a href="#about" className={`text-sm font-medium ${isDark ? 'text-purple-300 hover:text-purple-100' : 'text-purple-600 hover:text-purple-800'} transition-colors`}>About Us</a>
              <a href="#pricing" className={`text-sm font-medium ${isDark ? 'text-purple-300 hover:text-purple-100' : 'text-purple-600 hover:text-purple-800'} transition-colors`}>Pricing</a>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-purple-200 hover:bg-purple-300'} transition-colors`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.675l.707-.707M6.025 17.675l-.707.707M18.364 18.364l.707.707M5.636 5.636l-.707-.707M12 18a6 6 0 100-12 6 6 0 000 12z"></path></svg>
              ) : (
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
            <button
              className={`px-4 md:px-6 py-2 text-sm font-semibold rounded-lg ${isDark ? 'bg-purple-400/20 border-purple-400/40 text-purple-200 hover:bg-purple-400/30' : 'bg-purple-200 border-purple-300 text-purple-800 hover:bg-purple-300'} transition-all`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      <header className="relative pt-32 pb-20 md:pt-40 md:pb-24 text-center overflow-hidden">
        <div className={`absolute top-[10%] right-[15%] w-96 h-96 md:w-[500px] md:h-[500px] ${isDark ? 'bg-pink-400/20' : 'bg-pink-300/40'} rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-[10%] left-[10%] w-[500px] h-[500px] md:w-[600px] md:h-[600px] ${isDark ? 'bg-purple-400/25' : 'bg-purple-300/50'} rounded-full blur-3xl`}></div>
        <div className={`absolute top-[40%] left-[50%] w-80 h-80 md:w-[400px] md:h-[400px] ${isDark ? 'bg-blue-400/20' : 'bg-blue-300/40'} rounded-full blur-3xl`}></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className={`text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-linear-to-r ${isDark ? 'from-pink-300 via-purple-300 to-blue-300' : 'from-pink-400 via-purple-400 to-blue-400'} mb-4`}>
            Unlock Your Speaking Potential
          </div>
          <div className={`text-xs md:text-sm tracking-widest uppercase mb-12 font-light ${isDark ? 'text-purple-300' : 'text-purple-500'}`}>
            AI-POWERED SPEECH COACHING
          </div>

          <h1 className={`text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 ${isDark ? 'text-purple-100' : 'text-purple-900'}`}>
            Elevate Your Presentation with{' '}
            <span className={`text-transparent bg-clip-text bg-linear-to-r ${isDark ? 'from-pink-300 to-purple-300' : 'from-pink-400 to-purple-500'}`}>
              Speechful
            </span>
          </h1>
          <p className={`text-base md:text-lg lg:text-xl ${isDark ? 'text-purple-200' : 'text-purple-700'} max-w-3xl mx-auto leading-relaxed font-light`}>
            Speechful is your personal AI speech coach, designed to help you speak with confidence, clarity, and impact. Get instant feedback and personalized exercises to master public speaking, and presentations.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6">
            <Link to="/webcam" className={`w-full sm:w-auto px-10 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl bg-linear-to-r ${isDark ? 'from-pink-400 via-purple-400 to-blue-400 text-slate-900 shadow-purple-400/30 hover:shadow-xl hover:shadow-purple-400/40' : 'from-pink-300 via-purple-300 to-blue-300 text-purple-900 shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/60'} hover:scale-105 transition-all duration-300`}>
              Start Your Free Session
            </Link>
            <button className={`w-full sm:w-auto px-10 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl ${isDark ? 'bg-purple-300/10 border-purple-300/30 text-purple-200 hover:bg-purple-300/20 hover:border-purple-300/50' : 'bg-purple-100 border-2 border-purple-300 text-purple-900 hover:bg-purple-200'} hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2`}>
              Learn More
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>
      </header>

      <section id="features" className="py-20 md:py-24 px-6 relative z-10">
        <h2 className={`text-4xl md:text-5xl font-extrabold text-center mb-16 ${isDark ? 'text-purple-100' : 'text-purple-900'}`}>Features</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className={` ${isDark ? 'bg-slate-800/50 backdrop-blur-sm border-purple-300/20 hover:border-purple-300/50 hover:shadow-purple-400/20 hover:bg-slate-800/70' : 'bg-white/70 border-purple-200 hover:shadow-purple-300/30'} rounded-2xl p-6 md:p-8 hover:scale-105 hover:border-purple-400 transition-all duration-300`}>
            <div className="text-purple-500 mb-4 text-5xl">💡</div>
            <h3 className={`text-lg md:text-xl font-bold mb-3 ${isDark ? 'text-purple-100' : 'text-purple-900'}`}>Real-Time Feedback</h3>
            <p className={`text-sm md:text-base ${isDark ? 'text-purple-200' : 'text-purple-700'} leading-relaxed`}>
              Get instant analysis on your pace, tone, filler words, and body language. Understand your strengths and areas for improvement with AI-powered insights.
            </p>
          </div>
          <div className={` ${isDark ? 'bg-slate-800/50 backdrop-blur-sm border-purple-300/20 hover:border-purple-300/50 hover:shadow-purple-400/20 hover:bg-slate-800/70' : 'bg-white/70 border-purple-200 hover:shadow-purple-300/30'} rounded-2xl p-6 md:p-8 hover:scale-105 hover:border-purple-400 transition-all duration-300`}>
            <div className="text-green-500 mb-4 text-5xl">📊</div>
            <h3 className={`text-lg md:text-xl font-bold mb-3 ${isDark ? 'text-purple-100' : 'text-purple-900'}`}>Performance Analytics</h3>
            <p className={`text-sm md:text-base ${isDark ? 'text-purple-200' : 'text-purple-700'} leading-relaxed`}>
              Track your progress over time with detailed reports and visualizations. See how your speaking skills evolve and identify trends in your performance.
            </p>
          </div>
          <div className={` ${isDark ? 'bg-slate-800/50 backdrop-blur-sm border-purple-300/20 hover:border-purple-300/50 hover:shadow-purple-400/20 hover:bg-slate-800/70' : 'bg-white/70 border-purple-200 hover:shadow-purple-300/30'} rounded-2xl p-6 md:p-8 hover:scale-105 hover:border-purple-400 transition-all duration-300`}>
            <div className="text-blue-500 mb-4 text-5xl">🗣️</div>
            <h3 className={`text-lg md:text-xl font-bold mb-3 ${isDark ? 'text-purple-100' : 'text-purple-900'}`}>Practice Sessions</h3>
            <p className={`text-sm md:text-base ${isDark ? 'text-purple-200' : 'text-purple-700'} leading-relaxed`}>
              Engage in interactive practice sessions tailored to your needs. Prepare for presentations, job interviews, or simply improve your daily communication.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}