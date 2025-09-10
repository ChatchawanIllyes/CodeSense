import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Mic, MicOff, Play, RotateCcw, Volume2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface VoiceCodeEditorProps {
  onBack: () => void;
}

// Voice command patterns for Python
const voiceCommands = {
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

export function VoiceCodeEditor({ onBack }: VoiceCodeEditorProps) {
  const [code, setCode] = useState(
    '# Welcome to CodeSense!\n# Try saying: "write print hello world"\n\n'
  );
  const [output, setOutput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [error, setError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [currentLine, setCurrentLine] = useState(1);
  const [isCodeNarrationEnabled, setIsCodeNarrationEnabled] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
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
    }
  }, []);

  const processVoiceCommand = (transcript: string) => {
    let newCode = "";
    let commandFound = false;

    // Check for voice command patterns
    for (const [pattern, handler] of Object.entries(voiceCommands)) {
      if (transcript.includes(pattern)) {
        newCode = handler(transcript);
        commandFound = true;
        break;
      }
    }

    if (commandFound) {
      insertCodeAtCursor(newCode);
      announceToScreenReader(
        `Added code: ${newCode.replace(/\n/g, " new line ")}`
      );
    } else {
      setError(
        `Command not recognized: "${transcript}". Try "write print hello world"`
      );
    }
  };

  const insertCodeAtCursor = (newCode: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentCode = code;

      const beforeCursor = currentCode.substring(0, start);
      const afterCursor = currentCode.substring(end);

      // Add new line if cursor is not at start of line and we're adding a new statement
      const needsNewline =
        start > 0 &&
        beforeCursor[start - 1] !== "\n" &&
        !newCode.startsWith("\n");
      const prefix = needsNewline ? "\n" : "";

      const updatedCode = beforeCursor + prefix + newCode + "\n" + afterCursor;
      setCode(updatedCode);

      // Update cursor position
      setTimeout(() => {
        const newCursorPos = start + prefix.length + newCode.length + 1;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
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

  const runCode = async () => {
    setIsRunning(true);
    setError("");

    try {
      // Simple Python code execution simulation
      // In a real app, this would use Pyodide or a backend API
      const result = await simulatePythonExecution(code);
      setOutput(result);
      announceToScreenReader(`Code executed. Output: ${result}`);

      // Provide audio feedback for successful execution
      if ("speechSynthesis" in window && result) {
        const utterance = new SpeechSynthesisUtterance(
          `Code executed successfully. Output: ${result}`
        );
        utterance.rate = 0.9;
        utterance.pitch = 1.2; // Slightly higher pitch for success
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Code execution failed";
      const voiceFriendlyError = createVoiceFriendlyError(errorMsg);
      setError(voiceFriendlyError);
      announceToScreenReader(`Error: ${voiceFriendlyError}`);

      // Speak the error aloud for better accessibility
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Error: ${voiceFriendlyError}`
        );
        utterance.rate = 0.8;
        utterance.pitch = 0.9; // Slightly lower pitch for errors
        speechSynthesis.speak(utterance);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const simulatePythonExecution = async (
    pythonCode: string
  ): Promise<string> => {
    // Simulate code execution with basic pattern matching
    const lines = pythonCode
      .split("\n")
      .filter((line) => line.trim() && !line.trim().startsWith("#"));
    let output = "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Handle print statements
      const printMatch = trimmed.match(/print\((.*)\)/);
      if (printMatch) {
        let content = printMatch[1];
        // Remove quotes if present
        content = content.replace(/^["']|["']$/g, "");
        output += content + "\n";
      }

      // Handle simple variable assignments and for loops (basic simulation)
      if (trimmed.includes("for i in range(")) {
        const rangeMatch = trimmed.match(/range\((\d+)\)/);
        if (rangeMatch) {
          const count = parseInt(rangeMatch[1]);
          for (let i = 0; i < count; i++) {
            output += i + "\n";
          }
        }
      }
    }

    return output.trim() || "Code executed successfully (no output)";
  };

  const clearCode = () => {
    setCode("# Start coding here!\n\n");
    setOutput("");
    setError("");
    announceToScreenReader("Code editor cleared");
  };

  const speakOutput = () => {
    if ("speechSynthesis" in window && output) {
      const utterance = new SpeechSynthesisUtterance(output);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Code narration - reads the current line when cursor moves
  const narrateCurrentLine = (lineNumber: number) => {
    if (!isCodeNarrationEnabled || !("speechSynthesis" in window)) return;

    const lines = code.split("\n");
    if (lineNumber > 0 && lineNumber <= lines.length) {
      const lineContent = lines[lineNumber - 1].trim();
      if (lineContent && !lineContent.startsWith("#")) {
        const utterance = new SpeechSynthesisUtterance(
          `Line ${lineNumber}: ${lineContent}`
        );
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
      }
    }
  };

  // Enhanced error feedback with voice-friendly messages
  const createVoiceFriendlyError = (errorMessage: string): string => {
    const errorMap: { [key: string]: string } = {
      SyntaxError: "Syntax error",
      IndentationError: "Indentation error",
      NameError: "Name error",
      TypeError: "Type error",
      IndexError: "Index error",
      KeyError: "Key error",
      AttributeError: "Attribute error",
      ValueError: "Value error",
      ZeroDivisionError: "Division by zero error",
      FileNotFoundError: "File not found error",
      ImportError: "Import error",
      ModuleNotFoundError: "Module not found error",
      PermissionError: "Permission error",
      TimeoutError: "Timeout error",
      ConnectionError: "Connection error",
      OSError: "Operating system error",
      MemoryError: "Memory error",
      RecursionError: "Recursion error",
      NotImplementedError: "Not implemented error",
      RuntimeError: "Runtime error",
    };

    // Try to extract the error type and provide a friendly message
    for (const [errorType, friendlyMessage] of Object.entries(errorMap)) {
      if (errorMessage.includes(errorType)) {
        return `${friendlyMessage}. ${errorMessage
          .replace(errorType, "")
          .trim()}`;
      }
    }

    return errorMessage;
  };

  // Handle textarea selection changes for code narration
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);

    // Calculate current line for narration
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = e.target.value.substring(0, cursorPosition);
      const lineNumber = textBeforeCursor.split("\n").length;

      if (lineNumber !== currentLine) {
        setCurrentLine(lineNumber);
        // Small delay to avoid narration on every keystroke
        setTimeout(() => narrateCurrentLine(lineNumber), 300);
      }
    }
  };

  // Handle cursor position changes for better narration
  const handleTextareaSelect = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = code.substring(0, cursorPosition);
      const lineNumber = textBeforeCursor.split("\n").length;

      if (lineNumber !== currentLine) {
        setCurrentLine(lineNumber);
        narrateCurrentLine(lineNumber);
      }
    }
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
              Voice Code Editor
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
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-foreground">Code Editor</h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Line {currentLine}</span>
                <Button
                  onClick={() =>
                    setIsCodeNarrationEnabled(!isCodeNarrationEnabled)
                  }
                  variant={isCodeNarrationEnabled ? "default" : "outline"}
                  size="sm"
                  aria-label={
                    isCodeNarrationEnabled
                      ? "Disable code narration"
                      : "Enable code narration"
                  }
                  className="h-6 px-2 text-xs cursor-pointer"
                >
                  {isCodeNarrationEnabled
                    ? "🔊 Narration On"
                    : "🔇 Narration Off"}
                </Button>
              </div>
            </div>
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
            onChange={handleTextareaChange}
            onSelect={handleTextareaSelect}
            className="font-mono text-lg min-h-[400px] bg-muted border-2 focus:border-primary focus:ring-4 focus:ring-primary/20"
            placeholder="Start coding here or use voice commands..."
            aria-label="Python code editor"
            spellCheck={false}
          />

          <div className="flex space-x-4 mt-4">
            <Button
              onClick={runCode}
              disabled={isRunning}
              size="lg"
              className="flex-1 focus:ring-4 focus:ring-primary/50 cursor-pointer"
              aria-label="Run the Python code"
            >
              <Play className="w-5 h-5 mr-2" aria-hidden="true" />
              {isRunning ? "Running..." : "Run Code"}
            </Button>
          </div>

          {/* Voice Command Status */}
          {isListening && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-primary font-medium" aria-live="polite">
                🎤 Listening for voice commands...
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try: "write print hello world" or "write for loop 5"
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
        </Card>

        {/* Output and Help */}
        <div className="space-y-6">
          {/* Output */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Output</h2>
              {output && (
                <Button
                  onClick={speakOutput}
                  variant="outline"
                  size="sm"
                  aria-label="Read output aloud"
                  className="cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Speak
                </Button>
              )}
            </div>

            <div
              ref={outputRef}
              className="min-h-[200px] p-4 bg-muted rounded-lg font-mono text-lg border-2"
              aria-live="polite"
              aria-label="Code execution output"
            >
              {output || (
                <span className="text-muted-foreground">
                  Output will appear here when you run your code
                </span>
              )}
            </div>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert className="border-destructive">
              <AlertDescription role="alert" aria-live="assertive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Voice Commands Help */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Voice Commands
            </h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium">Print text:</p>
                <p className="text-sm text-muted-foreground font-mono">
                  "write print hello world" → print("hello world")
                </p>
              </div>
              <div>
                <p className="font-medium">Create variable:</p>
                <p className="text-sm text-muted-foreground font-mono">
                  "write variable name equals John" → name = "John"
                </p>
              </div>
              <div>
                <p className="font-medium">For loop:</p>
                <p className="text-sm text-muted-foreground font-mono">
                  "write for loop 5" → for i in range(5):
                </p>
              </div>
              <div>
                <p className="font-medium">If statement:</p>
                <p className="text-sm text-muted-foreground font-mono">
                  "write if True" → if True:
                </p>
              </div>
            </div>
          </Card>

          {/* Phase 1 MVP Features */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h2 className="text-xl font-bold text-foreground mb-4">
              🚀 Phase 1 MVP Features
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>
                  <strong>Code Narration:</strong> Move your cursor to hear each
                  line read aloud
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>
                  <strong>Audio Output:</strong> Code results are spoken
                  automatically
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>
                  <strong>Voice-Friendly Errors:</strong> Clear spoken error
                  messages
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>
                  <strong>Screen Reader Ready:</strong> Full ARIA support and
                  keyboard navigation
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
