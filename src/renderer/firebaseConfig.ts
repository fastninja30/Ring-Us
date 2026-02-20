// src/renderer/firebaseConfig.ts
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseKeys from './../../../firebase-config.json';

let app: FirebaseApp;

// Check if a Firebase app has already been initialized
if (!getApps().length) {
  // If not, initialize it
  app = initializeApp(firebaseKeys);
} else {
  // If yes, use the existing one
  app = getApp();
}

// Export services for use in your components
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
