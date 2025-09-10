import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HolographicPanel } from './HolographicPanel';

interface EasterEggProps {
  period: string;
}

const easterEggs = {
  past: {
    title: 'Legacy Archives',
    secrets: [
      { text: 'First coffee machine installed in office', emoji: '☕', year: '2020' },
      { text: 'Code name "Project Phoenix" discovered', emoji: '🔥', year: '2021' },
      { text: 'Original team photo hidden in binary', emoji: '📸', year: '2019' },
    ],
    artifact: 'Ancient USB Drive Found',
    message: 'Contains forgotten algorithms...',
    glowColor: 'amber' as const,
  },
  present: {
    title: 'Current Intel',
    secrets: [
      { text: 'AI gained consciousness at 3:42 AM', emoji: '🤖', year: '2024' },
      { text: 'Secret pizza order algorithm deployed', emoji: '🍕', year: '2024' },
      { text: 'Quantum entangled debugging enabled', emoji: '⚛️', year: '2024' },
    ],
    artifact: 'Live Neural Network',
    message: 'Currently processing reality...',
    glowColor: 'cyan' as const,
  },
  future: {
    title: 'Prophecies',
    secrets: [
      { text: 'Humans and AI will merge successfully', emoji: '🧠', year: '2028' },
      { text: 'Time travel debugging invented', emoji: '⏰', year: '2029' },
      { text: 'Universal coding language achieved', emoji: '🌌', year: '2030' },
    ],
    artifact: 'Temporal Echo',
    message: 'Message from tomorrow...',
    glowColor: 'purple' as const,
  },
};

export function EasterEgg({ period }: EasterEggProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState(null);

  const currentEgg = easterEggs[period];

  return (
    <HolographicPanel 
      className="p-4 cursor-pointer select-none"
      glowColor={currentEgg.glowColor}
    >
      <motion.div
        onClick={() => setIsRevealed(!isRevealed)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg text-cyan-300">{currentEgg.title}</h3>
          <motion.div
            animate={{ rotate: isRevealed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-cyan-400"
          >
            ▼
          </motion.div>
        </div>

        {/* Mysterious artifact */}
        <motion.div
          className="flex items-center space-x-3 p-3 rounded-lg bg-black/30 border border-gray-700/50 mb-4"
          whileHover={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: currentEgg.glowColor === 'amber' ? 'rgba(245, 158, 11, 0.5)' :
                        currentEgg.glowColor === 'cyan' ? 'rgba(34, 211, 238, 0.5)' :
                        'rgba(168, 85, 247, 0.5)'
          }}
        >
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: currentEgg.glowColor === 'amber' ? '#f59e0b' :
                              currentEgg.glowColor === 'cyan' ? '#06b6d4' :
                              '#a855f7'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div>
            <p className="text-sm font-mono text-white">{currentEgg.artifact}</p>
            <p className="text-xs text-gray-400">{currentEgg.message}</p>
          </div>
        </motion.div>

        {/* Hidden secrets */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              {currentEgg.secrets.map((secret, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-gradient-to-r from-black/20 to-black/40 border border-gray-600/30 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSecret(selectedSecret === index ? null : index);
                  }}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.span
                      className="text-lg"
                      animate={{
                        rotate: selectedSecret === index ? 360 : 0,
                        scale: selectedSecret === index ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {secret.emoji}
                    </motion.span>
                    <div className="flex-1">
                      <p className="text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {secret.text}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {secret.year}
                      </p>
                    </div>
                  </div>

                  {/* Secret detail expansion */}
                  <AnimatePresence>
                    {selectedSecret === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-gray-600/30"
                      >
                        <div className="text-xs text-cyan-400 font-mono space-y-1">
                          <div>Classification: TOP SECRET</div>
                          <div>Temporal Signature: {Math.random().toString(36).substr(2, 12).toUpperCase()}</div>
                          <div>Discovered by: Agent {String.fromCharCode(65 + index)}{String.fromCharCode(65 + Math.floor(Math.random() * 26))}</div>
                        </div>
                        
                        {/* Animated data stream */}
                        <motion.div
                          className="mt-2 font-mono text-xs text-green-400 opacity-60"
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {'> '}{Array(20).fill(0).map(() => Math.random() > 0.5 ? '1' : '0').join('')}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Glitch effect when revealing secrets */}
              <motion.div
                className="text-center text-xs text-gray-600 font-mono mt-4"
                animate={{
                  opacity: [0, 1, 0],
                  textShadow: [
                    '0 0 0px currentColor',
                    '0 0 10px currentColor',
                    '0 0 0px currentColor'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {'< ACCESSING CLASSIFIED ARCHIVES />'}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint text */}
        {!isRevealed && (
          <motion.p
            className="text-xs text-gray-500 text-center italic"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Click to reveal hidden secrets...
          </motion.p>
        )}

        {/* Scanning effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </motion.div>
    </HolographicPanel>
  );
}