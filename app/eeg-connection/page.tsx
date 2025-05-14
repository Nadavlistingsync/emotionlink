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
        <div className="mb-8 p-6 border rounded-lg bg-white shadow text-black text-base font-sans leading-relaxed">
          <h2 className="font-bold mb-3 text-lg">EEG Device Compatibility & Connection Guide</h2>
          <ul className="mb-3 list-disc ml-8 space-y-1">
            <li><b>NeuroSky Mindwave:</b> Fully supported. <span className="text-green-700 font-semibold">Available</span></li>
            <li><b>Muse:</b> Fully supported. <span className="text-green-700 font-semibold">Available</span></li>
            <li><b>Naxon Explorer:</b> Fully supported. <span className="text-green-700 font-semibold">Available</span></li>
            <li><b>DIY/Other:</b> Supported via custom script. <span className="text-green-700 font-semibold">Available</span></li>
          </ul>
          <div className="mb-3">
            <b>How to Connect:</b>
            <ol className="list-decimal ml-8 space-y-1">
              <li>Select your EEG device in the main chat page.</li>
              <li>Download and run the provided connection script for your device (see README or below).</li>
              <li>Wait for the status to show <span className="text-green-700 font-semibold">Connected</span> (or check for live emotion updates in the chat).</li>
              <li>Start chatting! The bot will use your live emotion data.</li>
            </ol>
          </div>
          <div className="text-sm text-gray-700 mt-2">
            <b>Scripts & Guides:</b>
            <ul className="list-disc ml-6">
              <li><a href="/scripts/neurosky-websocket.js" className="underline text-blue-700 font-semibold">NeuroSky WebSocket Script</a></li>
              <li><a href="/scripts/muse-websocket.py" className="underline text-blue-700 font-semibold">Muse WebSocket Script</a></li>
              <li><a href="/scripts/naxon-websocket.py" className="underline text-blue-700 font-semibold">Naxon WebSocket Script</a></li>
              <li><a href="/scripts/diy-websocket.py" className="underline text-blue-700 font-semibold">DIY/Other WebSocket Script</a></li>
            </ul>
            Need more help? Contact support or see the README for detailed setup.
          </div>
        </div>
      </div>
    </div>
  );
} 