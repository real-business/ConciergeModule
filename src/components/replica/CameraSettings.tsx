import { useState, useCallback, useEffect } from "react";
import {
  useDevices,
  useDaily,
  useDailyEvent,
  useLocalSessionId,
  useVideoTrack,
  useAudioTrack,
} from "@daily-co/daily-react";
import { Button, Box } from "@mui/material";
import { Mic, MicOff } from "@mui/icons-material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ChatIcon from "@mui/icons-material/Chat";
import SpeechComponent from "../voice/SpeechComponent";
import { PhoneOff } from "lucide-react";

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

const CameraSettings: React.FC<CameraSettingsProps> = ({
  actionLabel,
  onAction,
  cancelLabel,
  onCancel,
  chatLabel,
  onChat,
  chatVisible = false,
  platform, 
  setInterruptReplica,
  setIsSpeaking,
  setSpokenText,
  region,
  speechKey
}) => {
  const daily = useDaily();
  const { currentCam, currentMic, refreshDevices } = useDevices();

  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);

  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;

  const [getUserMediaError, setGetUserMediaError] = useState<boolean>(false);

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

  useDailyEvent(
    "camera-error",
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );

  const toggleCamera = () => {
    daily?.setLocalVideo(!isCameraEnabled);
  };

  const toggleMicrophone = () => {
    daily?.setLocalAudio(!isMicEnabled);
  };

  const handleCancel = () => {
    daily?.setLocalVideo(false);
    onCancel?.();
  };

  const handleTurnOnCameraAndMic = async () => {
    try {
      await daily?.startCamera();
      await refreshDevices();
      setGetUserMediaError(false);
    } catch (err) {
      console.error("Failed to start camera:", err);
      setGetUserMediaError(true);
    }
  };

  return (
    <div className="mt-2 p-2 rounded-lg max-w-md flex gap-4 justify-around items-center mx-auto bg-primary">
      <div className="flex items-center">
        <SpeechComponent avatarName={platform === "university" ? "Instructor" : 
          platform === "pr" ? "PR Strategist" : 
          platform === "business_advisor" ? "Medical Advisor" : 
          platform === "survey" ? "AI Surveyor" : 
          platform === "concierge" ? "Concierge" : "Business Expert"} 
          disabled={false} 
          voiceMode={true} 
          setSpokenText={setSpokenText} 
          setIsSpeaking={setIsSpeaking} 
          setInterruptReplica={setInterruptReplica} 
          region={region}
          speechKey={speechKey}
        />
      </div>
      {actionLabel && actionLabel === "End Conversation" && (
        <button
          onClick={onAction}
          disabled={
            getUserMediaError ||
            ((!currentCam || !currentMic) && platform !== "home" && platform !== "university" && platform !== "concierge" && platform !== "pr" && platform !== "business_advisor" && platform !== "survey")
          }
          className="flex items-center justify-center p-1 rounded-full border border-white text-white w-10 h-10"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      )}
    </div>
    //   <div className="mt-2 p-2 rounded-lg w-full max-w-md flex flex-col items-center justify-center mx-auto bg-[#4f170d]">
    //   <div className="flex justify-center items-center"> {/* Align items vertically in the main row */}
    //     {/* {getUserMediaError ? (
    //       <button
    //         onClick={handleTurnOnCameraAndMic}
    //         className="px-4 py-2 rounded-lg bg-red-600 text-white"
    //       >
    //         Turn on Camera & Microphone
    //       </button>
    //     ) : (
    //       <div className="flex gap-2 justify-end items-center"> {/* Align camera toggle and speech button */}
    //         {/* {platform !== "home" && (
    //           <div className="flex items-center">
    //             <button onClick={toggleCamera}>
    //               {isCameraEnabled ? (
    //                 <VideocamIcon className="text-sm text-red-600" />
    //               ) : (
    //                 <VideocamOffIcon className="text-sm text-red-600" />
    //               )}
    //             </button>
    //           </div> */}
    //         {/* )} */}
    //         <div className="flex items-center">
    //           <SpeechComponent avatarName="Business Expert" />
    //         </div>
    //       </div>
    //     {/* )} */}
    //     <div className="flex gap-2 ml-2 items-center"> {/* Wrap buttons and align them */}
    //       {/* {cancelLabel && (
    //         <button
    //           onClick={handleCancel}
    //           className="border border-red-600 py-1 px-3 rounded-md text-red-600"
    //         >
    //           {cancelLabel}
    //         </button>
    //       )} */}
    //       {actionLabel && (
    //         <button
    //           onClick={onAction}
    //           disabled={
    //             getUserMediaError ||
    //             ((!currentCam || !currentMic) && platform !== "home")
    //           }
    //           className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-600 text-red-600"
    //         >
    //           {/* <VideocamIcon className="text-sm mr-1 text-red-600" />
    //           {actionLabel} */}
    //           <PhoneOff className="w-4 h-4" />
    //         </button>
    //       )}
    //       {/* {chatLabel && platform === "winfed" && (
    //         <button
    //           onClick={onChat}
    //           className="border border-red-600 py-1 px-3 rounded-md text-red-600"
    //         >
    //           <ChatIcon className="text-sm mr-1 text-red-600" />
    //           {chatVisible ? "Close Chat" : "Open Chat"}
    //         </button>
    //       )} */}
    //     </div>
    //   </div>
    // </div>
  );
};

export default CameraSettings;
