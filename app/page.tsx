"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

type EEGDevice = 'neurosky' | 'muse' | 'naxon' | 'diy';

export default function Home() {
  const [emotion, setEmotion] = useState<{ emotion: string; intensity: number } | null>(null);
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [eegDevice, setEegDevice] = useState<EEGDevice>('neurosky');
  const deviceUrls: Record<EEGDevice, string> = {
    neurosky: 'ws://localhost:8765',
    muse: 'ws://localhost:8766',
    naxon: 'ws://localhost:8767',
    diy: 'ws://localhost:8768',
  };

  // Load chat history from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setChatMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Add WebSocket connection for EEG emotion data
  useEffect(() => {
    const ws = new WebSocket(deviceUrls[eegDevice]);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.emotion && typeof data.intensity === 'number') {
          setEmotion({ emotion: data.emotion, intensity: data.intensity });
        }
      } catch (e) {
        console.error('Invalid EEG emotion data:', event.data);
      }
    };
    ws.onerror = (err) => console.error('WebSocket error:', err);
    return () => ws.close();
  }, [eegDevice]);

  useEffect(() => {
    if (emotion) {
      switch (emotion.emotion) {
        case "happy":
          setMessage("You're feeling great! Let's keep this positive energy going.");
          break;
        case "sad":
          setMessage("I'm here to support you. Would you like to talk about what's on your mind?");
          break;
        case "anxious":
          setMessage("Take a deep breath. I'm here to help you work through this.");
          break;
        case "neutral":
          setMessage("How are you feeling today? I'm here to listen.");
          break;
        default:
          setMessage("Let's explore your emotions together.");
      }
    }
  }, [emotion]);

  useEffect(() => {
    if (emotion) {
      const initialMessage = {
        role: 'assistant' as const,
        content: message,
        timestamp: Date.now()
      };
      if (chatMessages.length === 0) {
        setChatMessages([initialMessage]);
      }
    }
  }, [emotion, message]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !emotion) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          emotion: emotion.emotion,
          intensity: emotion.intensity
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-black">EmotionLink Chat</h1>
            {emotion && (
              <p className="text-black">
                Current emotion: {emotion.emotion} (Intensity: {(emotion.intensity * 100).toFixed(0)}%)
              </p>
            )}
          </div>
          
          <div className="mb-4 p-6 border rounded-lg bg-white shadow text-black text-base font-sans leading-relaxed">
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
                <li>Select your EEG device from the dropdown below.</li>
                <li>Download and run the provided connection script for your device (see README or website).</li>
                <li>Wait for the status to show <span className="text-green-700 font-semibold">Connected</span> (or check for live emotion updates).</li>
                <li>Start chatting! The bot will use your live emotion data.</li>
              </ol>
            </div>
            <div className="text-sm text-gray-700 mt-2">
              Need help? See the <a href="/connect-eeg" className="underline text-blue-700 font-semibold">Connect Your EEG</a> guide or contact support.
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="eeg-device" className="mr-2 font-bold">EEG Device:</label>
            <select
              id="eeg-device"
              value={eegDevice}
              onChange={e => setEegDevice(e.target.value as EEGDevice)}
              className="p-2 border rounded-lg"
            >
              <option value="neurosky">NeuroSky Mindwave</option>
              <option value="muse">Muse</option>
              <option value="naxon">Naxon Explorer</option>
              <option value="diy">DIY/Other</option>
            </select>
          </div>

          <div className="h-[500px] overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  msg.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-75">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
