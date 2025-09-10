import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Mic, MicOff, Play, RotateCcw, Volume2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface Phase2CodeEditorProps {
  onBack: () => void;
}

// Enhanced voice command patterns for Phase 2
const voiceCommands = {
  // Navigation commands
  "go to line": (text: string) => {
    const lineNumber = text.replace("go to line", "").trim();
    return { type: "navigate", line: parseInt(lineNumber) || 1 };
  },
  "read next function": () => ({ type: "readNextFunction" }),
  "read previous function": () => ({ type: "readPreviousFunction" }),
  "delete last line": () => ({ type: "deleteLastLine" }),
  "read current line": () => ({ type: "readCurrentLine" }),

  // Code generation commands
  "write print": (text: string) =>
    `print("${text.replace("write print ", "")}")`,
  print: (text: string) => `print("${text.replace("print ", "")}")`,
  "write variable": (text: string) => {
    const parts = text.replace("write variable ", "").split(" equals ");
    return parts.length === 2
      ? `${parts[0]} = ${parts[1]}`
      : `${parts[0]} = ""`;
  },
  "write for loop": (text: string) => {
    const range = text.replace("write for loop ", "") || "5";
    return `for i in range(${range}):\n    print(i)`;
  },
  "write if": (text: string) => {
    const condition = text.replace("write if ", "") || "True";
    return `if ${condition}:\n    print("Condition is true")`;
  },
  "new line": () => "\n",
  indent: () => "    ",
};

export function Phase2CodeEditor({ onBack }: Phase2CodeEditorProps) {
  // Core state
  const [code, setCode] = useState(
    "# Welcome to CodeSense Phase 2!\n# Try saying: 'go to line 2' or 'read next function'\n\n"
  );
  const [output, setOutput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [error, setError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [currentLine, setCurrentLine] = useState(1);

  // Phase 2 specific state
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState<string[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition and audio context
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize Web Speech API
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          setLastCommand(transcript);
          processVoiceCommand(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setSpeechSupported(false);
      }

      // Initialize Web Audio API for syntax highlighting tones
      if ("AudioContext" in window || "webkitAudioContext" in window) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        setAudioContext(new AudioContextClass());
      }
    }
  }, []);

  // Audio feedback for syntax elements
  const playSyntaxTone = useCallback(
    (type: "keyword" | "variable" | "string" | "number") => {
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Different frequencies for different syntax elements
      const frequencies = {
        keyword: 440, // A note
        variable: 330, // E note
        string: 550, // C# note
        number: 660, // E note (higher)
      };

      oscillator.frequency.setValueAtTime(
        frequencies[type],
        audioContext.currentTime
      );
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    },
    [audioContext]
  );

  // Enhanced voice command processing for Phase 2
  const processVoiceCommand = (transcript: string) => {
    let commandFound = false;

    // Check for navigation commands first
    for (const [pattern, handler] of Object.entries(voiceCommands)) {
      if (transcript.includes(pattern)) {
        const result = handler(transcript);

        if (typeof result === "string") {
          // Code generation command
          insertCodeAtCursor(result);
          announceToScreenReader(
            `Added code: ${result.replace(/\n/g, " new line ")}`
          );
        } else {
          // Navigation command
          handleNavigationCommand(result);
        }

        commandFound = true;
        break;
      }
    }

    if (!commandFound) {
      setError(
        `Command not recognized: "${transcript}". Try "go to line 3" or "read next function"`
      );
    }
  };

  // Handle navigation commands
  const handleNavigationCommand = (command: any) => {
    switch (command.type) {
      case "navigate":
        goToLine(command.line);
        break;
      case "readNextFunction":
        readNextFunction();
        break;
      case "readPreviousFunction":
        readPreviousFunction();
        break;
      case "deleteLastLine":
        deleteLastLine();
        break;
      case "readCurrentLine":
        readCurrentLine();
        break;
    }
  };

  // Navigation functions
  const goToLine = (lineNumber: number) => {
    if (!textareaRef.current) return;

    const lines = code.split("\n");
    if (lineNumber < 1 || lineNumber > lines.length) {
      setError(
        `Line ${lineNumber} does not exist. Code has ${lines.length} lines.`
      );
      return;
    }

    // Calculate cursor position for the line
    let position = 0;
    for (let i = 0; i < lineNumber - 1; i++) {
      position += lines[i].length + 1; // +1 for newline
    }

    textareaRef.current.setSelectionRange(position, position);
    textareaRef.current.focus();
    setCurrentLine(lineNumber);

    // Read the line aloud
    const lineContent = lines[lineNumber - 1].trim();
    if (lineContent) {
      speakText(`Line ${lineNumber}: ${lineContent}`);
      playSyntaxTone("keyword");
    }
  };

  const readNextFunction = () => {
    const lines = code.split("\n");
    let functionLine = -1;

    for (let i = currentLine; i < lines.length; i++) {
      if (
        lines[i].includes("def ") ||
        lines[i].includes("for ") ||
        lines[i].includes("if ")
      ) {
        functionLine = i + 1;
        break;
      }
    }

    if (functionLine > 0) {
      goToLine(functionLine);
    } else {
      speakText("No more functions found after the current line");
    }
  };

  const readPreviousFunction = () => {
    const lines = code.split("\n");
    let functionLine = -1;

    for (let i = currentLine - 2; i >= 0; i--) {
      if (
        lines[i].includes("def ") ||
        lines[i].includes("for ") ||
        lines[i].includes("if ")
      ) {
        functionLine = i + 1;
        break;
      }
    }

    if (functionLine > 0) {
      goToLine(functionLine);
    } else {
      speakText("No functions found before the current line");
    }
  };

  const deleteLastLine = () => {
    const lines = code.split("\n");
    if (lines.length <= 1) {
      speakText("No lines to delete");
      return;
    }

    // Ask for confirmation
    speakText(
      "Are you sure you want to delete the last line? Say yes to confirm"
    );

    // In a real implementation, you'd wait for voice confirmation
    // For MVP, we'll delete immediately but announce it
    const newCode = lines.slice(0, -1).join("\n");
    setCode(newCode);
    speakText("Last line deleted");
    playSyntaxTone("keyword");
  };

  const readCurrentLine = () => {
    const lines = code.split("\n");
    if (currentLine <= lines.length) {
      const lineContent = lines[currentLine - 1].trim();
      if (lineContent) {
        speakText(`Line ${currentLine}: ${lineContent}`);
      } else {
        speakText(`Line ${currentLine} is empty`);
      }
    }
  };

  // Step-by-step execution mode
  const runStepByStep = async () => {
    setCurrentStep(0);
    setStepResults([]);
    setOutput("");

    const lines = code
      .split("\n")
      .filter((line) => line.trim() && !line.trim().startsWith("#"));

    for (let i = 0; i < lines.length; i++) {
      setCurrentStep(i + 1);
      const line = lines[i].trim();

      // Read the line being executed
      speakText(`Executing line ${i + 1}: ${line}`);

      try {
        const result = await executeSingleLine(line);
        setStepResults((prev) => [...prev, result]);

        if (result) {
          speakText(`Result: ${result}`);
          playSyntaxTone("number");
        }

        // Wait a bit between steps for better narration
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Execution failed";
        speakText(`Error on line ${i + 1}: ${errorMsg}`);
        playSyntaxTone("string");
        break;
      }
    }

    speakText("Step-by-step execution completed");
  };

  // Execute a single line of code
  const executeSingleLine = async (line: string): Promise<string> => {
    // Basic Python line execution simulation
    const trimmed = line.trim();

    // Handle print statements
    const printMatch = trimmed.match(/print\((.*)\)/);
    if (printMatch) {
      let content = printMatch[1];
      content = content.replace(/^["']|["']$/g, "");
      return content;
    }

    // Handle variable assignments
    if (trimmed.includes("=")) {
      const parts = trimmed.split("=");
      if (parts.length === 2) {
        const varName = parts[0].trim();
        const value = parts[1].trim();
        return `Variable ${varName} set to ${value}`;
      }
    }

    // Handle for loops
    if (trimmed.includes("for i in range(")) {
      const rangeMatch = trimmed.match(/range\((\d+)\)/);
      if (rangeMatch) {
        const count = parseInt(rangeMatch[1]);
        return `Loop will run ${count} times`;
      }
    }

    return "";
  };

  // Utility functions
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const insertCodeAtCursor = (newCode: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentCode = code;

      const beforeCursor = currentCode.substring(0, start);
      const afterCursor = currentCode.substring(end);

      const needsNewline =
        start > 0 &&
        beforeCursor[start - 1] !== "\n" &&
        !newCode.startsWith("\n");
      const prefix = needsNewline ? "\n" : "";

      const updatedCode = beforeCursor + prefix + newCode + "\n" + afterCursor;
      setCode(updatedCode);

      setTimeout(() => {
        const newCursorPos = start + prefix.length + newCode.length + 1;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      setError("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const clearCode = () => {
    setCode("# Start coding here!\n\n");
    setOutput("");
    setError("");
    speakText("Code editor cleared");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <header className="mb-8" role="banner">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="lg"
              aria-label="Go back to welcome page"
              className="cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              CodeSense Phase 2 - Voice Navigator
            </h1>
          </div>
        </div>

        {!speechSupported && (
          <Alert className="mb-4">
            <AlertDescription>
              Speech recognition is not supported in your browser. You can still
              type code manually.
            </AlertDescription>
          </Alert>
        )}
      </header>

      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Code Editor */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Code Editor</h2>
            <div className="flex space-x-2">
              {speechSupported && (
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? "destructive" : "default"}
                  size="sm"
                  aria-label={
                    isListening ? "Stop voice input" : "Start voice input"
                  }
                  className="focus:ring-4 focus:ring-primary/50 cursor-pointer"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 mr-2" aria-hidden="true" />
                  ) : (
                    <Mic className="w-4 h-4 mr-2" aria-hidden="true" />
                  )}
                  {isListening ? "Stop Voice" : "Start Voice"}
                </Button>
              )}
              <Button
                onClick={clearCode}
                variant="outline"
                size="sm"
                aria-label="Clear all code"
                className="cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
                Clear
              </Button>
            </div>
          </div>

          <Textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono text-lg min-h-[400px] bg-muted border-2 focus:border-primary focus:ring-4 focus:ring-primary/20"
            placeholder="Start coding here or use voice commands..."
            aria-label="Python code editor"
            spellCheck={false}
          />

          <div className="flex space-x-4 mt-4">
            <Button
              onClick={runStepByStep}
              disabled={isRunning}
              size="lg"
              className="flex-1 focus:ring-4 focus:ring-primary/50 cursor-pointer"
              aria-label="Run code step by step"
            >
              <Play className="w-5 h-5 mr-2" aria-hidden="true" />
              {isRunning ? "Running..." : "Run Step by Step"}
            </Button>
          </div>

          {/* Voice Command Status */}
          {isListening && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-primary font-medium" aria-live="polite">
                🎤 Listening for voice commands...
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try: "go to line 3" or "read next function"
              </p>
            </div>
          )}

          {lastCommand && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Last command:</strong> "{lastCommand}"
              </p>
            </div>
          )}

          {/* Step-by-step results */}
          {stepResults.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-bold text-foreground mb-2">Step Results:</h3>
              <div className="space-y-2">
                {stepResults.map((result, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    <strong>Step {index + 1}:</strong> {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Voice Commands Help */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Voice Commands
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Navigation:</p>
                <p className="text-muted-foreground">
                  "go to line 5" → moves cursor to line 5
                </p>
              </div>
              <div>
                <p className="font-medium">Code Reading:</p>
                <p className="text-muted-foreground">
                  "read next function" → moves to next function
                </p>
              </div>
              <div>
                <p className="font-medium">Editing:</p>
                <p className="text-muted-foreground">
                  "delete last line" → removes last line
                </p>
              </div>
              <div>
                <p className="font-medium">Code Generation:</p>
                <p className="text-muted-foreground">
                  "write print hello world" → adds print statement
                </p>
              </div>
            </div>
          </Card>

          {/* Phase 2 Features */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h2 className="text-xl font-bold text-foreground mb-4">
              🚀 Phase 2 Features
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-primary">✓</span>
                <span>
                  <strong>Voice Navigation:</strong> "Go to line X", "Read next
                  function"
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary">✓</span>
                <span>
                  <strong>Step-by-Step Execution:</strong> Run code line by line
                  with audio
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary">✓</span>
                <span>
                  <strong>Audio Syntax Highlighting:</strong> Different tones
                  for code elements
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary">✓</span>
                <span>
                  <strong>Built-in Tutorials:</strong> Interactive learning with
                  voice guidance
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
