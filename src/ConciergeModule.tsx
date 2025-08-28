import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Chat, ChatMessage } from "./components/ui/chat"
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  LucideIcon,
  HelpCircle,
  GraduationCap,
  MessageSquare,
  Sparkles,
  CheckCircle,
  ThumbsDown,
  ThumbsUp
} from "lucide-react";
import SpeechComponent from "./components/voice/SpeechComponent";
import { chatCompletionAPI } from "./lib/api/azure-chat-api";
import postLLMTrainingAPI from "./lib/api/llm-training-api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { batchTranslateText } from "./lib/batchTranslateText";
// Import avatar images
import ConversationComponent, { ConversationComponentHandle } from "./components/replica/ConversationComponent";
import { postChatHistory } from "./lib/api/post-chat-history";
import { getAllAvatarsAPI, AvatarProfile } from "./lib/api/get-all-avatars-api";
import SSRSafeWrapper from "./components/SSRSafeWrapper";
import { cn } from "./lib/utils";
import { useMediaQuery } from "@mui/material";

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

const defaultPrompts: SuggestedPrompt[] = [
  { id: 1, text: "Explain my report", icon: GraduationCap },
  { id: 5, text: "Analyze my medical reports.", icon: Sparkles },
  { id: 6, text: "Answer my questions like a personal coach", icon: MessageSquare },
];

const AVATAR_ID = "r89e4f7ec536";

export default function ConciergeModule({
    brandName = "Growth Hub",
    className= "",
    personaName = "Personal AI Concierge",
    suggestedPrompts = defaultPrompts,
    welcomeMessage = "Hi there! I'm your personal health navigator. I can help you understand your lab results, explain medical terminology, and provide personalized health insights. Go ahead and upload any lab test or medical report. If you don’t have one, lets just talk.",
    language = "en",
    navigateTo = "",
    file,
    onFileChange,
    onApiResponse,
    config = {
      region: "",
      apiBaseUrl: "",
      speechKey: "",
      azureTranslatorKey: "",
      azureTranslatorEndpoint: "",
      azureTranslatorRegion: "",
    },
}: ConciergeModuleProps) {
  const [dbAvatars, setDbAvatars] = useState<AvatarProfile[]>([]);
  // Always use the single avatar
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [interactionMode, setInteractionMode] = useState<"chat" | "voice">("chat");
  const [conciergeConversationStarted, setConciergeConversationStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  // Add feedback state
  const [feedback, setFeedback] = useState<Record<string, "like" | "dislike">>({});
  const [sessionId, setSessionId] = useState("");
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [showBuyNowButton, setShowBuyNowButton] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [userInput, setUserInput] = useState("");
  const convoRef = useRef<ConversationComponentHandle>(null);
  // decoupling redux state
  const [spokenText, setSpokenText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interruptReplica, setInterruptReplica] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [currentScript, setCurrentScript] = useState("");
  const [replicaId, setReplicaId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [conversationUrl, setConversationUrl] = useState("");
  const [conversationStarted, setConversationStarted] = useState(false);
  const translatedLangRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const mobile = useMediaQuery("(max-width: 768px)");
  const [reportReady, setReportReady] = useState(false);
  const [userId, setUserId] = useState("52533633434137384342")
  const [translatedTexts, setTranslatedTexts] = useState<{
    avatar: {
      chooseAvatar: string;
      startConversation: string;
      yourAIHealthNavigator: string;
      description: string;
    },
      buttons: {
        resetChat: string;
        retry: string;
        continue: string;
        signUp: string;
        uploading: string;
        upload: string;
        buyNow: string;
      },
      howItWorks: {
        title: string;
        steps: string[];
      }
  }>({avatar: {
    chooseAvatar: `Choose Your ${personaName}`,
    startConversation: `Start Conversation`,
    yourAIHealthNavigator: `Your ${personaName}`,
    description: `I'm here to help you with your health and wellness.`
  },
    buttons: {
      resetChat: `Reset Chat`,
      retry: `Retry`,
      continue: `Continue`,
      signUp:  `Sign Up Free`,
      uploading: `Uploading...`,
      upload: `Upload report`,
      buyNow: `Buy now`
    },
    howItWorks: {
      title: `How It Works`,
      steps: [
        `Your AI ${personaName} asks you questions to find out how ${brandName} can help you.`,
        `The ${personaName} will personalize recommendations based on your needs`, 
        `Access tailored resources, courses, and marketplace options.`
      ]
    }
  });

  // on initial load, scroll to the top of the page
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  // Fetch only the single avatar from database
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await getAllAvatarsAPI();
        if (response?.Success && response.Data) {
          // Find only the avatar with the specified ID
          const avatar = response.Data.find((avatar: AvatarProfile) => avatar.ExternalId === AVATAR_ID);
          if (avatar) {
            setDbAvatars([avatar]);
            setSelectedAvatar(avatar);
          }
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };
    fetchAvatar();
  }, []);

  // Remove avatar selection on language change
  // Remove useEffect that sets avatar based on language

  useEffect(() => {
    if (conversationStarted) {
      setInteractionMode("voice");
    } else {
      setInteractionMode("chat");
    }
  }, [conversationStarted]);

  useEffect(() => {
    if(navigateTo.includes("demo")){
      setUserId("52533144413937384342");
    }
  }, [navigateTo]);

  useEffect(() => {
    const canTranslate =
      !!config?.azureTranslatorKey &&
      !!config?.azureTranslatorEndpoint &&
      !!config?.azureTranslatorRegion;

    if (!canTranslate) {
      console.warn("Azure translation config is not yet ready.");
      return;
    }

    const translate = async () => {
      // Always run on language change
      if (language !== "en" && translatedLangRef.current !== language) {
        const [
          chooseAvatar,
          startConversation,
          yourAIHealthNavigator,
          description,
          resetChat,
          retry,
          btnContinue,
          signUp,
          uploading,
          upload,
          buyNow,
          title,
          step1,
          step2,
          step3
        ] = await batchTranslateText(
          [
            `Choose Your ${personaName}`,
            `Start Conversation`,
            `Your ${personaName}`,
            `I'm here to help you with ${brandName}.`,
            `Reset Chat`,
            `Retry`,
            `Continue`,
            `Sign Up Free`,
            `Uploading...`,
            `Upload Report`,
            `Buy Now`,
            `How It Works`,
            `Your AI ${personaName} asks you questions to find out how ${brandName} can help you.`,
            `The ${personaName} will personalize recommendations based on your needs`,
            `Access tailored resources, courses, and marketplace options.`
          ],
          language,
          "en",
          config.azureTranslatorKey,
          config.azureTranslatorEndpoint,
          config.azureTranslatorRegion
        );

        setConciergeConversationStarted(false);
        setSessionId("");
        setChatMessages([]);
        setTranslatedTexts({
          avatar: {
            chooseAvatar,
            startConversation,
            yourAIHealthNavigator,
            description
          },
          buttons: {
            resetChat,
            retry,
            continue: btnContinue,
            signUp,
            uploading,
            upload,
            buyNow

          },
          howItWorks: {
            title,
            steps: [step1, step2, step3]
          }
        });

        translatedLangRef.current = language; // ✅ remember this translation
      }

      if (language === "en" && translatedLangRef.current !== "en") {
        setConciergeConversationStarted(false);
        setSessionId("");
        setChatMessages([]);
        setTranslatedTexts({
          avatar: {
            chooseAvatar: `Choose Your ${personaName}`,
            startConversation: `Start Conversation`,
            yourAIHealthNavigator: `Your ${personaName}`,
            description: `I'm here to help you with ${brandName}.`
          },
          buttons: {
            resetChat: `Reset Chat`,
            retry: `Retry`,
            continue: `Continue`,
            signUp:`Sign Up Free`,
            uploading: `Uploading...`,
            upload: `Upload Report`,
            buyNow: 'Buy Now'
          },
          howItWorks: {
            title: `How It Works`,
            steps: [
              `Your AI ${personaName} asks you questions to find out how ${brandName} can help you.`,
              `The ${personaName} will personalize recommendations based on your needs`,
              `Access tailored resources, courses, and marketplace options.`
            ]
          }
        });

        translatedLangRef.current = "en";
      }
    };

    translate();
  }, [
    language,
    config?.azureTranslatorKey,
    config?.azureTranslatorEndpoint,
    config?.azureTranslatorRegion,
    personaName,
    brandName
  ]);

  // handle file upload from the parent component
  useEffect(() => {
    if (file) {
      setUploadedFiles([file]);
      // Automatically process the file
      handleSendMessage(`Uploaded file: ${file.name}`, [file]);
    }
  }, [file]);

  // Create welcome message function to generate consistent format
  const getWelcomeMessage = useCallback(
    async (avatar: AvatarProfile): Promise<ChatMessage> => {
      setIsLoading(true);
      let prompt = `I am user`;
              const firstMessage =  await chatCompletionAPI(prompt, 
            "",
            "",
            "interview",
            sessionId,
            0,
            1,
            language

          )
        if (firstMessage.Success && firstMessage.Data?.Message) {
          if(firstMessage.Data.Message.includes("ERROR")) {
            setIsLoading(false);
            setCurrentScript(`Hello there! I'm ${avatar?.Name}, your ${personaName}. I'm here to help you with ${brandName}. Can you tell me your name?`);
            return {
              id: "welcome-message",
              sender: "ai",
              text: `Hello there! I'm ${avatar?.Name}, your ${personaName}. I'm here to help you with ${brandName}. Can you tell me a little about yourself?`,
              timestamp: new Date(),
            };
          }
          setIsLoading(false);
          setSessionId(firstMessage.Data.SessionId || "");
          setCurrentScript(firstMessage.Data.Message);
          return {
            id: "welcome-message",
            sender: "ai",
            text: firstMessage.Data.Message,
            timestamp: new Date(),
          };
        } else {
          setIsLoading(false);
          return {
            id: "welcome-message",
            sender: "ai",
            text: `Hello there! I'm ${avatar?.Name}, your ${personaName}. I'm here to help you with ${brandName}. Can you tell me a little about yourself?`,
            timestamp: new Date(),
          };
        }
    },
    [brandName],
  );

  // Initialize messages with welcome message when component mounts
  // useEffect(() => {
  //   if (conversationStarted) {
  //     getWelcomeMessage(selectedAvatar || dbAvatars[0]).then((welcomeMessage) => {
  //       setChatMessages([welcomeMessage]);
  //     });
  //   }
  // }, [conversationStarted]);

  // Sync interaction mode with voice mode in Redux
  useEffect(() => {
    setVoiceMode(true);
  }, []);

  // Process spoken text when available
  useEffect(() => {
    if (spokenText && spokenText.trim() !== "") {
      handleSendMessage(spokenText);
      setSpokenText("");
    }
  }, [spokenText]);

  useEffect(() => {
    if (conversationStarted) {
      setConciergeConversationStarted(true);
    } else {
      setConciergeConversationStarted(false);
    }
  }, [conversationStarted]);

  // Remove handleAvatarChange function

  const handleSendMessage = async (userInput: string, additionalFiles: File[] = []) => {
    if(showRetryButton) {
      setShowRetryButton(false);
    }
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userInput === "yes, continue" ? "Yes" : userInput,
      timestamp: new Date(),
    };
    setUserInput(userInput);
    setChatMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    let prompt = `${userInput}`;

     // Combine state files with additional files passed as parameter
    const filesToSend = [...uploadedFiles, ...additionalFiles];
    if (filesToSend.length > 0) {
      prompt += 'Talk to me in plain, friendly language for adults with no medical background — clear, supportive, and free of medical jargon. Only include the most important points. Also, list anything in the file that should be double-checked or reviewed.'
    }

    if(userInput === "yes, continue"){
      prompt += `Start the interview. User clicked continue.`
    }

    try {
      // Fetch AI response
      const response = await chatCompletionAPI(
        prompt,
        userId, // Send user ID instead of email - for testing hardcoding the userID
        "", // Business ID
        "interview", // Intent
        sessionId,
        0,
        1,
        language,
        filesToSend.length > 0 ? filesToSend[0] : undefined // Only send last file
      );

      if (response.Success && response.Data?.Message) {
        if(response?.Data?.Message?.toLowerCase().includes("error") || response?.Data?.Type === "error") {
          setIsLoading(false);
          // Handle error
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: "Sorry, I couldn't process your request at the moment. Please try again.",
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, errorMessage]);
          setCurrentScript(errorMessage.text);
          setShowRetryButton(true);
          return;
        }
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: response.Data.Message,
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, aiMessage]);
        if(!sessionId) {
          setSessionId(response?.Data?.SessionId || "");
        }
        setCurrentScript(response.Data.Message);
        setReportReady(true);

        //Check for continue button
        if(
          response.Data.Message.toLowerCase().includes("click continue")||
          response.Data.Message.toLowerCase().includes("continue")
        ) {
          setShowContinueButton(true);
        }

        // Check if the response matches the profile completion message
        if (
          response.Data.Message.toLowerCase().includes("sign up") ||
          response.Data.Message.toLowerCase().includes("thank you for choosing") ||
          response.Data.Message.toLowerCase().includes("ready to connect")
        ) {
          setInterviewCompleted(true);
        }

        // Check for buy now
       if(
          response.Data.Message.toLowerCase().includes("buy now")||
          response.Data.Message.toLowerCase().includes("ready to get your test kit")
        ) {
          setShowBuyNowButton(true);
        }

        // Notify parent of the api response
        if (onApiResponse) {
            onApiResponse(response);
          }

        await postChatHistory(
          "",
          "AIReportReader",
          userInput,
          response.Data.Message || "",
          interactionMode === "voice", //isUserUsingAvatar
          userInput === spokenText // isUserSpeaking
      )
      setUserInput(""); // only when the message is sent
      } else {
        // Handle error
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, errorMessage]);
        setCurrentScript(errorMessage.text);
        setShowRetryButton(true);
      }
    } catch (error) {
      console.error("Error fetching response from LLM: ", error);
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Sorry, I couldn't connect to the AI service. Please try again later.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
      setCurrentScript(errorMessage.text);
      setShowRetryButton(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat visibility toggle
  const toggleChatVisibility = () => {
    console.log("Toggle chat visibility");
  };

  const handleStartAdvisor = () => {
    if (typeof window !== "undefined") {
      if (navigateTo) {
        window.location.href = navigateTo;
      } else {
        window.location.href = "https://growth-hub-git-feature-whitelabeljun25v1-real-business.vercel.app/auth/register";
      }
    }
  }

  // Add feedback handler
  const handleFeedback = (message: ChatMessage, type: "like" | "dislike") => {
    const feedbackValue = type === "like";

    setFeedback(prev => ({
      ...prev,
      [message.id]: type,
    }));

    // Send feedback to the API

      postLLMTrainingAPI(
        message.text,
        "",
        "",
        feedbackValue
      ).then((response: { Success: boolean; Message: string }) => {
        //console.log("Feedback response:", response);
      }).catch((error: Error) => {
        console.error("Error sending feedback:", error);
      });
  };

  // File upload handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    const files = Array.from(event.target.files || []);

    if (files.length > 0) {
      // Only take the first file
      const file = files[0];

      // Replace any existing files with just this one
      setUploadedFiles([file]);

      // Notify parent of file change
      if (onFileChange) {
        onFileChange(file);
      }

      setIsUploading(false);

      // Send message about the uploaded file
      await handleSendMessage(`Uploaded file: ${file.name}`, [file]);
    }

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
  <div className={cn("h-full min-h-0", className)}>
    <Card className="h-full min-h-0 flex flex-col overflow-hidden border border-primary/20 shadow-2xl relative">
      {/* Header (fixed height) */}
      {/* <CardHeader className="shrink-0 p-4 sm:p-6 bg-neutral border-b border-primary/20">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center flex-shrink min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
              <img
                src={selectedAvatar?.ImageUrl}
                alt={selectedAvatar?.Name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-primary leading-tight truncate">
                {translatedTexts.avatar.yourAIHealthNavigator}
              </h1>
            </div>
          </div>
          <div className="hidden md:flex gap-2 flex-wrap ml-4">
            {brandName !== "CareNexa" && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-primary border-primary/30 hover:bg-neutral"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                <Upload className="h-3 w-3 mr-1" />
                {isUploading ? translatedTexts.buttons.uploading : translatedTexts.buttons.upload}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-primary border-primary/30 hover:bg-neutral"
              onClick={resetChat}
            >
              {translatedTexts.buttons.resetChat}
            </Button>
          </div>
          <div className="flex md:hidden items-center ml-2">
            <button
              className="p-2 rounded-md border border-primary/20 bg-white text-primary focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-2 flex flex-col gap-2 animate-fadeIn">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-primary border-primary/30 hover:bg-neutral"
              onClick={() => {
                handleUploadClick();
                setMenuOpen(false);
              }}
              disabled={isUploading}
            >
              <Upload className="h-3 w-3 mr-1" />
              {isUploading ? translatedTexts.buttons.uploading : translatedTexts.buttons.upload}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-primary border-primary/30 hover:bg-neutral"
              onClick={() => {
                resetChat();
                setMenuOpen(false);
              }}
            >
              {translatedTexts.buttons.resetChat}
            </Button>
          </div>
        )}
      </CardHeader> */}

      {/* Main (fills remaining height) */}
      <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
        {/* 2 columns; both constrained by min-h-0 */}
        <div className="h-full min-h-0 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {/* LEFT pane */}
          <section className="min-h-0 overflow-hidden p-4 md:p-6 border-b md:border-b-0 md:border-r border-primary/20">
            <div className="h-full w-full min-h-0">
              {conciergeConversationStarted ? (
                <div className="h-full w-full rounded-xl overflow-hidden bg-white">
                  {selectedAvatar && (
                    <SSRSafeWrapper fallback={<div className="w-full h-full bg-gray-200 rounded animate-pulse flex items-center justify-center">Loading conversation...</div>}>
                    <div className="hidden md:block text-center mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                        <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        {reportReady ? `🎉 Your Report Analysis is Ready!` : `Report analysis in progress`  }
                      </h2>
                    </div>
                      <ConversationComponent
                        ref={convoRef}
                        replicaId={selectedAvatar?.ExternalId || ""}
                        personaId="pb5d44035dbd"
                        personaName={personaName}
                        conversationName={`Conversation with ${selectedAvatar?.Name || "your" + personaName} ${new Date().toISOString()}`}
                        conversationalContext="Initial medical consultation"
                        customGreeting={
                          chatMessages.length > 0 && chatMessages[chatMessages.length - 1].sender === "ai"
                            ? chatMessages[chatMessages.length - 1].text
                            : welcomeMessage
                        }
                        platform="concierge"
                        buttonText={translatedTexts.avatar.startConversation}
                        videoMode="minimal"
                        chatVisible={false}
                        toggleChat={toggleChatVisibility}
                        width="100%"
                        height={mobile ? "250px" : "55%"}
                        className="w-full h-full"
                        setVoiceMode={setVoiceMode}
                        setConversationStarted={setConversationStarted}
                        setConversationId={setConversationId}
                        setConversationUrl={setConversationUrl}
                        setInterruptReplica={setInterruptReplica}
                        currentScript={currentScript}
                        setCurrentScript={setCurrentScript}
                        interruptReplica={interruptReplica}
                        setIsSpeaking={setIsSpeaking}
                        setSpokenText={setSpokenText}
                        region={config?.region || ""}
                        speechKey={config?.speechKey || ""}
                        config={config}
                      />
                      <div className="hidden md:block bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 mb-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src={selectedAvatar?.ImageUrl}
                              alt={selectedAvatar?.Name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-gray-800 leading-relaxed">
                              <strong className="text-[#3f62ec]">
                                {personaName}:
                              </strong>{" "}
                              {reportReady ? (
                                <>Great news! I’ve analyzed your {file?.name ?? "health report"} and found some important insights for you.</>
                              ) : (
                                <>Analyzing {file?.name ?? "your report"}… this usually takes a few seconds.</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </SSRSafeWrapper>
                  )}
                </div>
              ) : (
                 <div className="flex flex-col items-center text-center">
                  <div className="hidden md:block text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                      <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      {reportReady ? `🎉 Your Report Analysis is Ready!` : `Report analysis in progress`  }
                    </h2>
                  </div>
                  <div className="mb-4 flex flex-col items-center gap-2">
                    <img
                      src={selectedAvatar?.ImageUrl} 
                      alt={selectedAvatar?.Name}
                      className="w-full max-w-sm h-auto rounded-2xl mx-auto lg:mx-0 shadow-lg"
                      data-testid="img-ai-health-concierge"
                    />
                    <Button
                      onClick={() => setConciergeConversationStarted(true)}
                      className="w-auto bg-[#3f62ec] hover:bg-white hover:text-[#3f62ec] text-white py-3 px-6 rounded-lg font-semibold shadow-md transition"
                    >
                      {translatedTexts.avatar.startConversation}
                    </Button>
                  </div>
                  <div className="hidden md:block bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 mb-6 w-full max-w-xl">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={selectedAvatar?.ImageUrl}
                        alt={selectedAvatar?.Name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-gray-800 leading-relaxed">
                        <strong className="text-[#3f62ec]">
                          {personaName}:
                        </strong>{" "}
                        "Great news! I've analyzed your {file?.name || "health report"} and found some important insights for you."
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT pane (Chat) */}
          <section className="min-h-0 overflow-hidden p-4 md:p-6">
            <div className="h-full min-h-0 flex flex-col overflow-hidden">
              <Chat
                language={language}
                config={config}
                setInterruptReplica={setInterruptReplica}
                messages={chatMessages}
                welcomeMessage={welcomeMessage}
                onSendMessage={handleSendMessage}
                className="h-full min-h-0"
                isLoading={isLoading}
                rightElement={
                  <SSRSafeWrapper fallback={<div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>}>
                    <SpeechComponent
                      avatarName={selectedAvatar?.Name || "AI Health Navigator"}
                      disabled={isLoading}
                      voiceMode={voiceMode}
                      setSpokenText={setSpokenText}
                      setIsSpeaking={setIsSpeaking}
                      setInterruptReplica={setInterruptReplica}
                      region={config?.region || ""}
                      speechKey={config?.speechKey || ""}
                    />
                  </SSRSafeWrapper>
                }
                suggestedPrompts={suggestedPrompts}
                renderMessage={(message, index) => {
                  if (message.sender === "ai" && message.id !== "welcome-message") {
                    const isLastMessage = index === chatMessages.length - 1;
                    return (
                      <div className="relative">
                        {/* <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="text-sm mb-2 break-words">{children}</p>,
                            ol: ({ children }) => <ol className="list-decimal ml-6 mb-2">{children}</ol>,
                            ul: ({ children }) => <ul className="list-disc ml-6 mb-2">{children}</ul>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            img: (props) => <img {...props} className="max-w-full max-h-64 object-contain rounded" />,
                            code: ({ children }) => <code className="break-words whitespace-pre-wrap">{children}</code>,
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.text}
                        </ReactMarkdown> */}
                        <ReactMarkdown>
                          {message.text}
                        </ReactMarkdown>
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  className={`p-1 rounded-full transition-colors ${feedback[message.id] === "like"
                                    ? "bg-green-100 text-green-600"
                                    : "hover:bg-gray-200 text-gray-600"
                                    }`}
                                  onClick={() => handleFeedback(message, "like")}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                                <button
                                  className={`p-1 rounded-full transition-colors ${feedback[message.id] === "dislike"
                                    ? "bg-red-100 text-red-600"
                                    : "hover:bg-gray-200 text-gray-600"
                                    }`}
                                  onClick={() => handleFeedback(message, "dislike")}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </button>
                              </div>
                               {/* Add Retry button only on the last AI message */}
                               {showRetryButton && isLastMessage && (
                                <div className="mt-4 flex">
                                  <button
                                    className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
                                    onClick={() => {
                                      handleSendMessage(userInput);
                                      setShowRetryButton(false);
                                    }}
                                  >
                                    {translatedTexts.buttons.retry}
                                  </button>
                                </div>
                              )}
                              {/* Add Continue button if this is the last message and showContinue is true */}
                              {isLastMessage && reportReady && (
                                <div className="mt-4 flex justify-center">
                                  <button
                                    className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
                                    onClick={handleStartAdvisor}
                                  >
                                    Join Unicorn Health
                                  </button>
                                </div>
                              )}
                              {/* Add SignUp button if this is the last message and interview is completed
                              {isLastMessage && interviewCompleted && (
                                <div className="mt-4 flex justify-center">
                                  <button
                                    className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
                                    onClick={handleStartAdvisor}
                                  >
                                    {translatedTexts.buttons.signUp}
                                  </button>
                                </div>
                              )} */}
                            </div>
                          );
                        }
                  return (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  );
                }}
              />
            </div>
          </section>
        </div>
      </CardContent>

      {/* Decorative blobs (stay inside Card so they don’t affect layout) */}
      <div className="pointer-events-none absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
    </Card>

    {/* Hidden file input */}
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileUpload}
      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
      className="hidden"
    />
  </div>
)
};