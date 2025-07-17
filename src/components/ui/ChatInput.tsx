import React, { useState } from "react";
import { Button } from "./button";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (msg: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  rightElement?: React.ReactNode;
  setInterruptReplica: (interruptReplica: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  disabled,
  placeholder = "Type your message...",
  rightElement,
  setInterruptReplica
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim() === "" || isLoading) return;
    onSend(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-light bg-white flex-shrink-0 flex items-end">
      <textarea
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value);
          setInterruptReplica(true);
          e.target.style.height = "auto";
          e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 rounded-l-lg rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 border-r-0 resize-none min-h-[40px] max-h-[120px] p-3 text-sm border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isLoading || disabled}
        rows={1}
      />
      <Button
        onClick={handleSend}
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
  );
};
