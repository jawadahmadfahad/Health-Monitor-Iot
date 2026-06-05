import React, { useState } from 'react';
import { BarChart2, Calendar, Download } from 'lucide-react';
import ChartComponent from '../components/ChartComponent';
import { useSensorData } from '../context/SensorDataContext';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | '1h' | '24h'>('1h');
  const { historicalData } = useSensorData();

  // Calculate statistics
  const calculateStats = (dataType: 'heartRate' | 'temperature') => {
    if (historicalData.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const values = historicalData.map(data => data[dataType]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
    
    return { min, max, avg };
  };

  const heartRateStats = calculateStats('heartRate');
  const temperatureStats = calculateStats('temperature');

  const exportData = () => {
    // Format data for CSV
    const headers = ['Timestamp', 'Heart Rate (BPM)', 'Temperature (°C)'];
    const csvData = historicalData.map(data => [
      data.timestamp.toISOString(),
      data.heartRate,
      data.temperature
    ]);
    
    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `health_data_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Health Analytics</h1>
          <p className="text-gray-600">View and analyze your health data over time</p>
        </div>
        
        <div className="flex space-x-4 mt-4 md:mt-0">
          <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm">
            {(['1m', '5m', '15m', '1h', '24h'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <button 
            onClick={exportData}
            className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Statistics</h2>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Heart Rate</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Min</div>
                <div className="text-xl font-medium text-gray-800">{heartRateStats.min} <span className="text-xs">BPM</span></div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Avg</div>
                <div className="text-xl font-medium text-gray-800">{heartRateStats.avg} <span className="text-xs">BPM</span></div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Max</div>
                <div className="text-xl font-medium text-gray-800">{heartRateStats.max} <span className="text-xs">BPM</span></div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Temperature</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Min</div>
                <div className="text-xl font-medium text-gray-800">{temperatureStats.min} <span className="text-xs">°C</span></div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Avg</div>
                <div className="text-xl font-medium text-gray-800">{temperatureStats.avg} <span className="text-xs">°C</span></div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Max</div>
                <div className="text-xl font-medium text-gray-800">{temperatureStats.max} <span className="text-xs">°C</span></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Data Points</h2>
          </div>
          
          <div className="overflow-hidden bg-gray-50 rounded-lg h-56">
            <div className="h-full flex items-center justify-center">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historicalData.slice(-5).reverse().map((data, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.timestamp.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {data.heartRate} BPM
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {data.temperature} °C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          data.status.heartRate === 'normal' && data.status.temperature === 'normal'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {data.status.heartRate === 'normal' && data.status.temperature === 'normal'
                            ? 'Normal'
                            : 'Alert'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ChartComponent type="heartRate" timeRange={timeRange} />
        </div>
        <div>
          <ChartComponent type="temperature" timeRange={timeRange} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;