'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function EEGConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('Not Connected');
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session || error) {
        router.push('/login');
      }
    };

    checkSession();
  }, [router, supabase]);

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">EEG Device Connection</h1>
          <p className="text-xl text-gray-600">Connect your EEG device to start emotional analysis</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className={`h-32 w-32 rounded-full flex items-center justify-center ${
                isConnected ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <svg
                  className={`h-16 w-16 ${isConnected ? 'text-green-600' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 mb-2">Device Status</p>
              <p className={`text-xl ${
                isConnected ? 'text-green-600' : 'text-gray-600'
              }`}>
                {deviceStatus}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 flex items-center"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  'Connect Device'
                )}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition duration-300"
              >
                Disconnect Device
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 