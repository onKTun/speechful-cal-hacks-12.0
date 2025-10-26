import type { Mode, Difficulty } from "../../types";
import { TranscriptDisplay } from "./TranscriptDisplay";

interface SessionScreenProps {
  transcript: string;
  mode: Mode;
  difficulty: Difficulty;
  showTranscript: boolean;
  currentWordIndex?: number;
  enableHighlighting?: boolean;
}

export const SessionScreen = ({
  transcript,
  mode,
  difficulty,
  showTranscript,
  currentWordIndex,
  enableHighlighting,
}: SessionScreenProps) => {
  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-500 ease-in-out opacity-100`}
    >
      <TranscriptDisplay
        transcript={transcript}
        mode={mode}
        difficulty={difficulty}
        showTranscript={showTranscript}
        currentWordIndex={currentWordIndex}
        enableHighlighting={enableHighlighting}
      />
    </div>
  );
};

