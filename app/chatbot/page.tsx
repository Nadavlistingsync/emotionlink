'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { EEGProvider, useEEG } from '@/lib/interpretEEG';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

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
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const emotionState = useEEG();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session || error) {
        router.push('/login');
      }
    };

    checkSession();
  }, [router, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setEmotionHistory((prev) => [
      ...prev.slice(-19), // keep last 20
      { ...emotionState }
    ]);
  }, [emotionState]);

  const averageIntensity = (emotionHistory.reduce((sum, e) => sum + e.intensity, 0) / (emotionHistory.length || 1)).toFixed(2);
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

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">AI Chatbot</h2>

          {/* Analytics Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Emotion Trends</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={emotionHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={false} />
                <YAxis domain={[0, 1]} />
                <Tooltip formatter={(value: any) => (typeof value === 'number' ? (value * 100).toFixed(0) + '%' : value)} />
                <Line type="monotone" dataKey="intensity" stroke="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex gap-8">
              <span>Average Intensity: <b>{(averageIntensity * 100).toFixed(0)}%</b></span>
              <span>Most Frequent Emotion: <b>{mostFrequentEmotion}</b></span>
            </div>
          </div>

          <div className="h-96 overflow-y-auto mb-4 bg-gray-100 rounded-lg p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-900'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
    <EEGProvider>
      <ChatbotInner />
    </EEGProvider>
  );
} 