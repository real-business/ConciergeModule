import { useState, useEffect} from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

import { useConfig } from "../../contexts/ConfigContext";

interface SpeechComponentProps {
  avatarName: string;
  disabled?: boolean;
  voiceMode: boolean;
  setSpokenText: (text: string) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setInterruptReplica: (interruptReplica: boolean) => void;
  region: string;
  speechKey: string;
}

const languageMap: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-PT",
  fr: "fr-FR",
  de: "de-DE",
  zh: "zh-CN",
  ja: "ja-JP",
  hi: "hi-IN",
  ar: "ar-SA",
  ru: "ru-RU",
};

export default function SpeechComponent({
  avatarName,
  disabled = false,
  voiceMode,
  setSpokenText,
  setIsSpeaking,
  setInterruptReplica,
  region,
  speechKey
}: SpeechComponentProps) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [recognizer, setRecognizer] = useState<SpeechSDK.SpeechRecognizer | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSelectedLanguage(localStorage.getItem("lang") || "en");
    }
  }, []);

  const enoughCredits = true;

  const tooltipText = !enoughCredits ? "Please upgrade your credits to continue" : isMicOn
    ? `You're now talking to ${avatarName}`
    : `Click here to talk to ${avatarName}`;

  useEffect(() => {
    if (isMicOn) {
      startContinuousRecognition();
    } else {
      stopContinuousRecognition();
    }

    return () => {
      stopContinuousRecognition();
    };
  }, [isMicOn]);

  const startContinuousRecognition = async () => {
    try {
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        speechKey,
        region
      );
      speechConfig.speechRecognitionLanguage = languageMap[selectedLanguage || "en"];
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const newRecognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

      newRecognizer.recognizing = (_, e) => {
        console.log(`RECOGNIZING: Text=${e.result.text}`);
      };

      newRecognizer.recognized = (_, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          console.log(`RECOGNIZED: Text=${e.result.text}`);
          if (e.result.text) {
            setSpokenText(e.result.text);
            setIsMicOn(false);
            setIsSpeaking(false);
            setInterruptReplica(false);
          }
        }
      };

      newRecognizer.canceled = (_, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);
        if (e.reason === SpeechSDK.CancellationReason.Error) {
          console.error(`ERROR: Details=${e.errorDetails}`);
        }
        setIsMicOn(false);
        setIsSpeaking(false);
      };

      newRecognizer.sessionStopped = () => {
        setIsMicOn(false);
        setIsSpeaking(false);
      };

      await newRecognizer.startContinuousRecognitionAsync();
      setRecognizer(newRecognizer);
      setIsSpeaking(true);
      setInterruptReplica(true);
    } catch (error) {
      console.error("Error starting continuous recognition:", error);
      setIsMicOn(false);
      setIsSpeaking(false);
    }
  };

  const stopContinuousRecognition = async () => {
    if (recognizer) {
      try {
        await recognizer.stopContinuousRecognitionAsync();
        recognizer.close();
        setRecognizer(null);
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
  };

  const handleMicToggle = () => {
    if (disabled || isInitializing || !enoughCredits) return;
    setIsMicOn(!isMicOn);
  };

  if (!voiceMode) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleMicToggle}
            disabled={disabled || isInitializing || !enoughCredits}
            className="rounded-full bg-primary hover:bg-secondary h-9 w-9"
          >
            {isInitializing ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : isMicOn ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
