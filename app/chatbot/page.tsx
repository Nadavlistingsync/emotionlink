'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from 'react';
import { EEGProvider, useEEG } from '@/lib/interpretEEG';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function ChatbotInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState<{emotion: string, intensity: number, timestamp: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emotionState = useEEG();
  const [error, setError] = useState<string | null>(null);
  const [typingIndicator, setTypingIndicator] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setEmotionHistory((prev) => [
      ...prev.slice(-19), // keep last 20
      { ...emotionState }
    ]);
  }, [emotionState]);

  const averageIntensity = emotionHistory.reduce((sum, e) => sum + e.intensity, 0) / (emotionHistory.length || 1);
  const mostFrequentEmotion = (() => {
    const freq: Record<string, number> = {};
    emotionHistory.forEach(e => { freq[e.emotion] = (freq[e.emotion] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setTypingIndicator(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          emotion: emotionState.emotion,
          intensity: emotionState.intensity
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      if (!data.response) {
        throw new Error('No response received from the AI');
      }
      
      // Simulate natural typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message.includes('AI service is not properly configured')) {
        errorMessage = 'The AI service is not properly configured. Please contact support.';
      } else if (error.message.includes('Error communicating with AI service')) {
        errorMessage = 'Having trouble connecting to the AI service. Please try again in a moment.';
      } else if (error.message.includes('No response received')) {
        errorMessage = 'The AI service is not responding. Please try again.';
      }
      
      setError(errorMessage);
      const errorMessageObj: Message = {
        role: 'assistant',
        content: errorMessage,
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 tracking-tight drop-shadow">AI Therapist</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center justify-between" role="alert">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-4 px-2 py-1 bg-red-200 rounded hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-400">Dismiss</button>
            </div>
          )}

          {/* Analytics Section */}
          <div className="mb-10 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold mb-4 text-purple-700">Emotion Trends</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={emotionHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={false} />
                <YAxis domain={[0, 1]} />
                <Tooltip formatter={(value: any) => (typeof value === 'number' ? (value * 100).toFixed(0) + '%' : value)} />
                <Line type="monotone" dataKey="intensity" stroke="#7c3aed" dot={false} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex gap-8 justify-center text-base">
              <span className="text-blue-700">Average Intensity: <b>{(averageIntensity * 100).toFixed(0)}%</b></span>
              <span className="text-purple-700">Most Frequent Emotion: <b>{mostFrequentEmotion}</b></span>
            </div>
          </div>

          {/* Chat UI */}
          <div className="h-96 overflow-y-auto mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-inner focus:outline-none">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] px-4 py-2 rounded-xl shadow ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-blue-400`} 
                  tabIndex={0} 
                  aria-label={msg.role === 'user' ? 'User message' : 'Assistant message'}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {typingIndicator && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-xl shadow">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isLoading}
              aria-label="Type your message"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-semibold shadow transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Chatbot() {
  return (
    <ClientOnly>
      <EEGProvider>
        <ChatbotInner />
      </EEGProvider>
    </ClientOnly>
  );
} 