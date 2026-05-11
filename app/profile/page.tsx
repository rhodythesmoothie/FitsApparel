'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('fitsApparelUser');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('fitsApparelUser');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md py-16 text-center md:py-24">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl py-8 md:py-16">
      <div className="rounded-2xl border border-black/10 bg-white p-8">
        <h1 className="text-3xl font-semibold text-black">My Profile</h1>

        <div className="mt-8 space-y-6">
          <div>
            <p className="text-sm font-medium text-black/70">Email</p>
            <p className="mt-2 text-lg text-black">{user.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-black/70">Name</p>
            <p className="mt-2 text-lg text-black">{user.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-black/70">Account Created</p>
            <p className="mt-2 text-lg text-black">
              {new Date(user.loginTime).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-3 border-t border-black/10 pt-8">
          <button
            className="w-full border border-black px-6 py-3 text-sm font-medium tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
            onClick={handleLogout}
            type="button"
          >
            LOG OUT
          </button>
          <NextLink
            className="block w-full border border-black/20 bg-black/5 px-6 py-3 text-center text-sm font-medium tracking-[0.2em] text-black transition-colors hover:bg-black/10"
            href="/"
          >
            CONTINUE SHOPPING
          </NextLink>
        </div>
      </div>
    </div>
  );
}
