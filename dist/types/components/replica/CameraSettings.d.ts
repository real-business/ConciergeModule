interface CameraSettingsProps {
    actionLabel?: string;
    onAction?: () => void;
    cancelLabel?: string;
    onCancel?: () => void;
    chatLabel?: string;
    onChat?: () => void;
    chatVisible?: boolean;
    platform: "home" | string;
    setInterruptReplica: (interruptReplica: boolean) => void;
    setIsSpeaking: (isSpeaking: boolean) => void;
    setSpokenText: (spokenText: string) => void;
    region: string;
    speechKey: string;
}
declare const CameraSettings: React.FC<CameraSettingsProps>;
export default CameraSettings;
