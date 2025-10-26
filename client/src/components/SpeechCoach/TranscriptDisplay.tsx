import { useEffect, useState } from "react";
import type { Mode, Difficulty } from "../../types";
import { HighlightingTranscript } from "./HighlightingTranscript";

interface TranscriptDisplayProps {
  transcript: string;
  mode: Mode;
  difficulty: Difficulty;
  showTranscript: boolean;
  currentWordIndex?: number; // Optional: word index to highlight
  enableHighlighting?: boolean; // Optional: enable word-by-word highlighting
}

export const TranscriptDisplay = ({
  transcript,
  mode,
  difficulty,
  showTranscript,
  currentWordIndex = 0,
  enableHighlighting = false,
}: TranscriptDisplayProps) => {

  const [transcriptToDisplay, setTranscript] = useState(transcript)
  useEffect(() => {
    setTranscript(getRedactedTranscript(transcript, difficulty))
  }, [difficulty, showTranscript, mode])

  const getTranscriptOpacity = () => {
    if (!showTranscript) return 0;
    if (mode === "rehearsal") return 1;
    const opacities: { [key: string]: number } = {
      easy: 1,
      medium: 0.7,
      hard: 0.4,
    };
    return opacities[difficulty];
  };


  const getRedactedTranscript = (transcript: string, difficulty: "easy" | "medium" | "hard"): string => {
    if (!showTranscript) return "";
    if (mode === "rehearsal") return transcript;
    if (difficulty === "easy") return transcript;

    const words = transcript.split(" ");
    const redactionRates = {
      medium: 0.3, // 30% of words redacted
      hard: 0.5    // 50% of words redacted
    };

    return words
      .map((word, index) => {
        const shouldRedact = Math.random() < (redactionRates[difficulty] || 0);
        return shouldRedact ? "___" : word;
      })
      .join(" ");
  };


  // Rehearsal Mode - Centered at Top
  if (mode === "rehearsal") {
    return (
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6">
        <div
          className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 transition-opacity duration-500 ease-in-out"
          style={{ opacity: getTranscriptOpacity() }}
        >
          {enableHighlighting ? (
            <HighlightingTranscript
              transcript={transcriptToDisplay}
              currentWordIndex={currentWordIndex}
              highlightColor="bg-yellow-400"
              textColor="text-white"
              className="line-clamp-2 text-center"
            />
          ) : (
            <div className="text-white text-2xl leading-relaxed line-clamp-2 text-center">
                {transcriptToDisplay || (
                <span className="text-white/60">Transcript will appear here...</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Learning Mode - Left Sidebar
  return (
    <div className="absolute inset-0 flex justify-start items-center p-4">
      <div
        className="w-1/3 h-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 flex flex-col justify-between transition-opacity duration-500 ease-in-out"
        style={{ opacity: getTranscriptOpacity() }}
      >
        {enableHighlighting ? (
          <HighlightingTranscript
            transcript={transcriptToDisplay}
            currentWordIndex={currentWordIndex}
            highlightColor="bg-yellow-400"
            textColor="text-white"
            className="flex-1 mt-4"
          />
        ) : (
          <div
            className="flex-1 overflow-y-auto mt-4 text-white text-2xl leading-relaxed p-4 scrollbar-glow"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)",
            }}
          >
              {transcriptToDisplay || (
              <span className="text-white/60">Transcript will appear here...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

