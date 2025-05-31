"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });
      const data = await res.json();
      console.log('register api response:', data);
      if (res.ok) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.log('register api catch error:', err);
      setError('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="w-full max-w-md p-8 bg-white bg-opacity-90 rounded-2xl shadow-2xl flex flex-col items-center">
        <Image src="/images/music-notes.svg" alt="music-notes" width={78} height={78} className="mb-4" />
        <h2 className="text-3xl font-extrabold text-indigo-800 mb-2 tracking-tight">Create your MoodTune account</h2>
        <p className="text-gray-500 text-base mb-6">Sign up with your email</p>
        <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
          <input
            className="w-full p-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            type="text"
            required
          />
          <input
            className="w-full p-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <input
            className="w-full p-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
          <input
            className="w-full p-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="Confirm Password"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-md mt-2"
          >
            Register
          </button>
        </form>
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        {success && <div className="text-green-600 mt-4 text-center">{success}</div>}
        <div className="mt-6 text-gray-600 text-center">
          Already have an account?{' '}
          <span
            className="text-indigo-600 hover:underline cursor-pointer font-medium"
            onClick={() => router.push('/login')}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
} 