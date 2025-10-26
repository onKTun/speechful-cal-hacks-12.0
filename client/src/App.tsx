import Landing from './Landing.tsx'
import { FreeSessionSplash } from './components/SpeechCoach/FreeSessionSplash'
import RehearsalPage from './components/SpeechCoach/RehearsalPage'
import LearningPage from './components/SpeechCoach/LearningPage'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/webcam" element={<FreeSessionSplash />} />
      <Route path="/webcam/rehearsal" element={<RehearsalPage />} />
      <Route path="/webcam/learning" element={<LearningPage />} />
    </Routes>
  )
}

export default App
