import { redirect } from 'next/navigation';

export default function ConnectEEGRedirect() {
  redirect('/eeg-connection');
  return null;
} 