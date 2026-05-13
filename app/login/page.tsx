'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';
import { formatAuthError, useAuth } from '@/context/AuthContext';

const DEFAULT_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@fitsapparel.com';

export default function LoginPage() {
  const router = useRouter();
  const { signin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    const nextFieldErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      nextFieldErrors.identifier = 'Username or email is required.';
    }

    if (!password.trim()) {
      nextFieldErrors.password = 'Password is required.';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setLoading(false);
      return;
    }

    const loginEmail = identifier.trim().toLowerCase() === 'admin'
      ? DEFAULT_ADMIN_EMAIL
      : identifier.trim();

    try {
      const userCredential = await signin(loginEmail, password);
      const currentUser = userCredential.user ?? auth?.currentUser;
      let nextRoute = '/';

      if (currentUser?.uid && db) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userRole = (userDoc.data()?.role || 'user') as 'admin' | 'user';
        nextRoute = userRole === 'admin' ? '/admin' : '/';
      }

      router.push(nextRoute);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-10 md:py-16">
      <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm md:p-8">
        <h1 className="text-3xl font-semibold text-black">Login</h1>
        <p className="mt-2 text-sm text-black/70">
          Sign in to your Fits Apparel account
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-7 space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-black">
              Username or Email
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-black placeholder-black/50 transition-all focus:border-black focus:shadow-sm focus:outline-none"
              placeholder="admin or you@example.com"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
            />
            {fieldErrors.identifier && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.identifier}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Password
            </label>
            <div className="relative mt-2">
              <input
                className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 pr-14 text-black placeholder-black/50 transition-all focus:border-black focus:shadow-sm focus:outline-none"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                className="absolute inset-y-0 right-0 flex items-center px-4 text-black/60 transition-colors hover:text-black"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 2l20 20" />
                    <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.9 18.9 0 0 1-4.23 5.65M6.11 6.11A18.4 18.4 0 0 0 2 12s3 8 10 8a11.77 11.77 0 0 0 5.44-1.42" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <button
            className="mt-6 w-full rounded-lg bg-black px-6 py-3 text-sm font-semibold tracking-[0.2em] text-white transition-all hover:bg-black/90 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
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
