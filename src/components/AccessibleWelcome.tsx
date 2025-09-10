import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Code, Volume2, Play, Eye, StepForward, Trophy } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { TextToSpeechButton } from "./TextToSpeechButton";

interface AccessibleWelcomeProps {
  onStartCoding: () => void;
  onStartPhase2: () => void;
  onStartPhase3: () => void;
}

export function AccessibleWelcome({
  onStartCoding,
  onStartPhase2,
  onStartPhase3,
}: AccessibleWelcomeProps) {
  const { isHighContrast, toggleHighContrast } = useTheme();
  return (
    <div className="min-h-screen bg-background p-8">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* Header with clear navigation */}
      <header className="mb-12" role="banner">
        <nav
          className="flex justify-between items-center mb-8"
          role="navigation"
          aria-label="Main navigation"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              CodeSense
            </h1>
              {/* Subtitle removed as requested */}
          </div>

          <div className="flex space-x-4">
            <TextToSpeechButton />
            <Button
              onClick={toggleHighContrast}
              variant="outline"
              size="lg"
              className="text-lg px-6 py-4 cursor-pointer"
              aria-label={`${
                isHighContrast ? "Disable" : "Enable"
              } high contrast mode`}
            >
              <Eye className="w-6 h-6 mr-2" aria-hidden="true" />
              {isHighContrast ? "Normal Contrast" : "High Contrast"}
            </Button>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main id="main-content" role="main">
        <div className="max-w-4xl mx-auto">
          {/* Welcome section */}
          <section
            className="text-center mb-16"
            aria-labelledby="welcome-heading"
          >
            <h2
              id="welcome-heading"
              className="text-3xl font-bold text-foreground mb-6"
            >
              Welcome to Your Voice-Powered Coding Adventure!
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Learn Python programming using voice commands. Choose Phase 1 for
              basic voice coding, Phase 2 for advanced voice navigation, or
              Phase 3 for gamified coding adventures with missions and rewards!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onStartCoding}
                size="lg"
                className="text-xl px-8 py-6 bg-primary hover:bg-primary/90 focus:ring-4 focus:ring-primary/50 cursor-pointer"
                aria-label="Start coding with voice commands"
              >
                <Play className="w-8 h-8 mr-3" aria-hidden="true" />
                Phase 1: Basic Voice Coding
              </Button>
              <Button
                onClick={onStartPhase2}
                size="lg"
                className="text-xl px-8 py-6 bg-primary hover:bg-primary/90 focus:ring-4 focus:ring-primary/50 cursor-pointer"
                aria-label="Start advanced voice navigation coding"
              >
                <StepForward className="w-8 h-8 mr-3" aria-hidden="true" />
                Phase 2: Voice Navigator
              </Button>
              <Button
                onClick={onStartPhase3}
                size="lg"
                className="text-xl px-8 py-6 bg-primary hover:bg-primary/90 focus:ring-4 focus:ring-primary/50 cursor-pointer"
                aria-label="Start gamified coding adventure"
              >
                <Trophy className="w-8 h-8 mr-3" aria-hidden="true" />
                Phase 3: Adventure Mode
              </Button>
            </div>
          </section>

          {/* Features grid */}
          <section aria-labelledby="features-heading">
            <h2
              id="features-heading"
              className="text-2xl font-bold text-foreground mb-8 text-center"
            >
              How It Works
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Voice Commands Feature */}
              <Card className="p-8 border-2 hover:border-primary/50 transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Volume2
                      className="w-8 h-8 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Voice Commands
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Say "write print hello world" and watch your code appear
                    instantly. No keyboard needed!
                  </p>
                  <div className="bg-muted p-4 rounded-lg text-left">
                    <p
                      className="font-mono text-sm"
                      aria-label="Example voice command"
                    >
                      "Write print hello world"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      → Creates: print("Hello World")
                    </p>
                  </div>
                </div>
              </Card>

              {/* Screen Reader Support */}
              <Card className="p-8 border-2 hover:border-primary/50 transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Screen Reader Friendly
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Every element works perfectly with screen readers. Navigate
                    with keyboard shortcuts and hear everything clearly.
                  </p>
                  <div className="bg-muted p-4 rounded-lg text-left">
                    <p className="text-sm">
                      ✓ ARIA labels on all controls
                      <br />
                      ✓ Keyboard navigation
                      <br />✓ Clear focus indicators
                    </p>
                  </div>
                </div>
              </Card>

              {/* Code Execution */}
              <Card className="p-8 border-2 hover:border-primary/50 transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Code className="w-8 h-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Safe Code Running
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Run your Python code safely in the browser. See results
                    instantly and hear them read aloud.
                  </p>
                  <div className="bg-muted p-4 rounded-lg text-left">
                    <p className="font-mono text-sm">
                      print("Hello World")
                      <br />
                      <span className="text-green-600">→ Hello World</span>
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Quick start instructions */}
          <section
            className="mt-16 text-center"
            aria-labelledby="instructions-heading"
          >
            <h2
              id="instructions-heading"
              className="text-2xl font-bold text-foreground mb-6"
            >
              Quick Start Guide - Phase 1
            </h2>
            <div className="bg-muted p-8 rounded-lg max-w-2xl mx-auto">
              <ol className="text-left text-lg space-y-4" role="list">
                <li className="flex items-start">
                  <span
                    className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 font-bold flex-shrink-0"
                    aria-hidden="true"
                  >
                    1
                  </span>
                  <span className="pt-1">
                    Click "Phase 1: Basic Voice Coding" to open the
                    voice-enabled editor
                  </span>
                </li>
                <li className="flex items-start">
                  <span
                    className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 font-bold flex-shrink-0"
                    aria-hidden="true"
                  >
                    2
                  </span>
                  <span className="pt-1">
                    Click "Start Voice Input" and allow microphone access
                  </span>
                </li>
                <li className="flex items-start">
                  <span
                    className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 font-bold flex-shrink-0"
                    aria-hidden="true"
                  >
                    3
                  </span>
                  <span className="pt-1">
                    Say commands like "write print hello world" to add code
                  </span>
                </li>
                <li className="flex items-start">
                  <span
                    className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 font-bold flex-shrink-0"
                    aria-hidden="true"
                  >
                    4
                  </span>
                  <span className="pt-1">
                    Click "Run Code" to see your program work! Try Phase 2 or 3
                    for more features!
                  </span>
                </li>
              </ol>
            </div>
          </section>

          {/* Phases Overview */}
          <section className="mt-16" aria-labelledby="phases-heading">
            <h2
              id="phases-heading"
              className="text-2xl font-bold text-foreground mb-6 text-center"
            >
              🚀 Choose Your Learning Path
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 text-center border-2 border-primary/20">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Phase 1: Basic Voice Coding
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start here! Learn to write and run Python code using voice
                  commands.
                </p>
                <div className="text-sm text-primary font-medium">
                  Perfect for beginners
                </div>
              </Card>

              <Card className="p-6 text-center border-2 border-primary/20">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StepForward className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Phase 2: Voice Navigator
                </h3>
                <p className="text-muted-foreground mb-4">
                  Advanced features: step-by-step execution, voice navigation,
                  and tutorials.
                </p>
                <div className="text-sm text-primary font-medium">
                  For intermediate learners
                </div>
              </Card>

              <Card className="p-6 text-center border-2 border-primary/20">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Phase 3: Adventure Mode
                </h3>
                <p className="text-muted-foreground mb-4">
                  Gamified learning with missions, rewards, and block-based
                  coding.
                </p>
                <div className="text-sm text-primary font-medium">
                  Fun for everyone!
                </div>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-16 text-center text-muted-foreground"
        role="contentinfo"
      >
        <p>Built with accessibility and inclusion in mind. Happy coding! 🎉</p>
      </footer>
    </div>
  );
}
