"use client";
import { signIn } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Suspense } from 'react';

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const outerDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('body.className:', document.body.className);
    console.log('body.style.background:', document.body.style.background);
    if (outerDivRef.current) {
      console.log('login outer div className:', outerDivRef.current.className);
    }
    const urlError = searchParams?.get('error');
    if (urlError) {
      setError('Invalid email or password');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password
    });
    if (res?.ok) {
      router.push('/dashboard');
    } else {
      const message = typeof res?.error === 'string' ? res.error : 'Invalid email or password';
      setError(message);
      console.log('Login error:', res?.error);
    }
  };

  return (
    <div ref={outerDivRef} className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="w-full max-w-md p-8 bg-white bg-opacity-90 rounded-2xl shadow-2xl flex flex-col items-center">
        <Image src="/images/music-notes.svg" alt="music-notes" width={78} height={78} className="mb-4" />
        <h2 className="text-3xl font-extrabold text-indigo-800 mb-2 tracking-tight">Sign in to MoodTune</h2>
        <p className="text-gray-500 text-base mb-6">Sign in with your email or Spotify account</p>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
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
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-md mt-2"
          >
            Sign in with Email
          </button>
        </form>
        <div className="w-full flex items-center my-4">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        {typeof error === 'string' && error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        <div className="mt-6 text-gray-600 text-center">
          Don't have an account?{' '}
          <span
            className="text-indigo-600 hover:underline cursor-pointer font-medium"
            onClick={() => router.push('/register')}
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
} 