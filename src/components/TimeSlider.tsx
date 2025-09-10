import React from 'react';
import { motion } from 'motion/react';
import { Slider } from './ui/slider';

interface TimeSliderProps {
  value: number;
  onChange: (value: number) => void;
  isTransitioning: boolean;
}

const timeMarkers = [
  { position: 16.5, label: '2020', era: 'Past', color: 'text-amber-400' },
  { position: 50, label: '2024', era: 'Present', color: 'text-cyan-400' },
  { position: 83.5, label: '2028', era: 'Future', color: 'text-purple-400' },
];

export function TimeSlider({ value, onChange, isTransitioning }: TimeSliderProps) {
  return (
    <div className="space-y-6">
      {/* Era indicators */}
      <div className="flex justify-between items-center">
        {timeMarkers.map((marker, index) => (
          <motion.div
            key={marker.label}
            className="text-center"
            animate={{
              scale: Math.abs(value - marker.position) < 20 ? 1.1 : 0.9,
              opacity: Math.abs(value - marker.position) < 20 ? 1 : 0.6,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className={`font-mono text-lg ${marker.color}`}>
              {marker.label}
            </div>
            <div className="text-xs text-gray-400 mt-1">{marker.era}</div>
          </motion.div>
        ))}
      </div>

      {/* Custom slider track with glow effects */}
      <div className="relative">
        {/* Background track with gradient */}
        <div className="h-2 bg-gradient-to-r from-amber-500/30 via-cyan-500/30 to-purple-500/30 rounded-full relative overflow-hidden">
          {/* Animated energy flow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: [-100, 300] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Main slider */}
        <div className="absolute inset-0 -mt-1">
          <Slider
            value={[value]}
            onValueChange={(newValue) => onChange(newValue[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Time portal effects at slider thumb position */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none"
          style={{ left: `${value}%` }}
          animate={{
            boxShadow: isTransitioning 
              ? ['0 0 20px cyan', '0 0 40px purple', '0 0 20px cyan']
              : '0 0 10px currentColor',
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full animate-pulse" />
          
          {/* Ripple effect */}
          {isTransitioning && (
            <motion.div
              className="absolute inset-0 border-2 border-cyan-400 rounded-full"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Era boundaries */}
        {[33, 66].map((position, index) => (
          <div
            key={position}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent"
            style={{ left: `${position}%` }}
          />
        ))}
      </div>

      {/* Time coordinates display */}
      <div className="flex justify-center">
        <motion.div
          className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-4 py-2"
          animate={{
            borderColor: isTransitioning 
              ? ['rgb(34 211 238 / 0.3)', 'rgb(168 85 247 / 0.3)', 'rgb(34 211 238 / 0.3)']
              : 'rgb(34 211 238 / 0.3)',
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Temporal Coordinates</div>
            <div className="font-mono text-cyan-300">
              T-{value.toFixed(1)}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}