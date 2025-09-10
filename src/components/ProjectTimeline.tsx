import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  version: string;
}

interface ProjectTimelineProps {
  projects: Project[];
  period: string;
}

const statusColors = {
  completed: 'bg-green-500/20 text-green-400 border-green-500/40',
  active: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  'in-progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  deprecated: 'bg-red-500/20 text-red-400 border-red-500/40',
  planned: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  concept: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
};

const periodEffects = {
  past: {
    filter: 'sepia(30%) contrast(80%) brightness(70%)',
    borderStyle: 'solid',
  },
  present: {
    filter: 'none',
    borderStyle: 'solid',
  },
  future: {
    filter: 'hue-rotate(180deg) saturate(120%) brightness(110%)',
    borderStyle: 'dashed',
  },
};

export function ProjectTimeline({ projects, period }: ProjectTimelineProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              ...periodEffects[period]
            }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              type: 'spring',
              damping: 20,
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="relative p-6 rounded-xl border bg-black/10 backdrop-blur-sm hover:bg-black/20 transition-all duration-300 group"
            style={{
              borderColor: period === 'past' ? 'rgba(245, 158, 11, 0.3)' :
                          period === 'present' ? 'rgba(34, 211, 238, 0.3)' :
                          'rgba(168, 85, 247, 0.3)',
              borderStyle: periodEffects[period].borderStyle,
            }}
          >
            {/* Project aging visual effect */}
            {period === 'past' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              />
            )}

            {/* Future holographic effect */}
            {period === 'future' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-xl"
                animate={{
                  background: [
                    'linear-gradient(45deg, rgba(168, 85, 247, 0.05), rgba(34, 211, 238, 0.05))',
                    'linear-gradient(45deg, rgba(34, 211, 238, 0.05), rgba(168, 85, 247, 0.05))',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <motion.h4 
                    className="text-lg font-mono text-white group-hover:text-cyan-300 transition-colors"
                    style={{ filter: periodEffects[period].filter }}
                  >
                    {project.name}
                  </motion.h4>
                  <p className="text-sm text-gray-400 mt-1">Version {project.version}</p>
                </div>
                
                <Badge 
                  className={`${statusColors[project.status]} transition-all duration-300`}
                  style={{ filter: periodEffects[period].filter }}
                >
                  {project.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-cyan-300 font-mono">{project.progress}%</span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={project.progress} 
                    className="h-2 bg-gray-800/50"
                  />
                  
                  {/* Animated progress effect */}
                  <motion.div
                    className="absolute inset-0 h-2 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      style={{ width: `${project.progress}%` }}
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 0%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Time-specific indicators */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {period === 'past' && (
                    <motion.div
                      className="w-2 h-2 bg-amber-400 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  {period === 'future' && (
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7] 
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span className="text-xs text-gray-500 capitalize">
                    {period} era project
                  </span>
                </div>

                {/* Project ID with temporal styling */}
                <div className="text-xs font-mono text-gray-500">
                  ID: {project.id.toString().padStart(3, '0')}
                </div>
              </div>

              {/* Hover reveal: additional project details */}
              <motion.div
                className="mt-4 pt-4 border-t border-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ height: 0, opacity: 0 }}
                whileHover={{ height: 'auto', opacity: 1 }}
              >
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block">Temporal Signature</span>
                    <span className="text-cyan-300 font-mono">
                      {Math.random().toString(36).substr(2, 8).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Phase</span>
                    <span className="text-purple-300">
                      {period === 'past' ? 'Legacy' : 
                       period === 'present' ? 'Active' : 'Prototype'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Temporal distortion effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                background: `
                  radial-gradient(circle at 50% 50%, 
                    ${period === 'past' ? 'rgba(245, 158, 11, 0.1)' :
                      period === 'present' ? 'rgba(34, 211, 238, 0.1)' :
                      'rgba(168, 85, 247, 0.1)'} 0%, 
                    transparent 70%)
                `
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}