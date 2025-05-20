'use client';

import { useState } from 'react';

type EEGDevice = 'neurosky' | 'muse' | 'naxon' | 'diy';

const deviceUrls: Record<EEGDevice, string> = {
  neurosky: 'ws://localhost:8765',
  muse: 'ws://localhost:8766',
  naxon: 'ws://localhost:8767',
  diy: 'ws://localhost:8768',
};

export default function EEGConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('Not Connected');
  const [eegDevice, setEegDevice] = useState<EEGDevice>('neurosky');

  const handleConnect = async () => {
    setIsConnecting(true);
    setDeviceStatus('Searching for devices...');

    try {
      // Create WebSocket connection based on selected device
      const ws = new WebSocket(deviceUrls[eegDevice]);
      
      // Set a timeout for connection
      const connectionTimeout = setTimeout(() => {
        ws.close();
        throw new Error('Connection timeout - No device found');
      }, 5000);

      // Wait for connection
      await new Promise((resolve, reject) => {
        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          resolve(true);
        };
        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          reject(new Error('Failed to connect to device'));
        };
      });

      // Test if we can receive data
      const dataTimeout = setTimeout(() => {
        ws.close();
        throw new Error('No data received from device');
      }, 3000);

      await new Promise((resolve, reject) => {
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.poorSignalLevel === 200) {
              reject(new Error('Device not properly connected'));
            } else {
              clearTimeout(dataTimeout);
              resolve(true);
            }
          } catch (e) {
            reject(new Error('Invalid data received from device'));
          }
        };
      });

      setIsConnected(true);
      setDeviceStatus('Connected');
    } catch (error) {
      console.error('Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDeviceStatus(`Connection failed: ${errorMessage}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setDeviceStatus('Disconnected');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--muted-background)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card animate-slide-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                EEG Connection Guide
              </h1>
              <p className="text-[var(--muted)] mt-1">Connect your EEG device to start chatting</p>
            </div>
          </div>

          <div className="mb-8 p-6 rounded-xl bg-[var(--muted-background)] border border-[var(--border)]">
            <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">Device Compatibility</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'NeuroSky Mindwave', status: 'Available', color: 'var(--success)' },
                { name: 'Muse', status: 'Available', color: 'var(--success)' },
                { name: 'Naxon Explorer', status: 'Available', color: 'var(--success)' },
                { name: 'DIY/Other', status: 'Available', color: 'var(--success)' }
              ].map((device, index) => (
                <div key={index} className="p-4 rounded-lg bg-white dark:bg-[var(--muted-background)] border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{device.name}</span>
                    <span className="text-sm px-2 py-1 rounded-full" style={{ backgroundColor: `${device.color}20`, color: device.color }}>
                      {device.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 p-6 rounded-xl bg-[var(--muted-background)] border border-[var(--border)]">
            <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">Connection Steps</h2>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: 'Select Your Device',
                  description: 'Choose your EEG device from the dropdown menu in the main chat interface.'
                },
                {
                  step: 2,
                  title: 'Download Connection Script',
                  description: 'Download and run the provided connection script for your specific device.'
                },
                {
                  step: 3,
                  title: 'Wait for Connection',
                  description: 'The status will show "Connected" when your device is successfully linked.'
                },
                {
                  step: 4,
                  title: 'Start Chatting',
                  description: 'Begin your conversation! The chatbot will use your live emotion data.'
                }
              ].map((step) => (
                <div key={step.step} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-[var(--muted-background)] border border-[var(--border)]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{step.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <a
              href="/"
              className="btn-primary"
              aria-label="Return to chat"
            >
              Return to Chat
            </a>
          </div>
        </div>
      </div>
    </main>
  );
} 