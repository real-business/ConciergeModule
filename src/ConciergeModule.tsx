import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChatMessage } from "./components/ui/chat"
import { Button } from "./components/ui/button";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  LucideIcon,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  GraduationCap,
  Users2,
  Lightbulb,
  Info,
  MessageSquare,
  Sparkles,
  Upload,
  Bot,
  Send,
  Loader2,
  RotateCcw,
  ChevronUp,
  ChevronDown
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
import { cn } from "./lib/utils";

export interface SuggestedPrompt {
  id: number;
  text: string;
  icon: LucideIcon;
}

export interface ConciergeModuleProps {
    brandName: string;
    personaName: string;
    suggestedPrompts?: SuggestedPrompt[];
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

const allowedAvatarIds = [
  "r397c808f1cf",
  "rbc834dee6f2",
  "r89e4f7ec536",
];

const languageDefaultAvatars: Record<string, string> = {
  en: "r397c808f1cf",
  es: "rbc834dee6f2",
  fr: "rbc834dee6f2",
  de: "r89e4f7ec536",
};

export default function ConciergeModule({
    brandName = "Growth Hub",
    personaName = "Personal AI Concierge",
    suggestedPrompts = defaultPrompts,
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
  const [, navigate] = useLocation();
  const [dbAvatars, setDbAvatars] = useState<AvatarProfile[]>([]);
  const conciergeAvatar = dbAvatars.find(avatar => avatar.ExternalId === "r397c808f1cf");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(conciergeAvatar || null);
  const [interactionMode, setInteractionMode] = useState<"chat" | "voice">("chat");
  const [conciergeConversationStarted, setConciergeConversationStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  // Add feedback state
  const [feedback, setFeedback] = useState<Record<string, "like" | "dislike">>({});
  const [sessionId, setSessionId] = useState("");
  const [interviewCompleted, setInterviewCompleted] = useState(false);
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
  const [arePromptsCollapsed, setArePromptsCollapsed] = useState(true);
  const [chatLabels, setChatLabels] = useState<{ 
    insufficientCredits: string, 
    insufficientCreditsDescription: string, 
    placeholder: string, 
    suggestedPrompts: string, 
    thinking: string, 
    retry: string, 
    welcomeMessage: string 
  }>({ 
    insufficientCredits: "Insufficient Credits", 
    insufficientCreditsDescription: "Please purchase more credits to continue.", 
    placeholder: "Type your message...", 
    suggestedPrompts: "Suggested Prompts", 
    thinking: "Thinking...", 
    retry: "Retry", 
    welcomeMessage: "Hi there! I'm your personal health navigator. I can help you understand your lab results, explain medical terminology, and provide personalized health insights. Go ahead and upload the report." 
  });
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
        uploading: string;
        upload: string;
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
      uploading: `Uploading...`,
      upload: `Upload report`
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
    window.scrollTo(0, 0);
  }, []);

  // Fetch avatars from database
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await getAllAvatarsAPI();
        if (response?.Success && response.Data) {
          // Filter avatars once
          const filteredAvatars = response.Data.filter(avatar => 
            allowedAvatarIds.includes(avatar.ExternalId)
          );
          setDbAvatars(filteredAvatars);
          
          // Set initial selected avatar if we have filtered avatars
          if (filteredAvatars.length > 0) {
            setSelectedAvatar(filteredAvatars[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching avatars:", error);
      }
    };

    fetchAvatars();
  }, []);

  useEffect(() => {
    if (!conversationStarted && dbAvatars.length > 0) {
      const preferredAvatarId = languageDefaultAvatars[language] || languageDefaultAvatars["en"];
      const matchedAvatar = dbAvatars.find(a => a.ExternalId === preferredAvatarId);
      if (matchedAvatar) {
        setSelectedAvatar(matchedAvatar);
      } else {
        // Fallback to first if not found
        setSelectedAvatar(dbAvatars[0]);
      }
    }
  }, [dbAvatars, conversationStarted, language]);

  useEffect(() => {
    if (conversationStarted) {
      setInteractionMode("voice");
    } else {
      setInteractionMode("chat");
    }
  }, [conversationStarted]);

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
          uploading,
          upload,
          title,
          step1,
          step2,
          step3,
          insufficientCredits,
          insufficientCreditsDescription,
          placeholder,
          suggestedPrompts,
          thinking,
          retryLabel,
          welcomeMessage
        ] = await batchTranslateText(
          [
            `Choose Your ${personaName}`,
            `Start Conversation`,
            `Your ${personaName}`,
            `I'm here to help you with ${brandName}.`,
            `Reset Chat`,
            `Retry`,
            `Continue`,
            `Uploading...`,
            `Upload Report`,
            `How It Works`,
            `Your AI ${personaName} asks you questions to find out how ${brandName} can help you.`,
            `The ${personaName} will personalize recommendations based on your needs`,
            `Access tailored resources, courses, and marketplace options.`,
            "Insufficient Credits",
            "Please purchase more credits to continue.",
            "Type your message...",
            "Suggested Prompts",
            "Thinking...",
            "Retry",
            "Hi there! I'm your personal health navigator. I can help you understand your lab results, explain medical terminology, and provide personalized health insights. Go ahead and upload the report."
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
            uploading,
            upload

          },
          howItWorks: {
            title,
            steps: [step1, step2, step3]
          }
        });
        setChatLabels({
          insufficientCredits,
          insufficientCreditsDescription,
          placeholder,
          suggestedPrompts,
          thinking,
          retry: retryLabel,
          welcomeMessage
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
            uploading: `Uploading...`,
            upload: `Upload Report`
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
        setChatLabels({
          insufficientCredits: "Insufficient Credits",
          insufficientCreditsDescription: "Please purchase more credits to continue.",
          placeholder: "Type your message...",
          suggestedPrompts: "Suggested Prompts",
          thinking: "Thinking...",
          retry: "Retry",
          welcomeMessage: "Hi there! I'm your personal health navigator. I can help you understand your lab results, explain medical terminology, and provide personalized health insights. Go ahead and upload the report."
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
  useEffect(() => {
    if (conversationStarted) {
      getWelcomeMessage(selectedAvatar || dbAvatars[0]).then((welcomeMessage) => {
        setChatMessages([welcomeMessage]);
      });
    }
  }, [conversationStarted]);

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

  const handleAvatarChange = async (direction: "next" | "prev") => {
    if (!selectedAvatar) return;

    const currentIndex = dbAvatars.findIndex(
      (avatar) => avatar.ExternalId === selectedAvatar.ExternalId
    );
    let newAvatar: AvatarProfile;

    if (direction === "next") {
      const nextIndex = (currentIndex + 1) % dbAvatars.length;
      newAvatar = dbAvatars[nextIndex];
    } else {
      const prevIndex = (currentIndex - 1 + dbAvatars.length) % dbAvatars.length;
      newAvatar = dbAvatars[prevIndex];
    }

    setSelectedAvatar(newAvatar);
  };

  const handleSendMessage = async (userInput: string, additionalFiles: File[] = []) => {
    if(showRetryButton) {
      setShowRetryButton(false);
    }
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userInput,
      timestamp: new Date(),
    };
    setUserInput(userInput);
    setChatMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    let prompt = `${userInput}`;

     // Combine state files with additional files passed as parameter
    const filesToSend = [...uploadedFiles, ...additionalFiles];
    if (additionalFiles.length > 0) {
      prompt += 'Summarize this file in 3–4 very simple sentences, as if you are explaining to a 3rd grader. Only include the most important points. Also, list anything in the file that should be double-checked or reviewed.'
    }
    
    try {
      // Fetch AI response
      const response = await chatCompletionAPI(
        prompt,
        "", // Send user ID instead of email
        "", // Business ID
        "interview", // Intent
        sessionId,
        0,
        1,
        language,
        filesToSend.length > 0 ? filesToSend[0] : undefined // Only send last file
      );

      if (response.Success && response.Data?.Message) {
        if(response?.Data?.Message?.includes("ERROR") || response?.Data?.Type === "error") {
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

        // Check if the response matches the profile completion message
        if (response.Data.Message.toLowerCase().includes("click continue") ||
          response.Data.Message.toLowerCase().includes("sign up") ||
          response.Data.Message.toLowerCase().includes("thank you for choosing") ||
          response.Data.Message.toLowerCase().includes("ready to connect")) {
          setInterviewCompleted(true);
           // Notify parent of API response
          if (onApiResponse) {
            onApiResponse(response);
          }
        }

        await postChatHistory(
          "",
          "AIHealthNavigator",
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
    if (navigateTo) {
      window.location.href = navigateTo;
    } else {
      window.location.href = "https://growth-hub-git-feature-whitelabeljun25v1-real-business.vercel.app/auth/rgister";
    }
  }

  const resetChat = () => {
    setChatMessages([])
  };
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
    <div className="w-full h-full">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg shadow-2xl border border-primary/20 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-neutral border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                      <img
                        src={selectedAvatar?.ImageUrl}
                        alt={selectedAvatar?.Name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-primary">
                        {translatedTexts.avatar.yourAIHealthNavigator}
                      </h1>
                      <p className="text-sm text-secondary">
                        {translatedTexts.avatar.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-primary border-primary/30 hover:bg-neutral"
                      onClick={resetChat}
                    >
                      {translatedTexts.buttons.resetChat}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 h-auto md:h-[600px]">
                {/* Avatar Section - Fixed */}
                <div className="p-4 md:p-6 border-b md:border-b-0 md:border-r border-primary/20 md:h-full overflow-y-auto">
                  <div className="h-full w-full">
                    {conciergeConversationStarted ? (
                      <div className="h-full w-full rounded-xl overflow-hidden bg-gradient-to-br from-neutral to-white border border-primary/20">
                        {selectedAvatar && (
                          <ConversationComponent
                            ref={convoRef}
                            replicaId={selectedAvatar?.ExternalId || ""}
                            personaId="pb5d44035dbd"
                            conversationName={`Conversation with ${selectedAvatar?.Name || "your" + personaName} ${new Date().toISOString()}`}
                            conversationalContext="Initial business consultation"
                            customGreeting={
                              chatMessages.length > 0 && chatMessages[chatMessages.length - 1].sender === 'ai'
                                ? chatMessages[chatMessages.length - 1].text
                                : `Hello there! I'm ${selectedAvatar?.Name}, your ${personaName}. I'm here to help you on the ${brandName}. Ready to get started?`
                            }
                            platform="concierge"
                            buttonText={translatedTexts.avatar.startConversation}
                            videoMode="minimal"
                            chatVisible={false}
                            toggleChat={toggleChatVisibility}
                            width="100%"
                            height="100%"
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
                        )}
                      </div>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-center mb-4 text-primary">{translatedTexts.avatar.chooseAvatar}</h3>
                        
                        {/* How it works */}
                        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-secondary">
                          <div className="relative group">
                            <div className="flex items-center gap-2 cursor-help">
                              <HelpCircle className="h-4 w-4 text-primary hover:text-secondary transition-colors" />
                              <span>{translatedTexts.howItWorks.title}</span>
                            </div>
                            <div className="absolute left-1 -translate-x-1 bottom-full mb-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-primary/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <h4 className="font-medium text-primary mb-2">{translatedTexts.howItWorks.title}</h4>
                              {translatedTexts.howItWorks.steps.map((step: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="font-bold flex-shrink-0">{index + 1}.</span>
                                  <span className="break-words">{step}</span>
                                </li>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Avatar */}
                        <div className="w-48 h-48 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-neutral to-white border border-primary/20">
                          <img
                            src={selectedAvatar?.ImageUrl}
                            alt={selectedAvatar?.Name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-6">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAvatarChange("prev")}
                            className="rounded-full"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-primary font-medium">
                            {selectedAvatar?.Name}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAvatarChange("next")}
                            className="rounded-full"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          onClick={() => setConciergeConversationStarted(true)}
                          className="w-full bg-primary hover:bg-secondary text-white py-3 px-6 rounded-lg font-semibold shadow-md transition"
                        >
                          {translatedTexts.avatar.startConversation}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Section - Scrollable */}
                <div className="
                  flex flex-col
                  max-h-[70vh] overflow-y-auto
                  md:max-h-none md:h-full md:overflow-visible
                  p-4 md:p-6
                ">
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="flex flex-col h-full bg-white rounded-lg border border-primary/20 overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-3 bg-white/80">
                        <div className="space-y-3">
                          {chatMessages?.length === 0 ? (
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                                <Bot size={14} />
                              </div>
                                                             <div className="ml-2 px-3 py-2 rounded-lg bg-secondary/10">
                                 <div className="text-sm text-secondary">
                                   {chatLabels.welcomeMessage}
                                 </div>
                               </div>
                            </div>
                          ) : (
                            chatMessages?.map((message, index) => {
                              const isLastMessage = index === chatMessages.length - 1;
                              const isLastAIMessage = isLastMessage && message.sender === "ai";
                              const shouldShowRetry = showRetryButton && isLastAIMessage && message.sender === "ai";
                              
                              return (
                                <div
                                  key={message.id}
                                  className={cn(
                                    "flex",
                                    message.sender === "user" ? "justify-end" : "justify-start",
                                    "mb-4"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "max-w-[80%] rounded-lg p-3",
                                      message.sender === "user"
                                        ? "bg-primary text-white"
                                        : "bg-light text-secondary"
                                    )}
                                  >
                                    {message.sender === "user" ? (
                                      <div className="text-sm">{message.text}</div>
                                    ) : (
                                      <div className="text-sm">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                            p: ({ children }) => <p className="text-sm mb-2">{children}</p>,
                                            ol: ({ children }) => <ol style={{ listStyleType: 'circle' }} className="ml-6 mb-2">{children}</ol>,
                                            ul: ({ children }) => <ul className="list-disc ml-6 mb-2">{children}</ul>,
                                            li: ({ children }) => <li className="mb-1">{children}</li>,
                                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                            a: ({ href, children }) => (
                                              <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline"
                                              >
                                                {children}
                                              </a>
                                            ),
                                          }}
                                        >
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
                                        {shouldShowRetry && (
                                          <div className="mt-4 flex">
                                            <button
                                              className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
                                              onClick={() => {
                                                handleSendMessage(userInput);
                                                setShowRetryButton(false);
                                              }}
                                            >
                                              {chatLabels.retry}
                                            </button>
                                          </div>
                                        )}
                                        {/* Add Continue button if this is the last message and interview is completed */}
                                        {isLastMessage && interviewCompleted && (
                                          <div className="mt-4 flex justify-center">
                                            <button
                                              className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
                                              onClick={handleStartAdvisor}
                                            >
                                              {translatedTexts.buttons.continue}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}

                          {isLoading && (
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                                <Bot size={14} />
                              </div>
                              <div className="ml-2 px-3 py-2 rounded-lg bg-secondary/10 flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                                                                 <span className="text-sm text-secondary">{chatLabels.thinking}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-3 border-t border-light bg-white flex-shrink-0">
                        {/* Collapsible Suggested Prompts */}
                        {suggestedPrompts && suggestedPrompts?.length > 0 && (
                          <div className="bg-white border-b border-light flex-shrink-0">
                            <button
                              onClick={() => setArePromptsCollapsed(!arePromptsCollapsed)}
                              className="w-full p-2 flex items-center justify-center hover:bg-secondary/10 transition-colors"
                            >
                                                             <span className="text-sm font-medium text-secondary">
                                 {chatLabels.suggestedPrompts}
                               </span>
                              {arePromptsCollapsed ? (
                                <ChevronDown className="h-4 w-4 text-secondary" />
                              ) : (
                                <ChevronUp className="h-4 w-4 text-secondary" />
                              )}
                            </button>
                            {!arePromptsCollapsed && (
                              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {suggestedPrompts.map(({id, text, icon: Icon}) => (
                                  <Button
                                    key={id}
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left text-sm h-auto min-h-[40px] py-2 px-3",
                                      "whitespace-normal break-words"
                                    )}
                                    onClick={() => setUserInput(text)}
                                  >
                                    <Icon className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                                    <span className="text-left">{text}</span>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="shrink-0">
                          <textarea
                            value={userInput}
                            onChange={(e) => {
                              setUserInput(e.target.value);
                              setInterruptReplica(true);
                              // Auto-resize the textarea
                              e.target.style.height = 'auto';
                              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (userInput.trim() !== "" && !isLoading) {
                                  handleSendMessage(userInput);
                                  setUserInput("");
                                }
                              }
                            }}
                                                         placeholder={chatLabels.placeholder}
                            className="flex-1 rounded-l-lg rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 border-r-0 resize-none min-h-[40px] max-h-[120px] p-3 text-sm border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isLoading}
                            rows={1}
                          />
                          <Button
                            onClick={() => {
                              if (userInput.trim() !== "" && !isLoading) {
                                handleSendMessage(userInput);
                                setUserInput("");
                              }
                            }}
                            className="rounded-l-none bg-primary hover:bg-secondary h-[40px]"
                            disabled={userInput.trim() === "" || isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Send size={18} />
                            )}
                          </Button>

                          <div className="ml-2">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
      </div>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        style={{ display: 'none' }}
      />
    </div>
  );
}