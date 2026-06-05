import React, { useState } from 'react';
import { Heart, Thermometer, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSensorData } from '../context/SensorDataContext';
import HealthMetricCard from '../components/HealthMetricCard';
import ChartComponent from '../components/ChartComponent';
import SystemStatusCard from '../components/SystemStatusCard';

const Dashboard = () => {
  const { currentData, thresholds } = useSensorData();
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | '1h' | '24h'>('5m');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!currentData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-pulse-soft mb-6">
            <Activity className="h-16 w-16 text-blue-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Initializing System</h2>
          <p className="text-gray-600">Connecting to health monitoring sensors...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.h1 
              variants={item}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Health Dashboard
            </motion.h1>
            <motion.p 
              variants={item}
              className="text-gray-600"
            >
              Real-time health metrics and analysis
            </motion.p>
          </div>
          
          <motion.div 
            variants={item}
            className="flex space-x-2 bg-white p-1 rounded-xl shadow-soft border border-gray-100"
          >
            {(['1m', '5m', '15m', '1h', '24h'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                  timeRange === range 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <motion.div 
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <HealthMetricCard
            title="Heart Rate"
            value={currentData.heartRate}
            unit="BPM"
            icon={<Heart className="h-6 w-6 text-red-500" />}
            status={currentData.status.heartRate}
            min={40}
            max={120}
            gradient="bg-gradient-to-br from-red-50 to-white"
          />
          
          <HealthMetricCard
            title="Temperature"
            value={currentData.temperature}
            unit="°C"
            icon={<Thermometer className="h-6 w-6 text-emerald-500" />}
            status={currentData.status.temperature}
            min={15}
            max={40}
            gradient="bg-gradient-to-br from-emerald-50 to-white"
          />
          
          <SystemStatusCard />
        </motion.div>

        {/* Chart Section */}
        <motion.div 
          variants={item}
          className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Health Metrics Overview</h2>
          <div className="h-[400px]">
            <ChartComponent type="combined" timeRange={timeRange} />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          variants={item}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Average BPM', value: '72', change: '+2.5%' },
            { label: 'Avg Temperature', value: '36.5°C', change: '-0.3%' },
            { label: 'Data Points', value: '1,234', change: '+12%' },
            { label: 'Uptime', value: '99.9%', change: '+0.1%' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <span className={`text-sm ${
                stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;