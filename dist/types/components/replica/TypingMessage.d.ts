import React from "react";
interface TypingMessageProps {
    text: string;
    typingSpeed?: number;
    onComplete?: () => void;
    onTyping?: () => void;
}
declare const TypingMessage: React.FC<TypingMessageProps>;
export default TypingMessage;
