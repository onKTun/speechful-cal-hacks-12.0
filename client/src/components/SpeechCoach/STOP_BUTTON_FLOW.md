# Stop Button (X) Flow - Complete Documentation

## Overview
When the user presses the X (stop) button during a rehearsal session, the system performs a coordinated shutdown of all recording and AI processes, then transitions to the feedback screen.

## Detailed Flow

### Step 1: User Clicks Stop Button
- Location: Controls component (bottom-right X button)
- Triggers: `onStop` callback → `handleStop()` in RehearsalPage

### Step 2: Stop Recording (Async)
```typescript
await stopRecording()
```
- Adds event listener for MediaRecorder's 'stop' event
- Calls `mediaRecorderRef.current.stop()`
- Waits for recording to fully complete before proceeding
- Returns a Promise that resolves when recording is stopped

**Result**: Video recording stops, final chunks are queued for processing

### Step 3: Stop Session & AI Calls
```typescript
setIsStarted(false)
setIsPaused(false)
```
- `isStarted = false` triggers immediate stop of AI sentiment analysis
- The `useVisualSentiment` hook monitors `isStarted`:
  ```typescript
  useEffect(() => {
    if (isStarted && !isPaused) {
      // Start AI calls
      sentimentIntervalRef.current = setInterval(videoCapture, 2000);
    } else {
      // STOP AI calls immediately
      if (sentimentIntervalRef.current) {
        clearInterval(sentimentIntervalRef.current);
      }
    }
  }, [isStarted, isPaused]);
  ```

**Result**: AI sentiment capture stops immediately (no more API calls)

### Step 4: Process Video & Show Feedback (Async)
```typescript
setTimeout(() => {
  setRecordedChunks((chunks) => {
    if (chunks.length > 0) {
      // Create video blob and URL
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
      setShowFeedback(true);
    } else {
      // Handle edge case: no chunks recorded
      console.warn("No video chunks recorded");
      setShowFeedback(true); // Still show feedback
    }
    return chunks;
  });
}, 100);
```
- 100ms delay ensures final data chunks are fully processed
- Uses functional state update to access latest chunks
- Creates video Blob and generates object URL for playback
- Sets `showFeedback = true` to trigger screen transition

**Result**: Video URL ready, feedback screen triggered

### Step 5: Display Feedback Screen
```typescript
if (showFeedback) {
  return <FeedbackScreen ... />
}
```
- RehearsalPage conditionally renders FeedbackScreen
- Complete transition - session UI is unmounted
- Feedback screen loads and displays

## FeedbackScreen Behavior

### Video Display
- **If video available**: Shows playback with controls (mirrored)
- **If no video**: Shows placeholder message "Recording not available"

### AI Feedback Generation
```typescript
useEffect(() => {
  if (!dataCount || dataCount === 0) {
    setFeedback("Session was too short to collect performance data...");
    return;
  }
  
  // Fetch AI feedback from backend
  const response = await fetch("http://localhost:3000/feedback", {
    method: "POST",
    body: JSON.stringify({ averagedRatings })
  });
}, [visualRuntimeRatings, dataCount]);
```
- **If data collected**: Fetches AI feedback from backend
- **If no data** (stopped too quickly): Shows helpful message

### Performance Breakdown
- **If data > 0**: Shows 3 category scores with ranges
- **If data = 0**: Shows "No performance data collected" message

## Edge Cases Handled

### 1. Stopped Immediately After Start
- Recording might have 0 chunks
- Sentiment analysis might have collected 0 data points
- Feedback screen still shows with appropriate messages

### 2. Network Errors
- AI feedback fetch fails gracefully
- Shows: "Unable to generate feedback at this time."

### 3. Recording Errors
- Try-catch blocks prevent crashes
- Console warnings for debugging
- Feedback screen still accessible

## State Management Summary

### States That Change on Stop
| State | Before | After | Effect |
|-------|--------|-------|--------|
| `isStarted` | `true` | `false` | Stops AI calls, hides session UI |
| `isPaused` | any | `false` | Reset pause state |
| `showFeedback` | `false` | `true` | Shows feedback screen |
| `videoURL` | `""` | `"blob:..."` | Video ready for playback |

### States That Persist
- `recordedChunks` - Kept for video generation
- `visualRuntimeRatings` - Needed for feedback
- `dataCount` - Needed for feedback
- `transcript` - Available for next session
- `difficulty` - Available for next session

## Navigation From Feedback Screen

### Try Again Button
- Calls `handleReset()` in RehearsalPage
- Cleans up video URL (revokes to prevent memory leaks)
- Resets all session states
- Returns to setup screen (same transcript/difficulty)

### Mode Selection Button
- Links to "/webcam" route
- Navigates to mode selection page

## Memory Management

### Cleanup Operations
1. **On Reset**: 
   ```typescript
   if (videoURL) {
     URL.revokeObjectURL(videoURL);
   }
   ```

2. **On Unmount**:
   ```typescript
   useEffect(() => {
     return () => {
       if (videoURL) {
         URL.revokeObjectURL(videoURL);
       }
     };
   }, [videoURL]);
   ```

**Prevents memory leaks** from accumulating blob URLs

## Timeline Diagram

```
User clicks X button
     ↓
[0ms] handleStop() called
     ↓
[0ms] stopRecording() starts (async)
     ↓
[~50ms] MediaRecorder emits 'stop' event
     ↓
[~50ms] stopRecording() resolves
     ↓
[~50ms] setIsStarted(false) → AI calls stop immediately
     ↓
[~150ms] setTimeout processes video chunks
     ↓
[~150ms] setShowFeedback(true)
     ↓
[~150ms] RehearsalPage re-renders
     ↓
[~150ms] FeedbackScreen mounts and displays
     ↓
[~200ms] AI feedback fetch begins
     ↓
[~1000ms] AI feedback arrives and displays
```

## Testing Checklist

- [ ] Stop immediately after start (0-2 seconds)
- [ ] Stop during active session (after 10+ seconds)
- [ ] Stop while paused
- [ ] Verify video playback works
- [ ] Verify AI feedback displays
- [ ] Verify performance scores display
- [ ] Try "Try Again" button
- [ ] Try "Mode Selection" button
- [ ] Check browser console for errors
- [ ] Verify no memory leaks (check blob URLs)

