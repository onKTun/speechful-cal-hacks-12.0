# Rehearsal Video Recording & Feedback Flow

## Overview
The RehearsalPage now includes automatic video recording and displays a feedback screen after the session ends.

## Complete Flow

### 1. Session Start (User clicks "Start")
- `handleStart()` is called
- All states are reset (timer, transcript, feedback)
- After 100ms delay (to ensure webcam stream is ready), `startRecording()` is called
- MediaRecorder is initialized with the webcam stream
- Recording begins automatically
- Visual sentiment analysis starts

### 2. During Session
- Video is recorded continuously via MediaRecorder
- Recorded data chunks are stored in `recordedChunks` state via `dataavailable` events
- Timer runs and shows elapsed time
- Transcript is displayed (if provided)
- Visual sentiment analysis runs every 2 seconds
- Real-time suggestions appear based on sentiment
- User can pause/resume or stop the session

### 3. Session Stop (User clicks Stop/X button)
- `handleStop()` is called (async function)
- `stopRecording()` is awaited:
  - MediaRecorder.stop() is called
  - Waits for the 'stop' event to ensure all data is flushed
- Session states are reset (`isStarted = false`, `isPaused = false`)
- After 100ms delay, the recorded chunks are processed:
  - Chunks are combined into a single Blob
  - Blob is converted to a temporary URL via `URL.createObjectURL()`
  - `videoURL` is set
  - `showFeedback` is set to true

### 4. Feedback Screen Display
- When `showFeedback && videoURL` are both true, RehearsalPage returns `<FeedbackScreen />`
- FeedbackScreen displays:
  - **Recorded Video**: With playback controls (mirrored horizontally for natural viewing)
  - **AI Feedback**: Automatically fetched from backend using visual runtime ratings
  - **Performance Breakdown**: Shows scores for:
    - Facial Expression
    - Eye Contact  
    - Focus
  - Each score shows: Average (out of 10), Min-Max range, and color coding (green/yellow/red)

### 5. Navigation Options from Feedback Screen

#### Try Again Button
- Calls `handleReset()` in RehearsalPage
- Cleans up video URL (revokes object URL to prevent memory leaks)
- Resets all states
- Returns to setup screen for a new rehearsal

#### Mode Selection Button
- Links to "/webcam" route
- Returns user to the mode selection page

## Technical Details

### Video Recording
- **Format**: WebM (video/webm)
- **Storage**: Temporary in-memory Blob, converted to object URL
- **Cleanup**: URLs are revoked on reset and component unmount to prevent memory leaks

### Sentiment Data
- Collected during session via `useVisualSentiment` hook
- Returns: `visualRuntimeRatings` (3D array) and `dataCount`
- Passed to FeedbackScreen for AI feedback generation

### Feedback API
- **Endpoint**: POST http://localhost:3000/feedback
- **Payload**: `{ averagedRatings: [[avg, min, max], [avg, min, max], [avg, min, max]] }`
- **Response**: AI-generated text feedback based on performance

## Key State Variables

- `isStarted`: Whether session is active
- `isPaused`: Whether session is paused
- `recordedChunks`: Array of video Blob chunks
- `videoURL`: Object URL for recorded video playback
- `showFeedback`: Whether to show feedback screen
- `visualSentiment`: Hook providing sentiment data and ratings

## Benefits

1. **Automatic Recording**: No manual start/stop needed
2. **Seamless Transition**: Feedback appears immediately after stop
3. **Memory Management**: Proper cleanup prevents memory leaks
4. **Rich Feedback**: Combines video playback with AI insights
5. **User Control**: Easy navigation to retry or return to mode selection

