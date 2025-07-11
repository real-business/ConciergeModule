import React from "react";
import { LucideIcon } from "lucide-react";
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
export declare function Chat({ messages, onSendMessage, className, isLoading, rightElement, suggestedPrompts, renderMessage, showRetryButton, handleRetry, setInterruptReplica, language, config }: ChatProps): import("react/jsx-runtime").JSX.Element;
export {};
