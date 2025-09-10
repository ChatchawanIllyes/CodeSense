import React from 'react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

interface HolographicPanelProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'purple' | 'amber';
}

export function HolographicPanel({ 
  children, 
  className,
  glowColor = 'cyan' 
}: HolographicPanelProps) {
  const glowClasses = {
    cyan: 'shadow-cyan-500/20 border-cyan-500/30 hover:border-cyan-400/50',
    purple: 'shadow-purple-500/20 border-purple-500/30 hover:border-purple-400/50',
    amber: 'shadow-amber-500/20 border-amber-500/30 hover:border-amber-400/50',
  };

  return (
    <motion.div
      className={cn(
        'relative backdrop-blur-xl bg-black/20 border rounded-2xl',
        'shadow-2xl transition-all duration-300',
        glowClasses[glowColor],
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {/* Holographic grid overlay */}
      <div className="absolute inset-0 opacity-10 rounded-2xl overflow-hidden">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${
            glowColor === 'cyan' ? '#06b6d4' : 
            glowColor === 'purple' ? '#a855f7' : '#f59e0b'
          }, transparent)`,
          padding: '1px',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-full h-full bg-black/20 rounded-2xl" />
      </motion.div>

      {/* Corner accents */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400/60 rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400/60 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400/60 rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400/60 rounded-br-lg" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Subtle animated particles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}