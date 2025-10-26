import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

export const useSentimentCapture = (
  webcamRef: React.RefObject<Webcam | null>,
  isStarted: boolean,
  isPaused: boolean
) => {
  const [sentiment, setSentiment] = useState("");
  const [runningRating, setRunningRating] = useState<number[][]>([]);
  const [suggestion, setSuggestion] = useState("");
  const sentimentIntervalRef = useRef<number | null>(null);

  const capture = async () => {
    if (!webcamRef.current) return;

    const image = webcamRef.current.getScreenshot();
    if (!image) return;

    console.log("Image preview:", image.substring(0, 50));

    try {
      const response = await fetch("http://localhost:3000/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: image }),
      });
      const data = await response.json();

      setRunningRating(prev => {
        const updated = [...prev, data.result];
        if (updated.length > 5) {
            updated.shift();
        }


        const sums = updated.reduce(
            (acc, arr) => acc.map((v:number, i:number) => v + (arr[i] ?? 0)),
            [0, 0, 0]
        );
        const averages: number[] = sums.map((v: number): number => v / updated.length);
        const overallSentiment = averages.reduce((sum:number, val:number) => sum + val, 0) / averages.length;
       
        setSentiment(overallSentiment.toString());


        const { value: worstPerformance, index: worstIndex } = averages.reduce(
          (min, current, i) => current < min.value ? { value: current, index: i } : min,
          { value: averages[0], index: 0 }
        );


        if (worstIndex === 0) {
          // facial expression
          if (worstPerformance < 5) {
            setSuggestion("Smile!");
          } else if (worstPerformance < 7) {
            setSuggestion("Lighten Up!");
          } else {
            setSuggestion("Looking Good!");
          }
        } else if (worstIndex === 1) {
          // eye contact
          if (worstPerformance < 5) {
            setSuggestion("Look Up!");
          } else if (worstPerformance < 6) {
            setSuggestion("Keep Eye Contact!");
          } else {
            setSuggestion("Looking Good!");
          }
        } else if (worstIndex === 2) {
          // Focus
          if (worstPerformance < 5) {
            setSuggestion("Focus Up!");
          } else if (worstPerformance < 7) {
            setSuggestion("Keep Focus!");
          } else {
            setSuggestion("Looking Good!");
          }
        }
       
        return updated;
    });

      
    } catch (err) {
      console.error("Sentiment analysis error:", err);
    }
  };

  useEffect(() => {
    if (isStarted && !isPaused) {
      sentimentIntervalRef.current = setInterval(capture, 5000);
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

  return { sentiment, suggestion };
};

