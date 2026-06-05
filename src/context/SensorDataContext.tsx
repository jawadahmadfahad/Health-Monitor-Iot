import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectToArduino, disconnectFromArduino } from '../services/arduinoService';

export interface SensorData {
  heartRate: number;
  temperature: number;
  timestamp: Date;
  status: {
    heartRate: 'normal' | 'low' | 'high';
    temperature: 'normal' | 'low' | 'high';
  };
}

interface SensorDataContextType {
  currentData: SensorData | null;
  historicalData: SensorData[];
  isConnected: boolean;
  connectArduino: () => void;
  disconnectArduino: () => void;
  thresholds: {
    heartRate: { min: number; max: number };
    temperature: { min: number; max: number };
  };
  setThresholds: (thresholds: {
    heartRate: { min: number; max: number };
    temperature: { min: number; max: number };
  }) => void;
}

const SensorDataContext = createContext<SensorDataContextType | undefined>(undefined);

export const useSensorData = () => {
  const context = useContext(SensorDataContext);
  if (context === undefined) {
    throw new Error('useSensorData must be used within a SensorDataProvider');
  }
  return context;
};

interface SensorDataProviderProps {
  children: ReactNode;
}

export const SensorDataProvider: React.FC<SensorDataProviderProps> = ({ children }) => {
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [thresholds, setThresholds] = useState({
    heartRate: { min: 60, max: 100 },
    temperature: { min: 21, max: 29 },
  });

  // Simulate initial data for development
  useEffect(() => {
    if (!isConnected) {
      const intervalId = setInterval(() => {
        const newData = generateRandomData();
        setCurrentData(newData);
        setHistoricalData((prev) => {
          const newHistory = [...prev, newData];
          // Keep only last 100 records for performance
          if (newHistory.length > 100) {
            return newHistory.slice(-100);
          }
          return newHistory;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isConnected]);

  const generateRandomData = (): SensorData => {
    const lastHeartRate = currentData?.heartRate || 72;
    const lastTemp = currentData?.temperature || 26.5;
    
    // Simulate realistic BPM changes
    const heartRateChange = (Math.random() * 4 - 2) + (Math.random() > 0.9 ? (Math.random() * 10 - 5) : 0);
    const newHeartRate = Math.round(Math.max(40, Math.min(120, lastHeartRate + heartRateChange)));
    
    // Simulate realistic temperature changes
    const tempChange = (Math.random() * 0.4 - 0.2) + (Math.random() > 0.95 ? (Math.random() * 2 - 1) : 0);
    const newTemp = parseFloat((Math.max(15, Math.min(40, lastTemp + tempChange))).toFixed(1));
    
    // Determine status based on thresholds
    const heartRateStatus = 
      newHeartRate < thresholds.heartRate.min ? 'low' : 
      newHeartRate > thresholds.heartRate.max ? 'high' : 'normal';
    
    const temperatureStatus = 
      newTemp < thresholds.temperature.min ? 'low' : 
      newTemp > thresholds.temperature.max ? 'high' : 'normal';
    
    return {
      heartRate: newHeartRate,
      temperature: newTemp,
      timestamp: new Date(),
      status: {
        heartRate: heartRateStatus,
        temperature: temperatureStatus,
      },
    };
  };

  const connectArduino = async () => {
    try {
      await connectToArduino(
        (data) => {
          const { heartRate, temperature } = data;
          
          const heartRateStatus = 
            heartRate < thresholds.heartRate.min ? 'low' : 
            heartRate > thresholds.heartRate.max ? 'high' : 'normal';
          
          const temperatureStatus = 
            temperature < thresholds.temperature.min ? 'low' : 
            temperature > thresholds.temperature.max ? 'high' : 'normal';
          
          const newData = {
            heartRate,
            temperature,
            timestamp: new Date(),
            status: {
              heartRate: heartRateStatus,
              temperature: temperatureStatus,
            },
          };
          
          setCurrentData(newData);
          setHistoricalData((prev) => {
            const newHistory = [...prev, newData];
            if (newHistory.length > 100) {
              return newHistory.slice(-100);
            }
            return newHistory;
          });
        }
      );
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to Arduino:', error);
      setIsConnected(false);
    }
  };

  const disconnectArduino = () => {
    disconnectFromArduino();
    setIsConnected(false);
  };

  const value = {
    currentData,
    historicalData,
    isConnected,
    connectArduino,
    disconnectArduino,
    thresholds,
    setThresholds,
  };

  return (
    <SensorDataContext.Provider value={value}>
      {children}
    </SensorDataContext.Provider>
  );
};