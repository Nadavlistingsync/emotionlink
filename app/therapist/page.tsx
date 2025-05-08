"use client";

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { User, MoodEntry, ChatLog, TherapistNote } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const supabase = createSupabaseBrowserClient();

export default function TherapistDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [notes, setNotes] = useState<TherapistNote[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'user');

      if (error) {
        toast.error('Failed to load users');
        return;
      }

      setUsers(data || []);
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const loadUserData = async () => {
      // Load mood data
      const { data: moodData, error: moodError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', selectedUser.id)
        .order('created_at', { ascending: true });

      if (moodError) {
        toast.error('Failed to load mood data');
        return;
      }

      setMoodData(moodData || []);

      // Load chat logs
      const { data: chatData, error: chatError } = await supabase
        .from('chat_logs')
        .select('*')
        .eq('user_id', selectedUser.id)
        .order('created_at', { ascending: false });

      if (chatError) {
        toast.error('Failed to load chat logs');
        return;
      }

      setChatLogs(chatData || []);

      // Load therapist notes
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: noteData, error: noteError } = await supabase
        .from('therapist_notes')
        .select('*')
        .eq('user_id', selectedUser.id)
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });

      if (noteError) {
        toast.error('Failed to load notes');
        return;
      }

      setNotes(noteData || []);
    };

    loadUserData();
  }, [selectedUser]);

  const handleAddNote = async () => {
    if (!selectedUser || !newNote.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('therapist_notes')
      .insert([
        {
          therapist_id: user.id,
          user_id: selectedUser.id,
          content: newNote,
        },
      ]);

    if (error) {
      toast.error('Failed to add note');
      return;
    }

    setNotes(prev => [
      {
        id: Date.now().toString(),
        therapist_id: user.id,
        user_id: selectedUser.id,
        content: newNote,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewNote('');
    toast.success('Note added successfully');
  };

  const handleExportMoodData = () => {
    if (!selectedUser || moodData.length === 0) return;

    const csvContent = [
      ['Date', 'Emotion', 'Intensity'],
      ...moodData.map(entry => [
        new Date(entry.created_at).toLocaleDateString(),
        entry.emotion,
        entry.intensity,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-data-${selectedUser.email}-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const chartData = {
    labels: moodData.map(entry => new Date(entry.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Emotion Intensity',
        data: moodData.map(entry => entry.intensity * 100),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Therapist Dashboard</h1>
          <button
            onClick={() => setSelectedUser(null)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            Back to Users
          </button>
        </div>

        {!selectedUser ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <div
                key={user.id}
                className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700"
                onClick={() => setSelectedUser(user)}
              >
                <h3 className="text-xl font-semibold">{user.email}</h3>
                <p className="text-gray-400">User</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">{selectedUser.email}</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Mood Trends</h3>
                <div className="h-64">
                  <Line data={chartData} />
                </div>
                <button
                  onClick={handleExportMoodData}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                  Export Mood Data
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Chat History</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {chatLogs.map(log => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-lg ${
                        log.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                      }`}
                    >
                      <p className="text-sm text-gray-300 mb-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      <p>{log.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Therapist Notes</h3>
                <div className="space-y-4">
                  {notes.map(note => (
                    <div key={note.id} className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-300 mb-1">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                      <p>{note.content}</p>
                    </div>
                  ))}
                  <div className="mt-4">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a new note..."
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 