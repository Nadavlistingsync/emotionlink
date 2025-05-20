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
    if (!inputMessage.trim()) return;

    // Use default neutral emotion if none is present
    const emotionToSend = emotion || { emotion: 'neutral', intensity: 0.5 };

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
          emotion: emotionToSend.emotion,
          intensity: emotionToSend.intensity
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
    <main className="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--muted-background)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card animate-slide-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                EmotionLink
              </h1>
              <p className="text-[var(--muted)] mt-1">Your emotion-aware chatbot</p>
            </div>
            {emotion && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--muted-background)]">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)] animate-pulse"></div>
                <span className="text-sm font-medium">
                  {emotion.emotion} ({(emotion.intensity * 100).toFixed(0)}%)
                </span>
              </div>
            )}
          </div>

          <div className="mb-6 p-6 rounded-xl bg-[var(--muted-background)] border border-[var(--border)]">
            <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">EEG Device Setup</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="eeg-device" className="block text-sm font-medium mb-2">Select Device</label>
                <select
                  id="eeg-device"
                  value={eegDevice}
                  onChange={e => setEegDevice(e.target.value as EEGDevice)}
                  className="input-primary"
                  aria-label="Select EEG device"
                >
                  <option value="neurosky">NeuroSky Mindwave</option>
                  <option value="muse">Muse</option>
                  <option value="naxon">Naxon Explorer</option>
                  <option value="diy">DIY/Other</option>
                </select>
              </div>
              <div className="flex items-end">
                <a
                  href="/eeg-connection"
                  className="btn-secondary w-full text-center"
                  aria-label="View connection guide"
                >
                  Connection Guide
                </a>
              </div>
            </div>
          </div>

          <div className="h-[500px] overflow-y-auto mb-6 rounded-xl bg-[var(--muted-background)] p-4 border border-[var(--border)]">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 animate-slide-in ${
                  msg.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-4 rounded-2xl max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-white dark:bg-[var(--muted-background)] text-[var(--foreground)]'
                  }`}
                  role="message"
                  aria-label={`${msg.role === 'user' ? 'Your' : 'Assistant'} message`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-75 mt-2 block">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4 animate-slide-in">
                <div className="bg-white dark:bg-[var(--muted-background)] p-4 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="input-primary"
              disabled={isLoading}
              aria-label="Message input"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="btn-primary whitespace-nowrap"
              aria-label={isLoading ? 'Sending message...' : 'Send message'}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
