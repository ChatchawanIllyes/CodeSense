import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Clock } from 'lucide-react';

interface AINotificationProps {
  period: string;
  year: number;
}

const periodMessages = {
  past: {
    icon: Clock,
    message: "AI synchronized with historical timeline",
    color: "from-amber-400/80 to-orange-400/80",
    borderColor: "border-amber-400/30",
  },
  present: {
    icon: Bot,
    message: "AI operating in real-time mode",
    color: "from-cyan-400/80 to-blue-400/80", 
    borderColor: "border-cyan-400/30",
  },
  future: {
    icon: Bot,
    message: "AI accessing predictive algorithms",
    color: "from-purple-400/80 to-pink-400/80",
    borderColor: "border-purple-400/30",
  }
};

export function AINotification({ period, year }: AINotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prevPeriod, setPrevPeriod] = useState(period);

  useEffect(() => {
    if (period !== prevPeriod) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      setPrevPeriod(period);
      return () => clearTimeout(timer);
    }
  }, [period, prevPeriod]);

  const config = periodMessages[period];
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-6 right-6 z-40"
        >
          <div className={`
            bg-white/10 backdrop-blur-xl border ${config.borderColor} 
            rounded-xl shadow-2xl p-4 max-w-sm
          `}>
            <div className="flex items-center space-x-3">
              <motion.div
                className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center`}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: 2,
                }}
              >
                <IconComponent className="w-5 h-5 text-white" />
              </motion.div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {config.message}
                </p>
                <p className="text-xs text-white/60 font-mono">
                  Timeline: {year} • {period.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Subtle glow effect */}
            <motion.div
              className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
              animate={{
                boxShadow: [
                  `0 0 20px ${period === 'past' ? '#f59e0b' : period === 'present' ? '#06b6d4' : '#a855f7'}40`,
                  `0 0 30px ${period === 'past' ? '#f59e0b' : period === 'present' ? '#06b6d4' : '#a855f7'}20`,
                  `0 0 20px ${period === 'past' ? '#f59e0b' : period === 'present' ? '#06b6d4' : '#a855f7'}40`,
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}