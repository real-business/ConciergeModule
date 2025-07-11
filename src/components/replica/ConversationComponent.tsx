import {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import WelcomeScreen from "./WelcomeScreen";
import HairCheckScreen from "./HairCheckScreen";
import CallScreen from "./CallScreen";
import {
  createConversationApi,
  endConversation,
} from "../../lib/api/tavus-api";
import { DailyProvider } from "@daily-co/daily-react";
import { getAllAvatarsAPI, AvatarProfile } from "../../lib/api/get-all-avatars-api";
import { supportedLanguages } from "../../lib/i18n";
import { useConfig } from "../../contexts/ConfigContext";

type Conversation = {
  conversation_id: string;
  conversation_url: string;
  [key: string]: any;
};

type ConversationComponentProps = {
  // Required connection props
  roomUrl?: string;
  userName?: string;
  // Previous required props - now optional with defaults for demo mode
  replicaId?: string;
  personaId?: string;
  conversationName?: string;
  conversationalContext?: string;
  customGreeting?: string;
  platform?: string;
  buttonText?: string;
  videoMode?: string | null;
  chatVisible?: boolean;
  toggleChat?: () => void;
  learningPrompts?: string[];
  onPromptClick?: (prompt: string) => void;
  // Style props for adjustable dimensions
  width?: string | number;
  height?: string | number;
  maxWidth?: string | number;
  className?: string;
  setVoiceMode: (voiceMode: boolean) => void;
  setConversationStarted: (conversationStarted: boolean) => void;
  setConversationId: (conversationId: string) => void;
  setConversationUrl: (conversationUrl: string) => void;
  setInterruptReplica: (interruptReplica: boolean) => void;
  currentScript: string;
  setCurrentScript: (currentScript: string) => void;
  interruptReplica: boolean;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setSpokenText: (spokenText: string) => void;
  region: string;
  speechKey: string;
  config: {
    azureTranslatorKey: string;
    azureTranslatorEndpoint: string;
    azureTranslatorRegion: string;
  };
};

export type ConversationComponentHandle = {
  handleEnd: () => void;
  handleStart: () => void;
};

// Ref methods to expose
export interface ConversationComponentRef {
  handleEnd: () => void;
}

const ConversationComponent = forwardRef<
  ConversationComponentRef,
  ConversationComponentProps
>(
  (
    {
      replicaId = "r82081c7f26d",
      personaId = "pc9cb547c05e",
      conversationName = "Demo Conversation",
      conversationalContext,
      customGreeting,
      platform = "home",
      buttonText,
      videoMode,
      chatVisible,
      toggleChat,
      learningPrompts = [],
      onPromptClick,
      width = "100%",
      height = "100%",
      maxWidth = "2xl",
      className = "",
      setVoiceMode,
      setConversationStarted,
      setConversationId,
      setConversationUrl,
      setInterruptReplica,
      currentScript,
      setCurrentScript,
      interruptReplica,
      setIsSpeaking,
      setSpokenText,
      region,
      speechKey,
      config
    },
    ref,
  ) => {
    const [screen, setScreen] = useState<string>("welcome");
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [endConv, setEndConv] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [avatars, setAvatars] = useState<AvatarProfile[]>([]);
    const [aspectRatio, setAspectRatio] = useState<string>("16:9");
    const { tavusApiKey } = useConfig();
    
    // Use language from localStorage or default to "en"
    const selectedLanguage = localStorage.getItem("lang") || "en";
    
    const languageName = supportedLanguages.find(lang => lang.code === selectedLanguage)?.name || "English";
    const previousLanguageRef = useRef(localStorage.getItem("lang") || "en");
    // Fetch avatars if none are found
    useEffect(() => {
      const fetchAvatars = async () => {
        if (avatars.length === 0) {
          try {
            const response = await getAllAvatarsAPI();
            if (response?.Success && response.Data) {
              setAvatars(response.Data);
              //console.log("Avatars fetched and stored in Redux state:", response.Data);
            }
          } catch (error) {
            console.error("Error fetching avatars:", error);
          }
        }
      };

      fetchAvatars();
    }, [avatars.length]);

    // Find the selected avatar
    const selectedAvatar = avatars.find(avatar => avatar.ExternalId === replicaId);

    useEffect(() => {
      if (
        selectedLanguage &&
        selectedLanguage !== "en" &&
        selectedLanguage !== previousLanguageRef.current
      ) {
        previousLanguageRef.current = selectedLanguage;
        handleEnd();
      }
    }, [selectedLanguage]);

    // Get the avatar's aspect ratio from the image
    useEffect(() => {
      const getImageAspectRatio = async () => {
        if (selectedAvatar?.ImageUrl) {
          const img = new Image();
          img.onload = () => {
            const ratio = img.width / img.height;
            // Round to nearest standard aspect ratio
            if (Math.abs(ratio - 16/9) < Math.abs(ratio - 9/16)) {
              setAspectRatio("16:9");
            } else {
              setAspectRatio("9:16");
            }
          };
          img.onerror = () => {
            setAspectRatio("16:9"); // Default to 16:9 if image fails to load
          };
          img.src = selectedAvatar.ImageUrl;
        }
      };

      getImageAspectRatio();
    }, [selectedAvatar?.ImageUrl]);

    useEffect(() => {
      return () => {
        if (conversation) {
          void endConversation({
            conversationId: conversation.conversation_id,
            apiKey: tavusApiKey
          });
        }
      };
    }, [conversation]);

    useEffect(() => {
      if (platform === "concierge") {
        handleStart()
      }
    }, [platform]);

    const handleStart = async () => {
      try {
        setEndConv(false);
        setLoading(true);
        setVoiceMode(true);
        setConversationStarted(true);
        if (videoRef.current) {
          videoRef.current.pause();
        }
        // Normal API-based conversation creation
        const convo = await createConversationApi({
          replicaId: replicaId || "r82081c7f26d",
          personaId: personaId || "pc9cb547c05e",
          conversationName: conversationName || "Demo Conversation",
          conversationalContext: conversationalContext ?? "",
          customGreeting: customGreeting ?? "",
          language: languageName,
          apiKey: tavusApiKey
        });

        if (convo?.conversation_id && convo.conversation_url) {
          setConversation(convo);
          setConversationId(convo.conversation_id);
          setConversationUrl(convo.conversation_url);
          setScreen("hairCheck");
        } else {
          throw new Error("Failed to start conversation");
        }
      } catch (err) {
        console.error("Conversation error:", err);
      } finally {
        setLoading(false);
      }
    };

    const handleEnd = async () => {
      setEndConv(true);
      setConversationStarted(false);
      try {
        if (!conversation) return;
        await endConversation({ conversationId: conversation.conversation_id, apiKey: tavusApiKey });
      } catch (error) {
        console.error(error);
      } finally {
        setConversation(null);
        setScreen("welcome");
      }
    };

    const handleJoin = () => {
      setScreen("call");
    };

    useImperativeHandle(ref, () => ({
      handleEnd,
      handleStart,
    }));

    // Helper functions to handle the dimension types
    const getStringWidth = (width: string | number | undefined): string => 
      typeof width === 'string' ? width : width ? `${width}px` : '100%';
      
    const getStringHeight = (height: string | number | undefined): string => 
      typeof height === 'string' ? height : height ? `${height}px` : '100%';
      
    // Get string dimensions for styling
    const styleWidth = getStringWidth(width);
    const styleHeight = getStringHeight(height);
    
    // Get size variant based on width for button sizing - approximation
    const getButtonSize = (width: string | number | undefined): "sm" | "lg" | "md" | undefined => {
      if (!width) return undefined;
      
      const widthStr = typeof width === 'string' ? width : `${width}px`;
      
      if (widthStr.includes('sm') || parseInt(widthStr) < 350) return 'sm';
      if (widthStr.includes('lg') || parseInt(widthStr) > 600) return 'lg';
      return 'md';
    };
    
    // Calculate max width as string or class name
    const maxWidthStyle = typeof maxWidth === 'string' ? maxWidth : 
                          maxWidth ? `${maxWidth}px` : undefined;
    
    const maxWidthClass = maxWidthStyle && !maxWidthStyle.includes('px') && !maxWidthStyle.includes('%') 
                          ? `max-w-${maxWidthStyle} mx-auto` : '';

    return (
      <main className={`${className} relative w-full h-full`} style={{ width: styleWidth, height: styleHeight }}>
        <DailyProvider>
          <div className={`h-full w-full ${maxWidthClass}`} style={maxWidthStyle && maxWidthStyle.includes('px') ? { maxWidth: maxWidthStyle } : {}}>
            {screen === "welcome" && (
              <WelcomeScreen
                onStart={handleStart}
                loading={loading}
                buttonText={buttonText}
                platform={platform || "home"}
                replicaId={replicaId || "r82081c7f26d"}
                containerClassName={className}
                imageHeight={styleHeight === "100%" ? "auto" : styleHeight}
                buttonSize={getButtonSize(width) || "md"}
                learningPrompts={learningPrompts}
                onPromptClick={onPromptClick}
                userCredits={100}
                avatars={avatars}
                config={config}
              />
            )}
            {screen === "hairCheck" && (
              <HairCheckScreen
                handleEnd={handleEnd}
                handleJoin={handleJoin}
                setScreen={setScreen}
                platform={platform || "home"}
                containerClassName={className}
                videoDimensions={{
                  width: styleWidth,
                  height: styleHeight === "100%" ? "auto" : styleHeight
                }}
                buttonsSize={getButtonSize(width) || "md"}
              />
            )}
            {screen === "call" && conversation && (
              <div className="w-full h-full">
                <CallScreen
                  conversation={conversation}
                  handleEnd={handleEnd}
                  platform={platform || "home"}
                  videoMode={videoMode ?? "full"}
                  endConv={endConv}
                  chatVisible={chatVisible ?? false}
                  toggleChat={toggleChat}
                  containerClassName={className}
                  videoHeight={styleHeight === "100%" ? "auto" : styleHeight}
                  controlsSize={getButtonSize(width) || "md"}
                  aspectRatio={aspectRatio}
                  setInterruptReplica={setInterruptReplica}
                  currentScript={currentScript}
                  setCurrentScript={setCurrentScript}
                  interruptReplica={interruptReplica}
                  setIsSpeaking={setIsSpeaking}
                  setSpokenText={setSpokenText}
                  region={region}
                  speechKey={speechKey}
                  config={config}
                />
              </div>
            )}
          </div>
        </DailyProvider>
      </main>
    );
  },
);

export default ConversationComponent;
