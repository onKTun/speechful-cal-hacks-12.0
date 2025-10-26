// temp, tentatively alive
import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

interface VisualSentimentResult {
  sentiment: number; // Overall sentiment (average of 3 categories)
  categories: number[]; // [facial_expression, eye_contact, focus]
  suggestion: string; // Suggestion based on weakest category
  visualRuntimeRatings: number[][]; // Runtime ratings for feedback
  dataCount: number; // Number of data points collected
  reset: () => void; // Manual reset function
}

export const useVisualSentiment = (
  webcamRef: React.RefObject<Webcam | null>,
  isStarted: boolean,
  isPaused: boolean
): VisualSentimentResult => {
  const [visualSentiment, setVisualSentiment] = useState(6);
  const [visualRunningRating, setVisualRunningRating] = useState<number[][]>([]);
  const [visualRuntimeRatings, setVisualRuntimeRatings] = useState<number[][]>([
    [0, 10, 0], // [sum, min, max] for facial_expression (sum starts at 0)
    [0, 10, 0], // [sum, min, max] for eye_contact
    [0, 10, 0], // [sum, min, max] for focus
  ]);
  const [dataCount, setDataCount] = useState(0);
  const [suggestion, setSuggestion] = useState("");
  const sentimentIntervalRef = useRef<number | null>(null);

  const videoCapture = async () => {
    if (!webcamRef.current) return;

    const image = webcamRef.current.getScreenshot();
    if (!image) return;

    try {
      const response = await fetch("http://localhost:3000/sentiment/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: image }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Visual sentiment API error:", response.status, errorData);
        return;
      }
      
      const data = await response.json();

      if (data.error) {
        console.error("Visual sentiment API returned error:", data.error);
        return;
      }

      if (data.result[0] === -1) {
        return;
      }

      // Validate that result is an array with 3 numbers
      if (!Array.isArray(data.result) || data.result.length !== 3) {
        console.error("Invalid sentiment result format:", data.result);
        return;
      }

      // Validate that all values are numbers
      if (!data.result.every((val: any) => typeof val === 'number' && !isNaN(val))) {
        console.error("Invalid sentiment values:", data.result);
        return;
      }

      // Update runtime ratings with accumulation
      setVisualRuntimeRatings((prevRatings) =>
        prevRatings.map((category, i) => [
          category[0] + data.result[i], // Accumulate sum
          Math.min(category[1], data.result[i]), // Track minimum
          Math.max(category[2], data.result[i]), // Track maximum
        ])
      );

      setVisualRunningRating((prev) => {
        const updated = [...prev, data.result];
        setDataCount((prevCount) => prevCount + 1);

        // Keep only last 4 samples
        if (updated.length > 4) {
          updated.shift();
        }

        // Calculate averages
        const sums = updated.reduce(
          (acc, arr) => acc.map((v: number, i: number) => v + (arr[i] ?? 0)),
          [0, 0, 0]
        );
        const averages: number[] = sums.map(
          (v: number): number => v / updated.length
        );
        const overallSentiment =
          averages.reduce((sum: number, val: number) => sum + val, 0) /
          averages.length;

        setVisualSentiment(overallSentiment);

        return updated;
      });
    } catch (err) {
      console.error("Visual sentiment analysis error:", err);
    }
  };

  useEffect(() => {
    if (isStarted && !isPaused) {
      sentimentIntervalRef.current = setInterval(videoCapture, 2000); // Capture every 2 seconds
    } else {
      if (sentimentIntervalRef.current) {
        clearInterval(sentimentIntervalRef.current);
      }
    }
    return () => {
      if (sentimentIntervalRef.current) {
        clearInterval(sentimentIntervalRef.current);
      }
    };
  }, [isStarted, isPaused]);

  // Calculate suggestion based on visual running rating
  useEffect(() => {
    if (isStarted && !isPaused && visualRunningRating.length > 0) {
      const sums = visualRunningRating.reduce(
        (acc, arr) => acc.map((v: number, i: number) => v + (arr[i] ?? 0)),
        [0, 0, 0]
      );
      const averages: number[] = sums.map(
        (v: number): number => v / visualRunningRating.length
      );
      const smallest = Math.min(...averages);

      if (smallest >= 6.5) {
        setSuggestion("Doing great! Keep it up!");
      } else if (smallest < 5) {
        const tips = {
          0: "Be more expressive!",
          1: "Look at the audience!",
          2: "Stay still, stop fidgeting!",
        };
        setSuggestion(tips[averages.indexOf(smallest) as keyof typeof tips]);
      } else {
        setSuggestion("");
      }
    }
  }, [isStarted, isPaused, visualRunningRating]);

  // Reset state when session stops - REMOVED
  // This was resetting data before FeedbackScreen could use it!
  // Now we let the parent component (RehearsalPage) control when to reset
  // by unmounting/remounting or explicitly resetting via a reset prop

  // Calculate current category averages
  const currentAverages = visualRuntimeRatings.map(
    (category) => category[0] / (dataCount || 1)
  );

  // Manual reset function
  const reset = () => {
    setVisualSentiment(6);
    setVisualRunningRating([]);
    setVisualRuntimeRatings([[0, 10, 0], [0, 10, 0], [0, 10, 0]]);
    setDataCount(0);
    setSuggestion("");
  };

  return {
    sentiment: visualSentiment,
    categories: currentAverages,
    suggestion,
    visualRuntimeRatings,
    dataCount,
    reset,
  };
};

