import React, { useRef, useEffect, useState } from "react";
import { Bot, Loader2, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../lib/utils";
import { ChatMessage } from "./chat"; // reuse your type

export interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  showRetryButton?: boolean;
  handleRetry?: () => void;
  renderMessage?: (message: ChatMessage, index: number) => React.ReactNode;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading = false,
  showRetryButton,
  handleRetry,
  renderMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
   const [labels, setLabels] = useState<{ insufficientCredits: string, insufficientCreditsDescription: string, placeholder: string, suggestedPrompts: string, thinking: string, retry: string, welcomeMessage: string }>
    ({ insufficientCredits: "Insufficient Credits", insufficientCreditsDescription: "Please purchase more credits to continue.", placeholder: "Type your message...", suggestedPrompts: "Suggested Prompts", thinking: "Thinking...", retry: "Retry", welcomeMessage: "Hi there! I'm your personal health navigator. I can help you understand your lab results, explain medical terminology, and provide personalized health insights. Go ahead and upload the report." });
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
            <Bot size={14} />
          </div>
          <div className="ml-2 px-3 py-2 rounded-lg bg-secondary/10">
            <div className="text-sm text-secondary">
              {labels.welcomeMessage}
            </div>
          </div>
        </div>
      ) : (
        messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isLastAIMessage = isLastMessage && message.sender === "ai";
          const shouldShowRetry = showRetryButton && isLastAIMessage && handleRetry && message.sender === "ai";

          return (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start",
                "mb-4"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user"
                    ? "bg-primary text-white"
                    : "bg-light text-secondary"
                )}
              >
                {renderMessage ? (
                  renderMessage(message, index)
                ) : message.sender === "user" ? (
                  <div className="text-sm">{message.text}</div>
                ) : (
                  <div className="text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                )}
                {shouldShowRetry && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleRetry}
                      className="h-6 px-2 text-xs hover:bg-secondary/20 flex items-center"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      {labels.retry}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      {isLoading && (
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
            <Bot size={14} />
          </div>
          <div className="ml-2 px-3 py-2 rounded-lg bg-secondary/10 flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
            <span className="text-sm text-secondary">{labels.thinking}</span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
