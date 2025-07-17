import React from "react";
interface ChatInputProps {
    onSend: (msg: string) => void;
    isLoading?: boolean;
    disabled?: boolean;
    placeholder?: string;
    rightElement?: React.ReactNode;
    setInterruptReplica: (interruptReplica: boolean) => void;
}
export declare const ChatInput: React.FC<ChatInputProps>;
export {};
