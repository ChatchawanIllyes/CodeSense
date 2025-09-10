import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface MetricsData {
  users: number;
  revenue: number;
  features: number;
}

interface InteractiveChartProps {
  data: MetricsData;
  period: string;
}

export function InteractiveChart({ data, period }: InteractiveChartProps) {
  const [animatedData, setAnimatedData] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    // Transform data for chart
    const chartData = [
      { 
        name: 'Users', 
        value: data.users, 
        color: period === 'past' ? '#f59e0b' : period === 'present' ? '#06b6d4' : '#a855f7',
        unit: 'K'
      },
      { 
        name: 'Revenue', 
        value: data.revenue / 1000, 
        color: period === 'past' ? '#f97316' : period === 'present' ? '#0891b2' : '#9333ea',
        unit: 'K$'
      },
      { 
        name: 'Features', 
        value: data.features, 
        color: period === 'past' ? '#ea580c' : period === 'present' ? '#0e7490' : '#7c3aed',
        unit: ''
      },
    ];

    setAnimatedData(chartData);
  }, [data, period]);

  const formatValue = (value: number, unit: string) => {
    if (unit === 'K') return `${(value / 1000).toFixed(1)}K`;
    if (unit === 'K$') return `$${value.toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-6">
      {/* Chart container */}
      <motion.div
        className="h-48 relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Holographic grid background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px'
          }}
        />

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={animatedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis hide />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              onMouseEnter={(data, index) => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {animatedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{
                    filter: hoveredBar === index ? 'brightness(1.3)' : 'brightness(1)',
                    transition: 'filter 0.3s ease',
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Temporal effect overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: period === 'past' 
              ? ['radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)']
              : period === 'future'
              ? ['radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
                 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)']
              : ['radial-gradient(circle, rgba(34, 211, 238, 0.05) 0%, transparent 70%)']
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-3">
        {animatedData.map((metric, index) => (
          <motion.div
            key={metric.name}
            className="p-3 rounded-lg bg-black/20 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            onMouseEnter={() => setHoveredBar(index)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">{metric.name}</p>
                <motion.p 
                  className="font-mono text-lg"
                  style={{ color: metric.color }}
                  animate={{
                    scale: hoveredBar === index ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {formatValue(metric.value, metric.unit)}
                </motion.p>
              </div>
              
              {/* Metric trend indicator */}
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${metric.color}20` }}
                animate={{
                  rotate: period === 'past' ? -45 : period === 'future' ? 45 : 0,
                  scale: hoveredBar === index ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-1 h-4 rounded-full"
                  style={{ backgroundColor: metric.color }}
                  animate={{
                    height: period === 'past' ? '12px' : period === 'future' ? '20px' : '16px',
                  }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            </div>

            {/* Holographic data stream effect */}
            <motion.div
              className="mt-2 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: `${metric.color}20` }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: metric.color }}
                initial={{ width: '0%' }}
                animate={{ 
                  width: `${(metric.value / Math.max(...animatedData.map(d => d.value))) * 100}%` 
                }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            </motion.div>

            {/* Particle effect on hover */}
            {hoveredBar === index && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{ backgroundColor: metric.color }}
                    initial={{ 
                      x: Math.random() * 100, 
                      y: Math.random() * 30 + 20,
                      opacity: 0 
                    }}
                    animate={{ 
                      y: -10, 
                      opacity: [0, 1, 0] 
                    }}
                    transition={{ 
                      duration: 1, 
                      delay: i * 0.1,
                      repeat: Infinity 
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Temporal signature */}
      <motion.div
        className="text-center text-xs text-gray-500 font-mono"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Quantum Analysis • {period.toUpperCase()} TIMELINE
      </motion.div>
    </div>
  );
}