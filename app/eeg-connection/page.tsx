'use client';

import { useState } from 'react';

export default function EEGConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('Not Connected');

  const handleConnect = async () => {
    setIsConnecting(true);
    setDeviceStatus('Searching for devices...');

    try {
      // Simulate device connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would implement actual EEG device connection logic
      // For now, we'll simulate a successful connection
      setIsConnected(true);
      setDeviceStatus('Connected');
    } catch (error) {
      console.error('Connection error:', error);
      setDeviceStatus('Connection failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setDeviceStatus('Disconnected');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">EEG Device Connection</h2>
          <p className="text-gray-600 mb-8">Connect your EEG device to start tracking your emotional state in real time.</p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Device Status:</span>
            <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>{deviceStatus}</span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting || isConnected}
              className={`w-1/2 py-2 px-4 rounded-lg text-white ${isConnected ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Connect'}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={!isConnected}
              className={`w-1/2 py-2 px-4 rounded-lg text-white ${!isConnected ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 