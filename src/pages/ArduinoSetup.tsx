import React, { useState } from 'react';
import { getArduinoSetupInstructions, getArduinoSketchCode } from '../services/arduinoService';
import { useSensorData } from '../context/SensorDataContext';
import { AlertCircle, Copy, Check, Wifi, WifiOff } from 'lucide-react';

const ArduinoSetup = () => {
  const { isConnected, connectArduino, disconnectArduino } = useSensorData();
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080');
  const [copied, setCopied] = useState(false);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const instructions = getArduinoSetupInstructions();
  const arduinoCode = getArduinoSketchCode();

  const handleConnect = async () => {
    setShowConnectionStatus(true);
    setConnectionError(null);
    
    try {
      await connectArduino();
    } catch (error) {
      setConnectionError('Could not connect to Arduino. Check the WebSocket URL and ensure your Arduino is online.');
    }
  };

  const handleDisconnect = () => {
    disconnectArduino();
    setShowConnectionStatus(false);
    setConnectionError(null);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Arduino Setup</h1>
        <p className="text-gray-600 mb-8">Configure your Arduino to send real-time sensor data to the application</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Connection</h2>
                
                {showConnectionStatus && (
                  <div className={`mb-4 p-3 rounded-lg ${connectionError ? 'bg-red-50 text-red-900' : isConnected ? 'bg-green-50 text-green-900' : 'bg-yellow-50 text-yellow-900'}`}>
                    <div className="flex items-center">
                      {connectionError ? (
                        <AlertCircle className="h-5 w-5 mr-2" />
                      ) : isConnected ? (
                        <Wifi className="h-5 w-5 mr-2" />
                      ) : (
                        <WifiOff className="h-5 w-5 mr-2" />
                      )}
                      <span>
                        {connectionError 
                          ? connectionError 
                          : isConnected 
                            ? 'Connected to Arduino' 
                            : 'Connecting...'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="wsUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    WebSocket URL
                  </label>
                  <input
                    type="text"
                    id="wsUrl"
                    value={wsUrl}
                    onChange={(e) => setWsUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ws://arduino-ip:port"
                  />
                  <p className="mt-1 text-xs text-gray-500">Example: ws://192.168.1.100:8080</p>
                </div>
                
                <div className="flex space-x-3">
                  {isConnected ? (
                    <button
                      onClick={handleDisconnect}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Setup Instructions</h2>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                
                <ol className="space-y-3 mb-6">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ol>
                
                <div className="bg-gray-100 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">Required Components</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <span className="bg-green-100 p-1 rounded-full mr-2">
                        <Check className="h-3 w-3 text-green-600" />
                      </span>
                      Arduino UNO/Nano with ESP8266/ESP32 WiFi module
                    </li>
                    <li className="flex items-center">
                      <span className="bg-green-100 p-1 rounded-full mr-2">
                        <Check className="h-3 w-3 text-green-600" />
                      </span>
                      Pulse sensor for heart rate monitoring
                    </li>
                    <li className="flex items-center">
                      <span className="bg-green-100 p-1 rounded-full mr-2">
                        <Check className="h-3 w-3 text-green-600" />
                      </span>
                      LM35/TMP36 temperature sensor
                    </li>
                    <li className="flex items-center">
                      <span className="bg-green-100 p-1 rounded-full mr-2">
                        <Check className="h-3 w-3 text-green-600" />
                      </span>
                      Breadboard and connecting wires
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Arduino Code</h2>
              <button 
                onClick={copyCode}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <pre className="language-cpp p-4 text-gray-300 text-sm overflow-x-auto">
                <code>{arduinoCode}</code>
              </pre>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              This code creates a WebSocket server on your Arduino that sends heart rate and temperature data to any connected clients.
              Make sure to update the WiFi credentials before uploading.
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">Circuit Diagram</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="text-center py-8">
              <div className="animate-pulse inline-block mb-4">
                <AlertCircle className="h-12 w-12 text-blue-400" />
              </div>
              <p className="text-gray-500">
                Connect the pulse sensor to analog pin A0 and the temperature sensor to analog pin A1 on your Arduino.
                Connect the ESP8266/ESP32 module to the Arduino according to the manufacturer's instructions.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            For detailed wiring instructions and troubleshooting, please refer to the 
            <a href="#" className="text-blue-600 hover:underline"> documentation</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArduinoSetup;