'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const DEFAULT_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@fitsapparel.com';

export function formatAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('auth/configuration-not-found')) {
      return 'Firebase Authentication is not enabled for this project. In Firebase Console, open Authentication and enable Email/Password sign-in.';
    }

    if (error.message.includes('auth/api-key-not-valid')) {
      return 'Firebase configuration is invalid. Check the web app config in Firebase Console and update client/web/.env.local.';
    }

    return error.message;
  }

  return 'An unexpected authentication error occurred.';
}

interface AuthContextType {
  user: User | null;
  role: 'user' | 'admin' | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Fetch user role from Firestore
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userRole = userDocSnap.data().role || 'user';
            setRole(userRole);
          } else {
            const inferredRole = currentUser.email === DEFAULT_ADMIN_EMAIL ? 'admin' : 'user';
            await setDoc(userDocRef, {
              email: currentUser.email || '',
              role: inferredRole,
              createdAt: new Date(),
            });
            setRole(inferredRole);
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
          setRole('user');
        }
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, isAdmin?: boolean) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      
      // Create user profile in Firestore
      const userRole = isAdmin ? 'admin' : 'user';
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role: userRole,
        createdAt: new Date(),
      });
      
      setRole(userRole);
    } catch (err: any) {
      setError(formatAuthError(err));
      throw err;
    }
  };

  const signin = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (err: any) {
      setError(formatAuthError(err));
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      setError(formatAuthError(err));
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, error, signup, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
