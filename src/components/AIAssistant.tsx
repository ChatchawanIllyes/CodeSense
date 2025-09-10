import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  currentPeriod: string;
  currentYear: number;
}

const aiResponses = {
  past: [
    "Analyzing legacy systems from the past timeline... I see remnants of simpler times.",
    "The historical data shows interesting patterns. Would you like me to explain the evolution?",
    "Past era detected. I can help you understand what led to your current state.",
  ],
  present: [
    "Current timeline analysis complete. I'm here to assist with real-time insights.",
    "Present moment optimization in progress. How can I enhance your workflow today?",
    "I'm fully synchronized with your current temporal state. What would you like to explore?",
  ],
  future: [
    "Future projections loaded. I can see potential outcomes from this timeline.",
    "Temporal forecast indicates interesting possibilities ahead. Shall we explore them?",
    "Future state analysis reveals promising developments. I'm here to guide your planning.",
  ]
};

export function AIAssistant({ currentPeriod, currentYear }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Welcome to the ${currentYear} timeline. I'm ARIA, your Adaptive Reasoning Intelligence Assistant. I can help you navigate through your temporal workspace.`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update AI greeting when period changes
  useEffect(() => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Timeline shift detected. Now synchronized with ${currentYear} - ${currentPeriod} era. All systems adapted for ${currentPeriod === 'past' ? 'historical analysis' : currentPeriod === 'present' ? 'real-time processing' : 'predictive modeling'}.`,
      timestamp: new Date()
    };
    
    if (messages.length > 1) { // Don't add on initial load
      setMessages(prev => [...prev, welcomeMessage]);
    }
  }, [currentPeriod]); // Only depend on currentPeriod to avoid infinite loop

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const responses = aiResponses[currentPeriod];
    const message = userMessage.toLowerCase();
    
    // Temporal analysis
    if (message.includes('time') || message.includes('timeline') || message.includes('travel')) {
      return `🕒 Temporal analysis for ${currentYear}: Currently operating in the ${currentPeriod} timeline. ${responses[Math.floor(Math.random() * responses.length)]}`;
    }
    
    // Project analysis
    if (message.includes('project') || message.includes('work') || message.includes('task')) {
      const insights = {
        past: 'legacy systems with proven stability',
        present: 'active development with real-time feedback',
        future: 'innovative concepts with high potential'
      };
      return `📊 Project insights from ${currentYear}: Your projects show ${insights[currentPeriod]}. I'm detecting ${currentPeriod === 'past' ? '2 completed projects' : currentPeriod === 'present' ? '2 active projects' : '2 planned initiatives'}. Would you like detailed analytics?`;
    }
    
    // Help and capabilities
    if (message.includes('help') || message.includes('what') || message.includes('can you')) {
      return `🤖 I'm ARIA, your temporal workspace assistant. I can:
      • Analyze data across time periods
      • Provide project insights and trends
      • Explain temporal patterns
      • Help navigate the ${currentPeriod} era
      • Predict outcomes based on current timeline
      
      What would you like to explore?`;
    }
    
    // Metrics and data
    if (message.includes('metric') || message.includes('data') || message.includes('stat')) {
      return `📈 Quantum metrics for ${currentYear}: I'm observing ${currentPeriod === 'past' ? 'historical patterns' : currentPeriod === 'present' ? 'real-time fluctuations' : 'predictive models'}. The temporal data shows significant growth trajectories. Would you like a detailed breakdown?`;
    }
    
    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `👋 Greetings from the ${currentYear} timeline! I'm operating in ${currentPeriod} mode and ready to assist you with temporal workspace navigation.`;
    }
    
    // Easter egg responses
    if (message.includes('secret') || message.includes('hidden') || message.includes('easter')) {
      return `🔍 Temporal archives detected! I've found ${Math.floor(Math.random() * 5) + 3} classified entries in the ${currentPeriod} timeline. Some secrets are only visible when you explore deeper into the temporal layers...`;
    }
    
    // Default contextual response
    return `${responses[Math.floor(Math.random() * responses.length)]} The ${currentYear} temporal signature suggests optimal conditions for ${currentPeriod === 'past' ? 'data archaeology' : currentPeriod === 'present' ? 'real-time collaboration' : 'predictive modeling'}.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputValue),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ width: 80, height: 80 }}
            animate={{ width: 380, height: 500 }}
            exit={{ width: 80, height: 80 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`bg-white/10 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${
              currentPeriod === 'past' ? 'border-amber-400/20 shadow-amber-400/10' :
              currentPeriod === 'present' ? 'border-cyan-400/20 shadow-cyan-400/10' :
              'border-purple-400/20 shadow-purple-400/10'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-cyan-400/80 to-purple-400/80 rounded-full flex items-center justify-center"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-white">ARIA</p>
                  <p className="text-xs text-white/60">Temporal Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1 h-auto"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 h-80 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-cyan-500/80 to-purple-500/80 text-white ml-4'
                        : 'bg-white/10 text-white/90 mr-4 border border-white/20'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-white/90 mr-4 border border-white/20 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your temporal data..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-cyan-400/50 focus:ring-cyan-400/30"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-br from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsExpanded(true)}
            className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center group hover:bg-white/20 transition-all duration-300"
          >
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-cyan-400/80 to-purple-400/80 rounded-full flex items-center justify-center"
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              <Bot className="w-4 h-4 text-white" />
            </motion.div>
            
            {/* Pulse indicator */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}