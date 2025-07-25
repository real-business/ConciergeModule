interface CallProps {
    conversationId: string;
    platform: string;
    videoMode: string;
    endConv: boolean;
    onAction: () => void;
    videoHeight?: string;
    aspectRatio?: string;
    setInterruptReplica: (interruptReplica: boolean) => void;
    currentScript: string;
    interruptReplica: boolean;
    personaName: string;
    config: {
        azureTranslatorKey: string;
        azureTranslatorEndpoint: string;
        azureTranslatorRegion: string;
    };
}
export declare const Call: React.FC<CallProps>;
export default Call;
