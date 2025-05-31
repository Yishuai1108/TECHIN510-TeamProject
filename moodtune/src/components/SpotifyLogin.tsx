'use client';

import { signIn } from 'next-auth/react';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';

export default function SpotifyLogin() {
  return (
    <button
      onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}
      className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <MusicalNoteIcon className="h-5 w-5" />
      <span>Login with Spotify</span>
    </button>
  );
} 