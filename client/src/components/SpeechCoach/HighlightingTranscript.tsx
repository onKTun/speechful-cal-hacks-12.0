import { useEffect, useRef, useState } from "react";

/**
 * HighlightingTranscript Component
 * 
 * A reusable component that highlights words in a transcript sequentially and auto-scrolls
 * to keep the highlighted word visible.
 * 
 * @example
 * ```tsx
 * const [currentWordIndex, setCurrentWordIndex] = useState(0);
 * 
 * // Example: increment word index every 500ms
 * useEffect(() => {
 *   const interval = setInterval(() => {
 *     setCurrentWordIndex(prev => prev + 1);
 *   }, 500);
 *   return () => clearInterval(interval);
 * }, []);
 * 
 * <HighlightingTranscript
 *   transcript="This is a sample transcript text"
 *   currentWordIndex={currentWordIndex}
 *   highlightColor="bg-yellow-400"
 *   textColor="text-white"
 *   className="custom-class"
 *   wordDelay={300}
 * />
 * ```
 */
interface HighlightingTranscriptProps {
  transcript: string;
  currentWordIndex: number;
  highlightColor?: string;
  textColor?: string;
  className?: string;
  wordDelay?: number; // Optional delay between word highlights (ms)
}

export const HighlightingTranscript = ({
  transcript,
  currentWordIndex,
  highlightColor = "bg-yellow-400",
  textColor = "text-white",
  className = "",
  wordDelay = 300, // Default 300ms delay between highlights
}: HighlightingTranscriptProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [localWordIndex, setLocalWordIndex] = useState(currentWordIndex);

  // Split transcript into words
  const words = transcript.split(" ").filter((word) => word.trim().length > 0);

  // Update local word index with controlled timing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLocalWordIndex(currentWordIndex);
    }, wordDelay);

    return () => clearTimeout(timeoutId);
  }, [currentWordIndex, wordDelay]);

  // Auto-scroll to keep highlighted word visible
  useEffect(() => {
    if (localWordIndex >= 0 && localWordIndex < wordRefs.current.length) {
      const currentWordRef = wordRefs.current[localWordIndex];
      if (currentWordRef && containerRef.current) {
        const container = containerRef.current;
        const wordTop = currentWordRef.offsetTop;
        const wordHeight = currentWordRef.offsetHeight;
        const containerTop = container.scrollTop;
        const containerHeight = container.clientHeight;

        // Check if word is outside visible area
        const isAboveView = wordTop < containerTop;
        const isBelowView = wordTop + wordHeight > containerTop + containerHeight;

        if (isAboveView) {
          // Scroll to show word at top
          container.scrollTo({
            top: wordTop - 20, // 20px padding from top
            behavior: "smooth",
          });
        } else if (isBelowView) {
          // Scroll to show word at bottom
          container.scrollTo({
            top: wordTop + wordHeight - containerHeight + 20, // 20px padding from bottom
            behavior: "smooth",
          });
        }
      }
    }
  }, [localWordIndex]);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className={`${textColor} text-2xl leading-relaxed p-4`}>
        {words.map((word, index) => {
          const isHighlighted = index === localWordIndex;
          const isPast = index < localWordIndex;

          return (
            <span
              key={`${word}-${index}`}
              ref={(el) => {
                wordRefs.current[index] = el;
              }}
              className={`transition-all duration-300 ease-in-out ${
                isHighlighted
                  ? `${highlightColor} px-2 py-1 rounded`
                  : isPast
                  ? "opacity-60"
                  : ""
              }`}
            >
              {word}
              {index < words.length - 1 && " "}
            </span>
          );
        })}
      </div>
    </div>
  );
};

