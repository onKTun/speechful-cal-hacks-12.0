import Landing from './Landing.tsx'
import WebcamCapture from './WebcamCapture.tsx'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/webcam" element={<WebcamCapture />} />
    </Routes>
  )
}

export default App
