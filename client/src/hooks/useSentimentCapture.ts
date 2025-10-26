import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

export const useSentimentCapture = (
  webcamRef: React.RefObject<Webcam | null>,
  isStarted: boolean,
  isPaused: boolean
) => {
  const [sentiment, setSentiment] = useState("");
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
      setSentiment(data.result);
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

  return sentiment;
};

