import React from 'react';
import { useSensorData } from '../context/SensorDataContext';
import { Wifi, WifiOff } from 'lucide-react';

interface SystemStatusCardProps {
  className?: string;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ className = '' }) => {
  const { isConnected, connectArduino, disconnectArduino, historicalData } = useSensorData();

  const handleToggleConnection = async () => {
    if (isConnected) {
      disconnectArduino();
    } else {
      await connectArduino();
    }
  };

  const getTimeSinceLastUpdate = (): string => {
    if (historicalData.length === 0) {
      return 'No data';
    }

    const lastTimestamp = historicalData[historicalData.length - 1].timestamp;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastTimestamp.getTime()) / 1000);

    if (diffInSeconds < 5) {
      return 'Just now';
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          <div className="bg-yellow-100 p-2 rounded-full">
            {isConnected ? (
              <Wifi className="text-yellow-600 h-5 w-5" />
            ) : (
              <WifiOff className="text-yellow-600 h-5 w-5" />
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Connection:</span>
            <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
              {isConnected ? 'Connected' : 'Simulated'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Last Update:</span>
            <span className="font-medium text-gray-800">{getTimeSinceLastUpdate()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Data Points:</span>
            <span className="font-medium text-gray-800">{historicalData.length}</span>
          </div>
          
          <button
            onClick={handleToggleConnection}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-300 transform hover:scale-105 mt-2 ${
              isConnected 
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isConnected ? 'Disconnect' : 'Connect Device'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusCard;