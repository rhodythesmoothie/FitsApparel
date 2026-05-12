'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    if (!loading && user && role !== 'admin') {
      router.replace('/');
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== 'admin') {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center md:py-16">
        <p className="text-black/70">Checking admin access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
