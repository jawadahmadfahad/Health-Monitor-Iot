import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Heart, BarChart2, Settings, Activity, User, Menu, X } from 'lucide-react';
import { useSensorData } from '../context/SensorDataContext';
import StatusIndicator from './StatusIndicator';
import { motion } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  const { currentData, isConnected } = useSensorData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                HealthTrack Pro
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { path: '/', icon: Activity, label: 'Dashboard' },
                { path: '/analytics', icon: BarChart2, label: 'Analytics' },
                { path: '/arduino-setup', icon: Settings, label: 'Setup' },
                { path: '/profile', icon: User, label: 'Profile' }
              ].map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Status Bar */}
          {currentData && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-red-50">
                    <Heart className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="font-medium text-gray-700">{currentData.heartRate} BPM</span>
                  <StatusIndicator status={currentData.status.heartRate} />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-yellow-50">
                    <span className="text-yellow-500">◦</span>
                  </div>
                  <span className="font-medium text-gray-700">{currentData.temperature}°C</span>
                  <StatusIndicator status={currentData.status.temperature} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="text-gray-600">{isConnected ? 'Connected' : 'Simulated Data'}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {[
                { path: '/', icon: Activity, label: 'Dashboard' },
                { path: '/analytics', icon: BarChart2, label: 'Analytics' },
                { path: '/arduino-setup', icon: Settings, label: 'Setup' },
                { path: '/profile', icon: User, label: 'Profile' }
              ].map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-gray-800">HealthTrack Pro</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 HealthTrack Pro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;