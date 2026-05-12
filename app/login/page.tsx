'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { formatAuthError, useAuth } from '@/context/AuthContext';

const DEFAULT_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@fitsapparel.com';

export default function LoginPage() {
  const router = useRouter();
  const { signin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!identifier || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const loginEmail = identifier.trim().toLowerCase() === 'admin'
      ? DEFAULT_ADMIN_EMAIL
      : identifier.trim();

    try {
      // Sign in with Firebase
      await signin(loginEmail, password);
      
      // Redirect to profile page
      router.push('/profile');
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-16 md:py-24">
      <div className="rounded-2xl border border-black/10 bg-white p-8">
        <h1 className="text-3xl font-semibold text-black">Login</h1>
        <p className="mt-2 text-sm text-black/70">
          Sign in to your Fits Apparel account
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-black">
              Username or Email
            </label>
            <input
              className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-black placeholder-black/50 transition-colors focus:border-black focus:outline-none"
              placeholder="admin or you@example.com"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
            />
            <p className="mt-1 text-xs text-black/60">Default admin login: username admin, password admin123</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Password
            </label>
            <input
              className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-black placeholder-black/50 transition-colors focus:border-black focus:outline-none"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            className="mt-8 w-full bg-black px-6 py-3 text-sm font-medium tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 border-t border-black/10 pt-6 text-center text-sm text-black/70">
          Don't have an account?{' '}
          <NextLink className="font-medium text-black underline underline-offset-2" href="/register">
            Create one
          </NextLink>
        </div>
      </div>
    </div>
  );
}
