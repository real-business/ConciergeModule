import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button"
import { Input } from "./input";
import { Bot, Send, Loader2, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronUp, ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

import { batchTranslateText } from "../../lib/batchTranslateText";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface SuggestedPrompt {
  id: number;
  text: string;
  icon: LucideIcon;
}

export interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  className?: string;
  isLoading?: boolean;
  rightElement?: React.ReactNode;
  suggestedPrompts?: SuggestedPrompt[];
  renderMessage?: (message: ChatMessage, index: number) => React.ReactNode;
  showRetryButton?: boolean;
  handleRetry?: () => void;
  setInterruptReplica: (interruptReplica: boolean) => void;
  language: string;
  config: {
    azureTranslatorKey: string;
    azureTranslatorEndpoint: string;
    azureTranslatorRegion: string;
  };
}

export function Chat({
  messages,
  onSendMessage,
  className = "",
  isLoading = false,
  rightElement,
  suggestedPrompts,
  renderMessage,
  showRetryButton = false,
  handleRetry,
  setInterruptReplica,
  language,
  config
}: ChatProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [arePromptsCollapsed, setArePromptsCollapsed] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const enoughCredits = true;
  const translatedLangRef = useRef<string | null>(null);
  const [labels, setLabels] = useState<{ insufficientCredits: string, insufficientCreditsDescription: string, placeholder: string, suggestedPrompts: string, thinking: string, retry: string, welcomeMessage: string }>
  ({ insufficientCredits: "Insufficient Credits", insufficientCreditsDescription: "Please purchase more credits to continue.", placeholder: "Type your message...", suggestedPrompts: "Suggested Prompts", thinking: "Thinking...", retry: "Retry", welcomeMessage: "Hi there! I'm your personal health navigator. I can help you understand your lab results, explain medical terminology, and provide personalized health insights. What would you like to know about your health today?" });

  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollArea = messagesEndRef.current.closest('[data-radix-scroll-area-viewport]') || 
                        chatContainerRef.current;
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const translate = async () => { // ✅ this will run on language change
      if (language !== "en" && translatedLangRef.current !== language) {
        const [insufficientCredits, insufficientCreditsDescription, placeholder, suggestedPrompts, thinking, retry, welcomeMessage] = await batchTranslateText(["Insufficient Credits", "Please purchase more credits to continue.", "Type your message...", "Suggested Prompts", "Thinking...", "Retry", "Hi there! I'm your personal health navigator. I can help you understand your lab results, explain medical terminology, and provide personalized health insights. What would you like to know about your health today?"], language, "en", config?.azureTranslatorKey || "", config?.azureTranslatorEndpoint || "", config?.azureTranslatorRegion || ""); 
        setLabels({ insufficientCredits: insufficientCredits, insufficientCreditsDescription: insufficientCreditsDescription, placeholder: placeholder, suggestedPrompts: suggestedPrompts, thinking: thinking, retry: retry, welcomeMessage: welcomeMessage });
        translatedLangRef.current = language; // ✅ remember this translation
      }

      if (language === "en" && translatedLangRef.current !== "en") {
        setLabels({ insufficientCredits: "Insufficient Credits", insufficientCreditsDescription: "Please purchase more credits to continue.", placeholder: "Type your message...", suggestedPrompts: "Suggested Prompts", thinking: "Thinking...", retry: "Retry", welcomeMessage: "Hi there! I'm your personal health navigator. I can help you understand your lab results, explain medical terminology, and provide personalized health insights. What would you like to know about your health today?" });
        translatedLangRef.current = "en";
      }
    };
    translate();
  }, [language, config]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "" || isLoading) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const togglePrompts = () => {
    setArePromptsCollapsed(!arePromptsCollapsed);
  };

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-lg border border-primary/20 overflow-hidden ${className}`}
    >
      {/* <div className="bg-[#E92A09] text-white p-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white mr-2">
            <Bot size={14} />
          </div>
          <span className="font-medium">AI Assistant</span>
        </div>
      </div> */}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 bg-white/80">
        <div className="space-y-3">
          {messages?.length === 0 ? (
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
            messages?.map((message, index) => {
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
                        ? "bg-primary/90 text-white"
                        : "bg-light text-secondary"
                    )}
                  >
                    {renderMessage ? (
                      renderMessage(message, index)
                    ) : (
                        message.sender === "user" ? (
                          <div className="text-sm">{message.text}</div>
                        ) : (
                          <div className="text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown></div>
                        )
                    )}
                    
                    {shouldShowRetry && (
                      <div className="mt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRetry}
                          className="h-6 px-2 text-xs hover:bg-secondary/20"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          {labels.retry}
                        </Button>
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
      </div>

      <div className="p-3 border-t border-light bg-white flex-shrink-0">
        {/* Collapsible Suggested Prompts */}
        {suggestedPrompts && suggestedPrompts?.length > 0 && (
          <div className="bg-white border-b border-light flex-shrink-0">
            <button
              onClick={togglePrompts}
              className="w-full p-2 flex items-center justify-center hover:bg-secondary/10 transition-colors"
            >
              <span className="text-sm font-medium text-secondary">
                {labels.suggestedPrompts}
              </span>
              {arePromptsCollapsed ? (
                <ChevronDown className="h-4 w-4 text-secondary" />
              ) : (
                <ChevronUp className="h-4 w-4 text-secondary" />
              )}
            </button>
            {!arePromptsCollapsed && (
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {suggestedPrompts.map(({id, text, icon: Icon}) => (
                  <Button
                    key={id}
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left text-sm h-auto min-h-[40px] py-2 px-3",
                      "whitespace-normal break-words"
                    )}
                    onClick={() => handleSelectPrompt(text)}
                  >
                    <Icon className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                    <span className="text-left">{text}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-end">
          <textarea
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInterruptReplica(true);
              // Auto-resize the textarea
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder={labels.placeholder}
            className="flex-1 rounded-l-lg rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 border-r-0 resize-none min-h-[40px] max-h-[120px] p-3 text-sm border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || !enoughCredits}
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            className="rounded-l-none bg-primary hover:bg-secondary h-[40px]"
            disabled={inputValue.trim() === "" || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>

          {rightElement && <div className="ml-2">{rightElement}</div>}
        </div>
      </div>
    </div>
  );
}
