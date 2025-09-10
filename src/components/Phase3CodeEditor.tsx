import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowLeft, Play, RotateCcw, Settings, Target } from "lucide-react";

interface Phase3CodeEditorProps {
  onBack: () => void;
}

interface AudioBlock {
  id: string;
  type: "moveForward" | "turnLeft" | "turnRight" | "loop" | "print";
  params?: any;
  label: string;
  icon: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  goal: string;
  instructions: string[];
  blocks: AudioBlock[];
  successCondition: (result: any) => boolean;
}

// Predefined missions
const missions: Mission[] = [
  {
    id: "robot-treasure",
    title: "Robot Treasure Hunt",
    description: "Help the robot reach the treasure by coding its moves",
    goal: "Guide the robot through the maze to find the treasure",
    instructions: [
      "The robot needs to move forward 3 steps",
      "Then turn right and move forward 2 more steps",
      "Finally, turn left and move forward 1 step to reach the treasure",
    ],
    blocks: [],
    successCondition: (result) => result && result.steps && result.steps.length >= 6,
  },
  {
    id: "counting-adventure",
    title: "Counting Adventure",
    description: "Create a loop that counts from 1 to 5",
    goal: "Use a loop block to count numbers",
    instructions: [
      "Add a loop block that repeats 5 times",
      "Inside the loop, add a print block to show the current number",
      "Run your code to see the counting sequence",
    ],
    blocks: [],
    successCondition: (result) => result && result.output && result.output.includes("5"),
  },
  {
    id: "pattern-maker",
    title: "Pattern Maker",
    description: "Create a repeating pattern with blocks",
    goal: "Make a pattern that repeats 3 times",
    instructions: [
      "Add a move forward block",
      "Add a turn right block",
      "Wrap them in a loop that repeats 3 times",
    ],
    blocks: [],
    successCondition: (result) => result && result.pattern && result.pattern.length >= 6,
  },
];

// Available audio blocks
const availableBlocks: AudioBlock[] = [
  { id: "moveForward", type: "moveForward", label: "Move Forward", icon: "⬆️" },
  { id: "turnLeft", type: "turnLeft", label: "Turn Left", icon: "⬅️" },
  { id: "turnRight", type: "turnRight", label: "Turn Right", icon: "➡️" },
  { id: "loop", type: "loop", label: "Loop", icon: "🔄" },
  { id: "print", type: "print", label: "Print", icon: "💬" },
];

// Voice options for personalization
const voiceOptions = [
  { id: "friendly", name: "Friendly Narrator", rate: 0.9, pitch: 1.1 },
  { id: "robot", name: "Robot Voice", rate: 0.8, pitch: 0.8 },
  { id: "wizard", name: "Wizard", rate: 0.7, pitch: 0.9 },
];

export function Phase3CodeEditor({ onBack }: Phase3CodeEditorProps) {
  // Core state
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [isMissionActive, setIsMissionActive] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<AudioBlock[]>([]);
  const [missionResult, setMissionResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Audio and voice state
  const [selectedVoice, setSelectedVoice] = useState(voiceOptions[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [showMissions, setShowMissions] = useState(true);
  const [isNarrating, setIsNarrating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context and voice recognition
  useEffect(() => {
    if ("AudioContext" in window || "webkitAudioContext" in window) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass();
      audioContextRef.current = context;
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const speakWithVoice = useCallback(
    (text: string) => {
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = selectedVoice.rate;
        utterance.pitch = selectedVoice.pitch;
        utterance.onstart = () => setIsNarrating(true);
        utterance.onend = () => setIsNarrating(false);
        speechSynthesis.speak(utterance);
      }
    },
    [selectedVoice]
  );

  function playSuccessSound() {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = 880;
    g.gain.value = 0.2;
    o.connect(g).connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.frequency.value = 1320;
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 200);
    }, 200);
  }

  function playFailureSound() {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.value = 220;
    g.gain.value = 0.2;
    o.connect(g).connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.frequency.value = 110;
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 200);
    }, 200);
  }

  // Mission management
  const startMission = (mission: Mission) => {
    setCurrentMission(mission);
    setIsMissionActive(true);
    setShowMissions(false);
    setSelectedBlocks([]);
    setMissionResult(null);

    // Narrate mission start
    const missionIntro = `Mission: ${mission.title}. ${mission.description}. ${mission.goal}`;
    speakWithVoice(missionIntro);

    // Narrate instructions after a delay
    setTimeout(() => {
      const instructions = mission.instructions.join(". ");
      speakWithVoice(`Here are your instructions: ${instructions}`);
    }, 2000);
  };

  const addBlock = (block: AudioBlock) => {
    const newBlock = { ...block, id: `${block.type}-${Date.now()}` };
    setSelectedBlocks((prev) => [...prev, newBlock]);

    // Audio feedback
    speakWithVoice(`Added ${block.label} block`);
  };

  const removeBlock = (index: number) => {
    setSelectedBlocks((prev) => prev.filter((_, i) => i !== index));
    speakWithVoice("Block removed");
  };

  const clearBlocks = () => {
    setSelectedBlocks([]);
    speakWithVoice("All blocks cleared");
  };

  // Mission execution
  const runMission = () => {
    if (!isMissionActive || !currentMission) return;
    if (selectedBlocks.length === 0) {
      speakWithVoice("Please add some blocks before running the mission");
      return;
    }
    speakWithVoice("Running your mission...");
    setIsRunning(true);
    setTimeout(() => {
      // Simulate mission result
      const result = { steps: selectedBlocks.map(b => b.type), output: selectedBlocks.length ? 'Success!' : '' };
      setMissionResult(result);
      setIsRunning(false);
      if (currentMission.successCondition(result)) {
        playSuccessSound();
        speakWithVoice("Congratulations! Mission complete! You earned a star!");
      } else {
        playFailureSound();
        speakWithVoice("Mission incomplete. Let's try again! You can do it!");
      }
    }, 1500);
  };

  const resetMission = () => {
    setSelectedBlocks([]);
    setMissionResult(null);
    speakWithVoice("Mission reset. Ready to try again!");
  };

  const backToMissions = () => {
    setShowMissions(true);
    setIsMissionActive(false);
    setCurrentMission(null);
    setSelectedBlocks([]);
    setMissionResult(null);
    speakWithVoice("Back to mission selection");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      {/* Header */}
      <header className="mb-8" role="banner">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="outline" size="lg" aria-label="Go back to welcome page" className="cursor-pointer">
              <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">CodeSense Phase 3 - Adventure Mode 🚀</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowSettings(!showSettings)} variant="outline" size="lg" className="cursor-pointer" aria-label="Toggle settings panel">
              <Settings className="w-5 h-5 mr-2" aria-hidden="true" />
              Settings
            </Button>
          </div>
        </div>
      </header>
      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mission Selection */}
          {showMissions && (
            <Card className="p-8 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">🎯 Choose Your Adventure!</h2>
                <p className="text-xl text-muted-foreground">Select a mission and start your coding journey</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {missions.map((mission) => (
                  <Card key={mission.id} className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary" onClick={() => startMission(mission)}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{mission.title}</h3>
                      <p className="text-muted-foreground mb-4">{mission.description}</p>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-sm font-medium text-primary">Goal: {mission.goal}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Active Mission */}
          {isMissionActive && currentMission && (
            <Card className="p-6 border-2 border-primary/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">🎯 {currentMission.title}</h2>
                <p className="text-muted-foreground mb-4">{currentMission.description}</p>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="font-medium text-primary">
                    <Target className="w-4 h-4 inline mr-2" />
                    {currentMission.goal}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-bold mb-2 text-lg">Pseudo-code:</h4>
                <div className="bg-gray-100 rounded-lg p-3 text-left text-base font-mono whitespace-pre-line min-h-[48px]">
                  {selectedBlocks.length === 0
                    ? <span className="text-gray-400">(No blocks yet)</span>
                    : selectedBlocks.map((block) => {
                        if (block.type === "moveForward") return `moveForward();`;
                        if (block.type === "turnLeft") return `turnLeft();`;
                        if (block.type === "turnRight") return `turnRight();`;
                        if (block.type === "loop") return `for (let i = 0; i < 3; i++) { ... }`;
                        if (block.type === "print") return `print();`;
                        return block.label;
                      }).join("\n")}
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">📋 Instructions</h3>
                </div>
                <div className="space-y-2">
                  {currentMission.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">{index + 1}</span>
                      <p className="text-muted-foreground">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">🧱 Your Code Blocks</h3>
                  <Button onClick={clearBlocks} variant="outline" size="sm" className="cursor-pointer">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                {selectedBlocks.length === 0 ? (
                  <div className="text-center py-8 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">No blocks added yet. Use the block palette on the right to build your code!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedBlocks.map((block, index) => (
                      <div key={block.id} className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{block.icon}</span>
                          <span className="font-medium">{block.label}</span>
                        </div>
                        <Button onClick={() => removeBlock(index)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700 cursor-pointer">×</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={runMission} disabled={isRunning || selectedBlocks.length === 0} size="lg" className="w-full bg-green-600 hover:bg-green-700 cursor-pointer" aria-label="Run mission">
                  <Play className="w-5 h-5 mr-2" />
                  {isRunning ? "Running..." : "🚀 Run Mission"}
                </Button>
                <Button onClick={resetMission} variant="outline" size="lg" className="w-full cursor-pointer" aria-label="Reset mission">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
                <Button onClick={backToMissions} variant="outline" size="lg" className="w-full cursor-pointer" aria-label="Back to missions">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Missions
                </Button>
              </div>
              {missionResult && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-bold text-foreground mb-3">📊 Mission Results</h3>
                  <div className="space-y-2">
                    {missionResult.steps && (
                      <div>
                        <strong>Steps:</strong> {missionResult.steps.join(" → ")}
                      </div>
                    )}
                    {missionResult.output && (
                      <div>
                        <strong>Output:</strong> {missionResult.output}
                      </div>
                    )}
                    {missionResult.pattern && (
                      <div>
                        <strong>Pattern:</strong> {missionResult.pattern.join(" ")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Settings Panel */}
          {showSettings && (
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
              <h2 className="text-xl font-bold text-foreground mb-4">⚙️ Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">🎭 Narrator Voice</label>
                  <select
                    value={selectedVoice.id}
                    onChange={(e) => {
                      const voice = voiceOptions.find((v) => v.id === e.target.value);
                      if (voice) {
                        setSelectedVoice(voice);
                        speakWithVoice(`Voice changed to ${voice.name}`);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {voiceOptions.map((voice) => (
                      <option key={voice.id} value={voice.id}>{voice.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Button onClick={() => speakWithVoice("Settings saved! Your voice preferences are ready.")} className="w-full cursor-pointer">💾 Save Settings</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Block Palette */}
          {isMissionActive && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">🧱 Block Palette</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Click blocks to add them to your code</p>
              <div className="space-y-3">
                {availableBlocks.map((block) => (
                  <Button key={block.id} onClick={() => addBlock(block)} variant="outline" size="lg" className="w-full justify-start cursor-pointer hover:bg-primary/10" aria-label={`Add ${block.label} block`}>
                    <span className="text-2xl mr-3">{block.icon}</span>
                    <span className="font-medium">{block.label}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-xs text-primary text-center">💡 Tip: Try building a sequence of blocks!</p>
              </div>
            </Card>
          )}

          {/* Phase 3 Features */}
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <h2 className="text-xl font-bold text-foreground mb-4">🏆 Phase 3 Features</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600">🎯</span>
                <span><strong>Audio Missions:</strong> Interactive coding challenges</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600">🏆</span>
                <span><strong>Rewards & Sounds:</strong> Success/failure audio feedback</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600">🧱</span>
                <span><strong>Audio Blocks Mode:</strong> Visual block-based coding</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600">🎭</span>
                <span><strong>Custom Voices:</strong> Choose your narrator</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
