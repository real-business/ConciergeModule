import { useCallback, useEffect, useState } from "react";
import Video from "./Video"
import {
  DailyAudio,
  useParticipantIds,
  useLocalSessionId
} from "@daily-co/daily-react";
import { useDaily, useAppMessage } from "@daily-co/daily-react";
import { batchTranslateText } from "../../lib/batchTranslateText";
import removeMarkdown from "remove-markdown";

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

interface AppMessage {
  type: string;
  content: string;
  timestamp: string;
  // Add other properties based on what `ev` contains
}

export const Call: React.FC<CallProps> = ({
  conversationId,
  platform,
  videoMode,
  endConv,
  onAction,
  videoHeight = "auto",
  aspectRatio = "16:9",
  setInterruptReplica,
  currentScript,  
  interruptReplica,
  personaName,
  config
}) => {
  // Use our custom Daily context
  const daily = useDaily();
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const [mode, setMode] = useState("full");
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSelectedLanguage(localStorage.getItem("lang") || "en");
    }
  }, []);

  const sendAppMessage = useAppMessage({
    onAppMessage: useCallback((ev: any) => {
      const appMessage = ev.data as AppMessage; // 👈 Safe cast
      setMessages((prevMessages) => [...prevMessages, appMessage]);
    }, []),
  });
  const [labels, setLabels] = useState<{ waiting: string, endConversation: string }>
  ({ waiting: `${personaName} will be here shortly...`, endConversation: "Ending Conversation..." });

  useEffect(() => {
    const translate = async () => {
      if (selectedLanguage !== "en") {
        const [waiting, endConversation] = await batchTranslateText([`${personaName} will be here shortly...`, "Ending Conversation..."], selectedLanguage, "en", config?.azureTranslatorKey || "", config?.azureTranslatorEndpoint || "", config?.azureTranslatorRegion || "");
        setLabels({ waiting: waiting, endConversation: endConversation });
      } else {
        setLabels({ waiting: `${personaName} will be here shortly...`, endConversation: "Ending Conversation..." });
      }
    };
    translate();
  }, [selectedLanguage]);

  const cleanScript = (text: string): string => {
    if (!text) return "";
  
    return removeMarkdown(text)
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "") // Remove emojis
      .replace(/[^\w\s.,!?'"-]/g, "") // Remove weird characters
      .replace(/\s+/g, " ") // Collapse whitespace
      .trim();
  };

  // Set hasJoined to true when callState changes to 'joined'
  useEffect(() => {
    const handleJoin = () => setHasJoined(true);
    if (daily) {
      daily.on("joined-meeting", handleJoin);
    }
    return () => {
      if (daily) {
        daily.off("joined-meeting", handleJoin);
      }
    };
  }, [daily]);
  // When the `currentScript` changes (e.g., new script is available),
  // send the script to the echo interaction handler.
  useEffect(() => {
    try {
      if (daily && hasJoined && currentScript) {
        setInterruptReplica(false);
        const cleanedScript = cleanScript(currentScript);
        sendEchoInteraction(cleanedScript);
      }
    } catch (error) {
      console.error("Error sending echo interaction:", error);
    }
    
  }, [currentScript, hasJoined]);

  // When `interruptReplica` becomes true (e.g., user wants to interrupt the avatar),
  // trigger the interrupt interaction handler.
  useEffect(() => {
    if (daily && hasJoined && interruptReplica) {
      sendInterruptInteraction();
    }
  }, [interruptReplica]);

  // When the videoMode is sent then use it as the mode:
  useEffect(() => {
    if (videoMode) {
      setMode(videoMode);
    }
  }, [videoMode]);

  const aspectRatioPadding = (ratio: string) => {
    const [w, h] = ratio.split(":").map(Number);
    if (!w || !h) return "56.25%"; // fallback to 16:9
    return `${(h / w) * 100}%`;
  };

  // Function to send Echo Interaction to Daily conversation
  const sendEchoInteraction = (text: string) => {
    const interaction = {
      message_type: "conversation",
      event_type: "conversation.echo",
      conversation_id: conversationId,
      properties: {
        modality: "text",
        text: `${text}`,
      },
    };

    console.log("Sending Echo Interaction:", interaction); // Log message before sending
    sendAppMessage(interaction, "*");
  };

  //Function to send Interrupt interaction to Daily Conversation
  const sendInterruptInteraction = () => {
    const interaction = {
      message_type: "conversation",
      event_type: "conversation.interrupt",
      conversation_id: conversationId,
    };
    console.log("Sending Echo Interaction:", interaction); // Log message before sending
    sendAppMessage(interaction, "*");
  };

  return (
    <>
      <div className={`flex flex-col items-center justify-center gap-4 text-center mx-auto px-2 h-full overflow-hidden`}>
        <div className="relative w-full h-full rounded-xl border-4 border-neutral overflow-hidden shadow-lg">
          {remoteParticipantIds.length > 0 ? (
           <div
           className="relative w-full h-full"
            style={{
            backgroundColor: "#000",
            position: "relative",
            overflow: "hidden", // To contain absolutely positioned elements
           }}
         >
           <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex", // Add flex to center content if needed
              justifyContent: "center", // Center content horizontally
              alignItems: "center", // Center content vertically
            }}
            >
              <Video
                id={remoteParticipantIds[0]}
                style={{
                  borderRadius: "0px",
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#000"
                }}
              />
              </div>
              {/* {localSessionId && platform !== "home" && platform !== "university" && platform !== "concierge" && platform !== "pr" && (
                <div
                  className={`absolute top-4 left-4 z-30 rounded-xl shadow-md overflow-hidden bg-transparent ${
                    mode === "full"
                      ? "w-[135px] h-[110px]"
                      : "w-[95px] h-[55px]"
                  }`}
                >
                  <Video
                    id={localSessionId}
                    style={{
                      objectFit: mode === "full" ? "contain" : "cover",
                      width: "100%",
                      height: "100%"
                    }}
                  />
                </div>
              )} */}
            </div>
          ) : (
            <div
              className="relative flex justify-center items-center w-full h-full"
              style={{
                backgroundColor: "#000",
                width: "100%",
                height: "100%",
                position: "relative",
              }}
            >
              <div className="absolute inset-0 flex justify-center items-center">
                <h2 className="text-white text-xl text-center px-4">
                  {!endConv
                    ? labels.waiting
                    : labels.endConversation}
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>

      <DailyAudio />
    </>
  );
};

export default Call;
