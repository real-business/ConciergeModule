type ConversationComponentProps = {
    roomUrl?: string;
    userName?: string;
    replicaId?: string;
    personaId?: string;
    personaName?: string;
    conversationName?: string;
    conversationalContext?: string;
    customGreeting?: string;
    platform?: string;
    buttonText?: string;
    videoMode?: string | null;
    chatVisible?: boolean;
    toggleChat?: () => void;
    learningPrompts?: string[];
    onPromptClick?: (prompt: string) => void;
    width?: string | number;
    height?: string | number;
    maxWidth?: string | number;
    className?: string;
    setVoiceMode: (voiceMode: boolean) => void;
    setConversationStarted: (conversationStarted: boolean) => void;
    setConversationId: (conversationId: string) => void;
    setConversationUrl: (conversationUrl: string) => void;
    setInterruptReplica: (interruptReplica: boolean) => void;
    currentScript: string;
    setCurrentScript: (currentScript: string) => void;
    interruptReplica: boolean;
    setIsSpeaking: (isSpeaking: boolean) => void;
    setSpokenText: (spokenText: string) => void;
    region: string;
    speechKey: string;
    config: {
        azureTranslatorKey: string;
        azureTranslatorEndpoint: string;
        azureTranslatorRegion: string;
    };
};
export type ConversationComponentHandle = {
    handleEnd: () => void;
    handleStart: () => void;
};
export interface ConversationComponentRef {
    handleEnd: () => void;
}
declare const ConversationComponent: import("react").ForwardRefExoticComponent<ConversationComponentProps & import("react").RefAttributes<ConversationComponentRef>>;
export default ConversationComponent;
