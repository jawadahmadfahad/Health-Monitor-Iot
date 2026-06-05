import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SensorDataProvider } from './context/SensorDataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ArduinoSetup from './pages/ArduinoSetup';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <SensorDataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="arduino-setup" element={<ArduinoSetup />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </SensorDataProvider>
  );
}

export default App;