'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  UserCredential,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '@/config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const DEFAULT_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@fitsapparel.com';
const FIREBASE_SETUP_MESSAGE = 'Firebase is not configured. Copy .env.local.example to .env.local and add your Firebase web app values.';

function getFirebaseErrorCode(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }

  if (error instanceof Error) {
    return error.message.match(/\((auth\/[^)]+)\)/)?.[1];
  }

  return undefined;
}

export function formatAuthError(error: unknown) {
  const code = getFirebaseErrorCode(error);

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Incorrect username/email or password. Please try again.';
  }

  if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
    return 'Firebase Authentication is not enabled for this project. In Firebase Console, open Authentication and enable Email/Password sign-in.';
  }

  if (code === 'auth/invalid-api-key' || code === 'auth/api-key-not-valid') {
    return 'Firebase configuration is invalid. Check the web app config in Firebase Console and update .env.local.';
  }

  if (code?.startsWith('auth/requests-from-referer')) {
    return 'This Firebase API key is blocking requests from localhost. In Google Cloud API key restrictions, allow your local URL or remove the HTTP referrer restriction while developing.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Could not reach Firebase Auth. Check your internet connection and try again.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Firebase temporarily blocked login attempts for this account. Wait a few minutes, then try again.';
  }

  if (code === 'auth/user-disabled') {
    return 'This Firebase account is disabled.';
  }

  if (error instanceof Error) {
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
  signin: (email: string, password: string) => Promise<UserCredential>;
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
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Fetch user role from Firestore
      if (currentUser) {
        try {
          if (db) {
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
          } else {
            setRole(currentUser.email === DEFAULT_ADMIN_EMAIL ? 'admin' : 'user');
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
    if (!auth) {
      throw new Error(FIREBASE_SETUP_MESSAGE);
    }

    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      
      if (db) {
        // Create user profile in Firestore
        const userRole = isAdmin ? 'admin' : 'user';
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          role: userRole,
          createdAt: new Date(),
        });

        setRole(userRole);
      }
    } catch (err: any) {
      setError(formatAuthError(err));
      throw err;
    }
  };

  const signin = async (email: string, password: string) => {
    if (!auth) {
      throw new Error(FIREBASE_SETUP_MESSAGE);
    }

    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      return userCredential;
    } catch (err: any) {
      setError(formatAuthError(err));
      throw err;
    }
  };

  const logout = async () => {
    if (!auth) {
      setUser(null);
      setRole(null);
      return;
    }

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
