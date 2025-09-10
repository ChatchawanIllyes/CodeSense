import React, { useState } from "react";
import { Button } from "./ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface TextToSpeechButtonProps {
  className?: string;
}

export function TextToSpeechButton({ className }: TextToSpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] =
    useState<SpeechSynthesis | null>(null);

  React.useEffect(() => {
    if ("speechSynthesis" in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const speakHomepageContent = () => {
    if (!speechSynthesis) {
      alert("Speech synthesis is not supported in your browser");
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    // Get all the text content from the homepage
    const mainContent = document.querySelector("main");
    if (!mainContent) return;

    // Extract text content from main sections
    const welcomeHeading =
      document.getElementById("welcome-heading")?.textContent || "";
    const welcomeText =
      document.querySelector('section[aria-labelledby="welcome-heading"] p')
        ?.textContent || "";
    const featuresHeading =
      document.getElementById("features-heading")?.textContent || "";
    const instructionsHeading =
      document.getElementById("instructions-heading")?.textContent || "";

    // Get feature descriptions
    const featureCards = document.querySelectorAll(".grid .card p");
    const featureDescriptions = Array.from(featureCards)
      .map((card) => card.textContent)
      .join(". ");

    // Get quick start instructions
    const instructionList = document.querySelector("ol");
    const instructions = instructionList
      ? Array.from(instructionList.children)
          .map((li) => li.textContent)
          .join(". ")
      : "";

    // Combine all content
    const fullText = `
      ${welcomeHeading}. ${welcomeText}. 
      ${featuresHeading}. ${featureDescriptions}. 
      ${instructionsHeading}. ${instructions}.
      This is CodeSense, a voice-powered coding platform designed for everyone to learn Python programming using simple voice commands.
    `
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakHomepageContent();
    }
  };

  if (!speechSynthesis) {
    return null; // Don't render if speech synthesis is not supported
  }

  return (
    <Button
      onClick={handleClick}
      variant={isSpeaking ? "destructive" : "outline"}
      size="lg"
      className={`text-lg px-6 py-4 ${className || ""}`}
      aria-label={
        isSpeaking
          ? "Stop reading homepage content"
          : "Read homepage content aloud"
      }
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-6 h-6 mr-2" aria-hidden="true" />
          Stop Reading
        </>
      ) : (
        <>
          <Volume2 className="w-6 h-6 mr-2" aria-hidden="true" />
          Read Aloud
        </>
      )}
    </Button>
  );
}
