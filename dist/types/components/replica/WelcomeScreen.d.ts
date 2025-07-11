import React from "react";
import { AvatarProfile } from "../../lib/api/get-all-avatars-api";
interface WelcomeScreenProps {
    onStart: () => void;
    loading: boolean;
    buttonText?: string;
    videoRef?: React.RefObject<HTMLImageElement>;
    platform: string;
    replicaId: string;
    containerClassName?: string;
    imageHeight?: string;
    buttonSize?: "sm" | "md" | "lg";
    learningPrompts?: string[];
    onPromptClick?: (prompt: string) => void;
    userCredits?: number;
    avatars: AvatarProfile[];
    config: {
        azureTranslatorKey: string;
        azureTranslatorEndpoint: string;
        azureTranslatorRegion: string;
    };
}
declare const WelcomeScreen: React.FC<WelcomeScreenProps>;
export default WelcomeScreen;
