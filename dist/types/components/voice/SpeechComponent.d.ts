interface SpeechComponentProps {
    avatarName: string;
    disabled?: boolean;
    voiceMode: boolean;
    setSpokenText: (text: string) => void;
    setIsSpeaking: (isSpeaking: boolean) => void;
    setInterruptReplica: (interruptReplica: boolean) => void;
    region: string;
    speechKey: string;
}
export default function SpeechComponent({ avatarName, disabled, voiceMode, setSpokenText, setIsSpeaking, setInterruptReplica, region, speechKey }: SpeechComponentProps): import("react/jsx-runtime").JSX.Element | null;
export {};
