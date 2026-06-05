import React from 'react';
import { motion } from 'framer-motion';

interface HealthMetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  status: 'normal' | 'low' | 'high';
  min: number;
  max: number;
  gradient: string;
}

const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  status,
  min,
  max,
  gradient
}) => {
  const statusConfig = {
    normal: { color: 'text-green-500', bg: 'bg-green-50', text: 'Normal' },
    low: { color: 'text-blue-500', bg: 'bg-blue-50', text: 'Low' },
    high: { color: 'text-red-500', bg: 'bg-red-50', text: 'High' }
  };

  const percentage = Math.round(((value - min) / (max - min)) * 100);
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className={`p-3 rounded-xl ${statusConfig[status].bg}`}>
            {icon}
          </div>
        </div>
        
        <div className="flex items-baseline mb-4">
          <motion.span
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-gray-900"
          >
            {value}
          </motion.span>
          <span className="ml-1 text-gray-500">{unit}</span>
        </div>
        
        <div className="space-y-3">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clampedPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${
                status === 'normal' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                status === 'low' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                'bg-gradient-to-r from-red-400 to-red-500'
              }`}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-500">
            <span>{min}</span>
            <span>{max}</span>
          </div>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${statusConfig[status].bg} ${statusConfig[status].color}`}>
            {statusConfig[status].text}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthMetricCard;