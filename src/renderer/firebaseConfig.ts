// src/renderer/firebaseConfig.ts
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseKeys from '../../firebase-config.json';

// Check if a Firebase app has already been initialized
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseKeys)
  : getApp();

// Export services for use in your components
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
