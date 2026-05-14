import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

export const isFirebaseConfigured = Boolean(
  firebaseApiKey &&
    firebaseAuthDomain &&
    firebaseProjectId &&
    firebaseStorageBucket &&
    firebaseMessagingSenderId &&
    firebaseAppId,
);

// Firebase configuration - sourced from environment variables
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

// Initialize Firebase
const app: FirebaseApp | null = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth | null = app ? getAuth(app) : null;

// Initialize Firestore
export const db: Firestore | null = app ? getFirestore(app) : null;

// Initialize Firebase Storage
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

export default app;
