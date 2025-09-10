import React, { useState } from "react";
import { AccessibleWelcome } from "./components/AccessibleWelcome";
import { VoiceCodeEditor } from "./components/VoiceCodeEditor";
import { Phase2CodeEditor } from "./components/Phase2CodeEditor";
import { Phase3CodeEditor } from "./components/Phase3CodeEditor";
import { ThemeProvider } from "./components/ThemeProvider";

export default function App() {
  const [currentView, setCurrentView] = useState<
    "welcome" | "editor" | "phase2" | "phase3"
  >("welcome");

  const handleStartCoding = () => {
    setCurrentView("editor");
  };

  const handleStartPhase2 = () => {
    setCurrentView("phase2");
  };

  const handleStartPhase3 = () => {
    setCurrentView("phase3");
  };

  const handleBackToWelcome = () => {
    setCurrentView("welcome");
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {currentView === "welcome" ? (
          <AccessibleWelcome
            onStartCoding={handleStartCoding}
            onStartPhase2={handleStartPhase2}
            onStartPhase3={handleStartPhase3}
          />
        ) : currentView === "editor" ? (
          <VoiceCodeEditor onBack={handleBackToWelcome} />
        ) : currentView === "phase2" ? (
          <Phase2CodeEditor onBack={handleBackToWelcome} />
        ) : (
          <Phase3CodeEditor onBack={handleBackToWelcome} />
        )}
      </div>
    </ThemeProvider>
  );
}
