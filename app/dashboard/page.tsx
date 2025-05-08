'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('Dashboard: getUser result', { user, error });
        if (!user || error) {
          router.push('/login');
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Dashboard: getUser threw error', err);
        router.push('/login');
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleChatbotClick = () => {
    router.push('/chatbot');
  };

  const handleEEGClick = () => {
    router.push('/eeg-connection');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to EmotionLink</h1>
          <p className="text-xl text-gray-600 mb-12">Your personal emotional wellness companion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Chatbot Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-center h-24 w-24 mx-auto mb-4 bg-blue-100 rounded-full">
                <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">AI Chatbot</h2>
              <p className="text-gray-600 mb-6 text-center">Connect with our AI therapist for emotional support and guidance</p>
              <button
                onClick={handleChatbotClick}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Start Chat
              </button>
            </div>
          </div>

          {/* EEG Connection Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-center h-24 w-24 mx-auto mb-4 bg-green-100 rounded-full">
                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">EEG Connection</h2>
              <p className="text-gray-600 mb-6 text-center">Connect your EEG device for real-time emotional analysis</p>
              <button
                onClick={handleEEGClick}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-300"
              >
                Connect EEG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 