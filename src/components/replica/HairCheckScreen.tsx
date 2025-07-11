import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDaily, useLocalSessionId } from "@daily-co/daily-react";
import Video from "./Video";

interface HairCheckScreenProps {
  handleJoin: () => void;
  handleEnd: () => void;
  platform: string;
  setScreen: (screen: string) => void;
  // Style customization props
  containerClassName?: string;
  videoDimensions?: {
    width?: string;
    height?: string;
  };
  buttonsSize?: "sm" | "md" | "lg";
}

const HairCheckScreen: React.FC<HairCheckScreenProps> = ({
  handleJoin,
  handleEnd,
  platform,
  setScreen,
  containerClassName = "",
  videoDimensions = { width: "100%", height: "auto" },
  buttonsSize = "md",
}) => {
  // Use our custom Daily context
  const localSessionId = useLocalSessionId();
  const daily = useDaily();
  // console.log("Daily context:", daily);
  // console.log("Local session ID:", localSessionId);

  // useEffect(() => {
  //   const removeReplitMetadata = () => {
  //     const elements = document.querySelectorAll("[data-replit-metadata]");
  //     elements.forEach((element) => {
  //       if (element.hasAttribute("data-replit-metadata")) {
  //         element.removeAttribute("data-replit-metadata");
  //       }
  //     });
  //   };

  //   removeReplitMetadata();
  // }, []);

  // useEffect(() => {
  //   if (daily) {
  //     const cameraSettings = { startVideoOff: true, startAudioOff: true };
  //     daily.startCamera(cameraSettings);
  //     setScreen("call");
  //   }
  // }, [daily, localSessionId]); 

  useEffect(() => {
    const setupCamera = async () => {
      if (daily) {
        const state = daily?.meetingState();
        if (state === "new" || state === "loading") {
          try {
            daily.startCamera({ startVideoOff: true, startAudioOff: true });
            setScreen("call");
          } catch (err) {
            console.warn("Failed to start camera:", err);
          }
        } else {
          console.log("Call already started, skipping startCamera()");
        }
      }
    };
  
    setupCamera();
  }, [daily, localSessionId]);

  // Define button size classes
  const buttonSizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <motion.div
      className={`flex flex-col items-center ${containerClassName}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex flex-col items-center justify-center gap-4 text-center w-full max-w-2xl mx-auto mt-4 px-2">
        <h2 className="text-xl font-bold text-secondary mb-1">
          Check your camera and microphone
        </h2>
        <p className="text-sm text-secondary">
          Make sure your devices are working properly before joining
        </p>
      </div>

      <div className="w-full max-w-lg mb-6 rounded-lg border border-gray-300 overflow-hidden bg-gray-100">
        <div className="p-8 flex items-center justify-center bg-gradient-to-b from-gray-800 to-primary/60 text-white">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-black/80 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </div>
            <div 
              className="relative rounded-xl border-4 border-primary overflow-hidden shadow-lg" 
              style={{ 
                width: videoDimensions.width || "100%", 
                height: videoDimensions.height || "auto" 
              }}
            >
              <Video id={localSessionId} />
            </div>
          </div>
        </div>
      </div>

      <div className={`flex flex-wrap gap-4 mt-2 justify-center ${buttonsSize === 'sm' ? 'scale-90' : buttonsSize === 'lg' ? 'scale-110' : ''}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-black/5 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <span className="text-sm">Camera: Ready</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-black/5 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
          <span className="text-sm">Microphone: Ready</span>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleEnd}
          className={`border border-primary text-primary rounded-md hover:bg-secondary transition ${buttonSizeClasses[buttonsSize]}`}
        >
          Cancel
        </button>

        <button
          onClick={handleJoin}
          className={`bg-primary hover:bg-secondary text-white rounded-md transition ${buttonSizeClasses[buttonsSize]}`}
        >
          Join Conversation
        </button>
      </div>
    </motion.div>
  );
};

export default HairCheckScreen;
