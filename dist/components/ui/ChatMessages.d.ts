import { default as React } from 'react';
import { ChatMessage } from './chat';
export interface ChatMessagesProps {
    messages: ChatMessage[];
    isLoading?: boolean;
    showRetryButton?: boolean;
    handleRetry?: () => void;
    renderMessage?: (message: ChatMessage, index: number) => React.ReactNode;
}
export declare const ChatMessages: React.FC<ChatMessagesProps>;
