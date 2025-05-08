"use client";

import { useState, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { MoodEntry, ChatLog } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const supabase = createSupabaseBrowserClient();

export default function Home() {
  const [emotion, setEmotion] = useState<{ emotion: string; intensity: number } | null>(null);
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Load mood history
  useEffect(() => {
    const loadMoodHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        toast.error('Failed to load mood history');
        return;
      }

      setMoodHistory(data || []);
    };

    loadMoodHistory();
  }, []);

  // Save mood entry when emotion changes
  useEffect(() => {
    const saveMoodEntry = async () => {
      if (!emotion) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('mood_entries')
        .insert([
          {
            user_id: user.id,
            emotion: emotion.emotion,
            intensity: emotion.intensity,
          },
        ]);

      if (error) {
        toast.error('Failed to save mood entry');
        return;
      }

      // Update mood history
      setMoodHistory(prev => [
        {
          id: Date.now().toString(),
          user_id: user.id,
          emotion: emotion.emotion,
          intensity: emotion.intensity,
          created_at: new Date().toISOString(),
        },
        ...prev.slice(0, 4),
      ]);
    };

    saveMoodEntry();
  }, [emotion]);

  useEffect(() => {
    const fetchEmotion = async () => {
      try {
        const response = await fetch("/api/emotion");
        const data = await response.json();
        setEmotion(data);
      } catch (error) {
        console.error("Error fetching emotion:", error);
      }
    };

    // Initial fetch
    fetchEmotion();

    // Set up polling every 5 seconds
    const interval = setInterval(fetchEmotion, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

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
      // Only add initial message if there are no messages yet
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

        // Save chat log to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('chat_logs').insert([
            {
              user_id: user.id,
              role: 'user',
              content: inputMessage,
            },
            {
              user_id: user.id,
              role: 'assistant',
              content: data.response,
            },
          ]);
        }
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
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white font-sans space-y-8 px-4">
      <div className="flex items-center space-x-4">
        <img src="/logo.png" alt="EmotionLink" className="h-12 w-12" />
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          EmotionLink
        </h1>
      </div>
      
      {emotion ? (
        <div className="space-y-4 text-center">
          <p className="text-4xl font-semibold">
            Current Emotion: <span className="text-blue-400">{emotion.emotion.charAt(0).toUpperCase() + emotion.emotion.slice(1)}</span>
          </p>
          <p className="text-2xl">
            Intensity: <span className="text-blue-400">{(emotion.intensity * 100).toFixed(0)}%</span>
          </p>
        </div>
      ) : (
        <p className="text-2xl text-gray-400">Loading emotion data...</p>
      )}

      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-4 space-y-4">
        <div className="h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-200'
                }`}
              >
                <div className="flex flex-col">
                  <span className="break-words">{msg.content}</span>
                  <span className="text-xs opacity-50 mt-1">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Mood History</h2>
        <div className="space-y-2">
          {moodHistory.map((entry) => (
            <div key={entry.id} className="flex justify-between items-center p-2 bg-gray-700 rounded-lg">
              <span className="capitalize">{entry.emotion}</span>
              <span className="text-blue-400">{(entry.intensity * 100).toFixed(0)}%</span>
              <span className="text-sm text-gray-400">
                {new Date(entry.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button 
        disabled 
        className="mt-8 bg-gray-600 text-white px-8 py-4 text-xl font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Connect EEG Headset
      </button>
      <p className="text-gray-400 text-sm">
        EEG integration coming soon – using OpenBCI / Emotiv SDKs
      </p>
    </div>
  );
}
