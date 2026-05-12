'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { formatAuthError, useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const adminKey = new URLSearchParams(window.location.search).get('adminKey');
    if (adminKey === process.env.NEXT_PUBLIC_ADMIN_KEY) {
      setIsAdmin(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Check admin key if user is trying to create admin account
    let createAsAdmin = isAdmin;
    if (formData.adminKey && !isAdmin) {
      if (formData.adminKey === process.env.NEXT_PUBLIC_ADMIN_KEY) {
        createAsAdmin = true;
      } else {
        setError('Invalid admin key.');
        setLoading(false);
        return;
      }
    }

    try {
      // Create user with Firebase
      await signup(formData.email, formData.password, createAsAdmin);

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
        <h1 className="text-3xl font-semibold text-black">Create Account</h1>
        <p className="mt-2 text-sm text-black/70">
          Join Fits Apparel and start shopping
        </p>

        {isAdmin && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            <strong>Admin Registration:</strong> You are creating an admin account.
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-black">
              Full Name
            </label>
            <input
              className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-black placeholder-black/50 transition-colors focus:border-black focus:outline-none"
              name="name"
              placeholder="John Doe"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Email
            </label>
            <input
              className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-black placeholder-black/50 transition-colors focus:border-black focus:outline-none"
              name="email"
              placeholder="you@example.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Password
            </label>
            <input
              className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-black placeholder-black/50 transition-colors focus:border-black focus:outline-none"
              name="password"
              placeholder="••••••••"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Confirm Password
            </label>
            <input
              className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-black placeholder-black/50 transition-colors focus:border-black focus:outline-none"
              name="confirmPassword"
              placeholder="••••••••"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {!isAdmin && (
            <div>
              <label className="block text-sm font-medium text-black">
                Admin Key (Leave blank for regular user)
              </label>
              <input
                className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-black placeholder-black/50 transition-colors focus:border-black focus:outline-none"
                name="adminKey"
                placeholder="Leave blank if you're a regular user"
                type="password"
                value={formData.adminKey}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-black/50">Enter the admin key to create an admin account</p>
            </div>
          )}

          <button
            className="mt-8 w-full bg-black px-6 py-3 text-sm font-medium tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-6 border-t border-black/10 pt-6 text-center text-sm text-black/70">
          Already have an account?{' '}
          <NextLink className="font-medium text-black underline underline-offset-2" href="/login">
            Sign in
          </NextLink>
        </div>
      </div>
    </div>
  );
}
