import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
// Define the prop types for the component
interface TypingMessageProps {
  text: string;
  typingSpeed?: number;
  onComplete?: () => void;
  onTyping?: () => void;
}

const TypingMessage: React.FC<TypingMessageProps> = ({ text, typingSpeed = 15, onComplete, onTyping }) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [index, setIndex] = useState<number>(0);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index < text?.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
        // Trigger scroll update after each character
        if (onTyping) {
          onTyping();
        }
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, typingSpeed, onComplete, onTyping]);

  return (
    <div ref={messageRef}>
      <ReactMarkdown>{displayedText}</ReactMarkdown>
    </div>
  );
};

export default TypingMessage;
