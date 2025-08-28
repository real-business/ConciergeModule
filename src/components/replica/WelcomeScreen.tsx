import React, { useEffect, useState } from "react";

import { batchTranslateText } from "../../lib/batchTranslateText";
import { AvatarProfile } from "../../lib/api/get-all-avatars-api";
import CameraSettings from "./CameraSettings";

interface WelcomeScreenProps {
  onStart: () => void;
  loading: boolean;
  buttonText?: string;
  videoRef?: React.RefObject<HTMLImageElement>;
  platform: string;
  replicaId: string;
  // Optional style customizations
  containerClassName?: string;
  imageHeight?: string;
  buttonSize?: "sm" | "md" | "lg";
  // Learning prompts
  learningPrompts?: string[];
  onPromptClick?: (prompt: string) => void;
  userCredits?: number;
  avatars: AvatarProfile[];
  personaName: string;
  config: {
    azureTranslatorKey: string;
    azureTranslatorEndpoint: string;
    azureTranslatorRegion: string;
  };
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  loading,
  buttonText = "Start Conversation",
  videoRef,
  platform,
  replicaId,
  containerClassName = "",
  imageHeight = "auto",
  buttonSize = "md",
  learningPrompts,
  onPromptClick,
  userCredits,
  avatars,
  personaName,
  config
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSelectedLanguage(localStorage.getItem("lang") || "en");
    }
  }, []);

  const [labels, setLabels] = useState<{ loading: string, avatarNotFound: string }>
  ({loading: "Loading...", avatarNotFound: "Avatar not found" });

  // Find the selected avatar
  const selectedAvatar = avatars.find(avatar => avatar.ExternalId === replicaId);

  // Button size classes
  const buttonSizeClasses = {
    sm: "text-sm px-4 py-2",
    md: "text-base px-6 py-3",
    lg: "text-lg px-8 py-4",
  };

  useEffect(() => {
    const translate = async () => {
      if (selectedLanguage !== "en") {
        const [loading, avatarNotFound] = await batchTranslateText(["Loading...", "Avatar not found"], selectedLanguage, "en", config?.azureTranslatorKey || "", config?.azureTranslatorEndpoint || "", config?.azureTranslatorRegion || "");
        setLabels({ loading: loading, avatarNotFound: avatarNotFound });
      } else {
        setLabels({ loading: "Loading...", avatarNotFound: "Avatar not found" });
      }
    };
    translate();
  }, [selectedLanguage]);

  return (
    <div className={`flex flex-col items-center justify-center ${containerClassName}`}>
      <div className={`w-full ${imageHeight} max-h-[300px] mb-6 relative`}>
        {selectedAvatar ? (
          <>
            <img
              ref={videoRef}
              src={selectedAvatar.ImageUrl}
              alt={selectedAvatar.Name}
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Live indicator overlay */}
            <div className="absolute top-3 right-3 flex items-center bg-black/70 px-2 py-1 rounded-full text-white text-xs font-medium shadow-md">
              <div className="relative flex h-3 w-3 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
              </div>
              <span>LIVE</span>
            </div>
            {/* Avatar info overlay */}
            <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
              {/* <h3 className="text-white font-semibold text-sm">{selectedAvatar.Name}</h3> */}
              <p className="text-white/80 text-xs">
                {personaName}
              </p>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-light rounded-lg flex items-center justify-center">
            <p className="text-secondary">{labels.avatarNotFound}</p>
          </div>
        )}
      </div>

      <button
        onClick={onStart}
        disabled={loading || (userCredits !== undefined && userCredits <= 0)}
        className={`bg-primary text-white rounded-full font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonSizeClasses[buttonSize]}`}
      >
        {loading ? labels.loading : buttonText}
      </button>

      {learningPrompts && learningPrompts.length > 0 && (
        <div className="mt-6 w-full">
          <h3 className="text-lg font-semibold mb-3">Try asking about:</h3>
          <div className="space-y-2">
            {learningPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onPromptClick?.(prompt)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
