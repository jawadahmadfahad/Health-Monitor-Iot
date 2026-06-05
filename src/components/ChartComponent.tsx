import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';
import { motion } from 'framer-motion';
import { useSensorData } from '../context/SensorDataContext';

interface ChartComponentProps {
  type: 'heartRate' | 'temperature' | 'combined';
  timeRange: '1m' | '5m' | '15m' | '1h' | '24h';
}

const ChartComponent: React.FC<ChartComponentProps> = ({ type, timeRange }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { historicalData } = useSensorData();
  
  const getTimeRangeInMs = (): number => {
    switch (timeRange) {
      case '1m': return 60 * 1000;
      case '5m': return 5 * 60 * 1000;
      case '15m': return 15 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      default: return 5 * 60 * 1000;
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      const timeRangeMs = getTimeRangeInMs();
      const currentTime = new Date().getTime();
      const filteredData = historicalData.filter(data => 
        (currentTime - data.timestamp.getTime()) <= timeRangeMs
      );

      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }

      let datasets = [];
      
      if (type === 'heartRate' || type === 'combined') {
        datasets.push({
          label: 'Heart Rate (BPM)',
          data: filteredData.map(data => ({
            x: data.timestamp,
            y: data.heartRate
          })),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        });
      }
      
      if (type === 'temperature' || type === 'combined') {
        datasets.push({
          label: 'Temperature (°C)',
          data: filteredData.map(data => ({
            x: data.timestamp,
            y: data.temperature
          })),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: type === 'combined' ? 'y1' : 'y'
        });
      }

      const scales: any = {
        x: {
          type: 'time',
          time: {
            unit: timeRange === '24h' ? 'hour' : 'minute',
            displayFormats: {
              minute: 'HH:mm:ss',
              hour: 'HH:mm'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              family: "'Inter var', sans-serif",
              size: 11
            }
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: type === 'temperature' ? 'Temperature (°C)' : 'Heart Rate (BPM)',
            font: {
              family: "'Inter var', sans-serif",
              size: 12,
              weight: '500'
            }
          },
          suggestedMin: type === 'temperature' ? 15 : 40,
          suggestedMax: type === 'temperature' ? 40 : 120,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              family: "'Inter var', sans-serif",
              size: 11
            }
          }
        }
      };

      if (type === 'combined') {
        scales.y1 = {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Temperature (°C)',
            font: {
              family: "'Inter var', sans-serif",
              size: 12,
              weight: '500'
            }
          },
          suggestedMin: 15,
          suggestedMax: 40,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            font: {
              family: "'Inter var', sans-serif",
              size: 11
            }
          }
        };
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: { datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              tooltip: {
                enabled: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                titleFont: {
                  family: "'Inter var', sans-serif",
                  size: 12,
                  weight: '600'
                },
                bodyFont: {
                  family: "'Inter var', sans-serif",
                  size: 12
                },
                callbacks: {
                  label: function(context) {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y.toFixed(
                      context.dataset.label?.includes('Temperature') ? 1 : 0
                    );
                    return `${label}: ${value}`;
                  }
                }
              },
              legend: {
                position: 'top',
                align: 'end',
                labels: {
                  usePointStyle: true,
                  boxWidth: 6,
                  padding: 20,
                  font: {
                    family: "'Inter var', sans-serif",
                    size: 12
                  }
                }
              }
            },
            scales,
            animations: {
              y: {
                easing: 'easeOutQuart',
                duration: 750
              }
            }
          }
        });
      }
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [historicalData, type, timeRange]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full"
    >
      <canvas ref={chartRef}></canvas>
    </motion.div>
  );
};

export default ChartComponent;