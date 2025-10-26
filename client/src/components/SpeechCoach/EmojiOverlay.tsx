import { useState, useEffect } from "react";

interface EmojiOverlayProps {
  sentiment: string;
  isVisible: boolean;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
}

export const EmojiOverlay = ({ sentiment, isVisible }: EmojiOverlayProps) => {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    if (!isVisible || !sentiment) {
      setEmojis([]);
      return;
    }

    // Parse sentiment value (assuming it's a number or string with number)
    const sentimentValue = parseFloat(sentiment);
    if (isNaN(sentimentValue)) {
      setEmojis([]);
      return;
    }

    // Define emoji sets based on sentiment
    let emojiSet: string[];
    let volume: number;

    if (sentimentValue <= 4) {
      // Negative emojis
      emojiSet = ["😔", "😟", "😢", "😕", "😞", "😥", "😰", "😓"];
      volume = 8; // decent volume
    } else if (sentimentValue >= 5 && sentimentValue <= 6) {
      // Neutral emojis
      emojiSet = ["😐", "😑", "🙂", "😶", "😌", "🤔"];
      volume = 4; // normal volume
    } else {
      // Positive emojis (7+)
      emojiSet = ["😊", "😄", "🎉", "✨", "😃", "🌟", "💫", "🎊", "😁", "🥳"];
      volume = 8; // decent volume
    }

    // Generate random floating emojis
    const newEmojis: FloatingEmoji[] = Array.from({ length: volume }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)],
      left: Math.random() * 80 + 10, // Random position between 10% and 90%
      animationDuration: Math.random() * 3 + 3, // 3-6 seconds
      animationDelay: Math.random() * 2, // 0-2 seconds delay
      size: Math.random() * 40 + 60, // 60-100px
    }));

    setEmojis(newEmojis);

    // Refresh emojis periodically
    const interval = setInterval(() => {
      const refreshedEmojis: FloatingEmoji[] = Array.from({ length: volume }, (_, i) => ({
        id: Date.now() + i,
        emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)],
        left: Math.random() * 80 + 10,
        animationDuration: Math.random() * 3 + 3,
        animationDelay: Math.random() * 2,
        size: Math.random() * 20 + 30,
      }));
      setEmojis(refreshedEmojis);
    }, 6000); // Refresh every 6 seconds

    return () => clearInterval(interval);
  }, [sentiment, isVisible]);

  if (!isVisible || emojis.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="absolute animate-float-up"
          style={{
            left: `${emoji.left}%`,
            bottom: "-50px",
            fontSize: `${emoji.size}px`,
            animationDuration: `${emoji.animationDuration}s`,
            animationDelay: `${emoji.animationDelay}s`,
            opacity: 0.7,
          }}
        >
          {emoji.emoji}
        </div>
      ))}
      
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-float-up {
          animation-name: float-up;
          animation-timing-function: ease-in-out;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

