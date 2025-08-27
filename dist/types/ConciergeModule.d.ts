import { LucideIcon } from "lucide-react";
export interface SuggestedPrompt {
    id: number;
    text: string;
    icon: LucideIcon;
}
export interface ConciergeModuleProps {
    brandName: string;
    className: string;
    personaName: string;
    suggestedPrompts?: SuggestedPrompt[];
    welcomeMessage?: string;
    language?: string;
    navigateTo?: string;
    file?: File;
    onFileChange?: (file: File) => void;
    onApiResponse?: (response: any) => void;
    config: {
        region: string;
        apiBaseUrl: string;
        speechKey: string;
        azureTranslatorKey: string;
        azureTranslatorEndpoint: string;
        azureTranslatorRegion: string;
        tavusApiKey?: string;
    };
}
export default function ConciergeModule({ brandName, className, personaName, suggestedPrompts, welcomeMessage, language, navigateTo, file, onFileChange, onApiResponse, config, }: ConciergeModuleProps): import("react/jsx-runtime").JSX.Element;
