import React from "react";
interface CallScreenProps {
    conversation: {
        conversation_url: string;
        conversation_id: string;
    };
    handleEnd: () => void;
    platform: string;
    videoMode: string;
    endConv: boolean;
    chatVisible: boolean;
    toggleChat?: () => void;
    containerClassName?: string;
    videoHeight?: string;
    controlsSize?: "sm" | "md" | "lg";
    aspectRatio?: string;
    setInterruptReplica: (interruptReplica: boolean) => void;
    currentScript: string;
    setCurrentScript: (currentScript: string) => void;
    interruptReplica: boolean;
    setIsSpeaking: (isSpeaking: boolean) => void;
    setSpokenText: (spokenText: string) => void;
    region: string;
    speechKey: string;
    personaName: string;
    config: {
        azureTranslatorKey: string;
        azureTranslatorEndpoint: string;
        azureTranslatorRegion: string;
    };
}
declare const CallScreen: React.FC<CallScreenProps>;
export default CallScreen;
