import { default as React } from 'react';
interface HairCheckScreenProps {
    handleJoin: () => void;
    handleEnd: () => void;
    platform: string;
    setScreen: (screen: string) => void;
    containerClassName?: string;
    videoDimensions?: {
        width?: string;
        height?: string;
    };
    buttonsSize?: "sm" | "md" | "lg";
}
declare const HairCheckScreen: React.FC<HairCheckScreenProps>;
export default HairCheckScreen;
