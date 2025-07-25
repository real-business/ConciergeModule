import React, { useEffect } from "react";
// // Use our custom Daily hook instead of the official one
// import { useDaily } from "./CustomDailyProvider";
import { useDaily } from "@daily-co/daily-react";
import CameraSettings from "./CameraSettings";
import Call from "./Call";

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
  // Style customization props
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

const CallScreen: React.FC<CallScreenProps> = ({
  conversation,
  handleEnd,
  platform,
  videoMode,
  endConv,
  chatVisible,
  toggleChat,
  containerClassName = "",
  videoHeight = "auto",
  controlsSize = "md",
  aspectRatio = "16:9",
  setInterruptReplica,
  currentScript,
  setCurrentScript,
  interruptReplica,
  setIsSpeaking,
  setSpokenText,
  region,
  speechKey,
  personaName,
  config
}) => {
  const daily = useDaily();

  useEffect(() => {
    const removeReplitMetadata = () => {
      const elements = document.querySelectorAll("[data-replit-metadata]");
      elements.forEach((element) => {
        if (element.hasAttribute("data-replit-metadata")) {
          element.removeAttribute("data-replit-metadata");
        }
      });
    };

    removeReplitMetadata();
  }, []);

  useEffect(() => {
    if (conversation && daily) {
      const { conversation_url } = conversation;
      daily.join({
        url: conversation_url,
      });
    }
  }, [daily, conversation]);

  const handleLeave = async () => {
    await daily?.leave();
    handleEnd();
  };

  // Create a controls size variable
  const controlsSizeClass = {
    sm: "scale-75",
    md: "",
    lg: "scale-125"
  };

  const bottomClass = 'bottom-4';

  // Calculate minimum height for video container
  const getVideoContainerHeight = () => {
    if (videoHeight === "auto") {
      return "min-h-[360px]"; // Default minimum height
    }
    return videoHeight;
  };

  return (
    <div className={`flex flex-col w-full h-full relative ${containerClassName}`}>
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <Call
          conversationId={conversation.conversation_id}
          platform={platform}
          videoMode={videoMode}
          endConv={endConv}
          onAction={handleLeave}
          videoHeight={getVideoContainerHeight()}
          aspectRatio={aspectRatio}
          setInterruptReplica={setInterruptReplica}
          currentScript={currentScript}
          interruptReplica={interruptReplica}
          config={config}
          personaName={personaName}
        />
        
        
          <div className={`absolute ${bottomClass} left-0 right-0 z-10 flex justify-center ${controlsSizeClass[controlsSize]}`}>
            <CameraSettings
              actionLabel="End Conversation"
              onAction={handleLeave}
              platform={platform}
              chatLabel="Open Chat"
              onChat={toggleChat}
              chatVisible={chatVisible}
              setInterruptReplica={setInterruptReplica}
              setIsSpeaking={setIsSpeaking}
              setSpokenText={setSpokenText}
              region={region}
              speechKey={speechKey}
            />
          </div>
      
      </div>

      {/* {platform !== "home" && platform !== "university" && platform !== "concierge" && platform !== "pr" && platform !== "business_advisor" && (
        <div className={`mt-4 ${controlsSizeClass[controlsSize]}`}>
          <CameraSettings
            actionLabel="Leave Call"
            onAction={handleLeave}
            platform={platform}
            chatLabel="Open Chat"
            onChat={toggleChat}
            chatVisible={chatVisible}
          />
        </div>
      )}  */}
    </div>
  );
};

export default CallScreen;
