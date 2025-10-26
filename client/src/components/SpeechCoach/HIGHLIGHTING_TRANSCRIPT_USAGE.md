# HighlightingTranscript Component Usage

## Overview
The `HighlightingTranscript` component is a reusable React component that highlights words in a transcript sequentially and automatically scrolls to keep the highlighted word visible.

## Basic Usage

```tsx
import { useState, useEffect } from "react";
import { HighlightingTranscript } from "./HighlightingTranscript";

function Example() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const transcript = "This is a sample transcript that will be highlighted word by word";

  // Example: auto-advance words every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => prev + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <HighlightingTranscript
      transcript={transcript}
      currentWordIndex={currentWordIndex}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `transcript` | `string` | **required** | The text to display and highlight |
| `currentWordIndex` | `number` | **required** | The index of the word currently being highlighted (0-based) |
| `highlightColor` | `string` | `"bg-yellow-400"` | Tailwind CSS class for highlight background color |
| `textColor` | `string` | `"text-white"` | Tailwind CSS class for text color |
| `className` | `string` | `""` | Additional CSS classes for the container |
| `wordDelay` | `number` | `300` | Delay in milliseconds before applying the highlight |

## Features

1. **Sequential Highlighting**: Highlights words one by one in order
2. **Auto-Scrolling**: Automatically scrolls to keep the highlighted word visible
3. **Visual Feedback**: 
   - Current word gets a colored background
   - Past words fade to 60% opacity
   - Future words remain at full opacity
4. **Smooth Transitions**: All animations use CSS transitions for smooth effects
5. **Customizable**: Fully customizable colors and styles via props

## Integration Examples

### Example 1: Integration with Speech Recognition
```tsx
import { useState, useEffect } from "react";
import { HighlightingTranscript } from "./HighlightingTranscript";

function SpeechRecognizer() {
  const [transcript, setTranscript] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    // Initialize speech recognition
    const recognition = new window.SpeechRecognition();
    
    recognition.onresult = (event) => {
      const words = event.results[0][0].transcript.split(" ");
      setTranscript(event.results[0][0].transcript);
      setCurrentWordIndex(words.length - 1);
    };

    recognition.start();
  }, []);

  return (
    <HighlightingTranscript
      transcript={transcript}
      currentWordIndex={currentWordIndex}
      highlightColor="bg-blue-400"
    />
  );
}
```

### Example 2: Controlled Playback
```tsx
import { useState } from "react";
import { HighlightingTranscript } from "./HighlightingTranscript";

function ControlledPlayback() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const transcript = "Your transcript text here";

  const handleNext = () => {
    const words = transcript.split(" ");
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
    }
  };

  return (
    <div>
      <HighlightingTranscript
        transcript={transcript}
        currentWordIndex={currentWordIndex}
      />
      <div>
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}
```

### Example 3: Custom Styling
```tsx
<HighlightingTranscript
  transcript="Custom styled transcript"
  currentWordIndex={5}
  highlightColor="bg-purple-500"
  textColor="text-gray-900"
  className="max-h-96 border-2 border-purple-300 rounded-lg"
  wordDelay={200}
/>
```

## Integration with TranscriptDisplay

The `TranscriptDisplay` component has been updated to support the highlighting feature:

```tsx
<TranscriptDisplay
  transcript="Your transcript"
  mode="learning"
  difficulty="medium"
  showTranscript={true}
  currentWordIndex={10}
  enableHighlighting={true}
/>
```

## Notes

- The component automatically handles word splitting and filtering
- Scrolling behavior is smooth and non-intrusive
- Past words are dimmed to 60% opacity for visual reference
- The component is optimized for performance with proper cleanup

