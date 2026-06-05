import React, { useState } from 'react';
import { useSensorData } from '../context/SensorDataContext';
import { Save, Bell, Sliders } from 'lucide-react';

const Settings = () => {
  const { thresholds, setThresholds } = useSensorData();
  const [formValues, setFormValues] = useState({
    heartRateMin: thresholds.heartRate.min,
    heartRateMax: thresholds.heartRate.max,
    temperatureMin: thresholds.temperature.min,
    temperatureMax: thresholds.temperature.max,
  });
  const [showSaved, setShowSaved] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: Number(value),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setThresholds({
      heartRate: {
        min: formValues.heartRateMin,
        max: formValues.heartRateMax,
      },
      temperature: {
        min: formValues.temperatureMin,
        max: formValues.temperatureMax,
      },
    });
    
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Configure your health monitoring parameters</p>
        
        {showSaved && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 animate-fade-in-out">
            <div className="flex items-center">
              <Save className="h-5 w-5 mr-2" />
              <span>Settings saved successfully!</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Bell className="h-5 w-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Alert Thresholds</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Heart Rate (BPM)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="heartRateMin" className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum (Low Alert)
                      </label>
                      <input
                        type="number"
                        id="heartRateMin"
                        name="heartRateMin"
                        value={formValues.heartRateMin}
                        onChange={handleInputChange}
                        min="30"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">Recommended: 50-60 BPM</p>
                    </div>
                    <div>
                      <label htmlFor="heartRateMax" className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum (High Alert)
                      </label>
                      <input
                        type="number"
                        id="heartRateMax"
                        name="heartRateMax"
                        value={formValues.heartRateMax}
                        onChange={handleInputChange}
                        min="60"
                        max="200"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">Recommended: 90-100 BPM</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Temperature (°C)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="temperatureMin" className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum (Low Alert)
                      </label>
                      <input
                        type="number"
                        id="temperatureMin"
                        name="temperatureMin"
                        value={formValues.temperatureMin}
                        onChange={handleInputChange}
                        min="10"
                        max="30"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">Recommended: 18-21°C</p>
                    </div>
                    <div>
                      <label htmlFor="temperatureMax" className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum (High Alert)
                      </label>
                      <input
                        type="number"
                        id="temperatureMax"
                        name="temperatureMax"
                        value={formValues.temperatureMax}
                        onChange={handleInputChange}
                        min="20"
                        max="50"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">Recommended: 26-30°C</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Sliders className="h-5 w-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Display Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <span className="ml-2 text-gray-700">Show animations</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <span className="ml-2 text-gray-700">Enable sound alerts</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <span className="ml-2 text-gray-700">Dark mode (coming soon)</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature Unit
                  </label>
                  <select
                    className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue="celsius"
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;