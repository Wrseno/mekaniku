import admin from 'firebase-admin';
import { env } from '@/config/env';

let firebaseApp: admin.app.App;

export function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if Firebase credentials are configured
    if (!env.FIREBASE_PRIVATE_KEY || env.FIREBASE_PRIVATE_KEY.includes('YourPrivateKeyHere')) {
      console.warn('⚠️  Firebase not configured - using mock mode for development');
      console.warn('   Chat features will not work without real Firebase credentials');
      console.warn('   See SETUP.md for Firebase setup instructions');
      return null as any;
    }

    // Parse private key (handle escaped newlines)
    const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      databaseURL: env.FIREBASE_DB_URL,
    });

    console.log('✅ Firebase Admin initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    console.warn('   Continuing in mock mode - chat features disabled');
    return null as any;
  }
}

export function getFirebaseDatabase(): admin.database.Database {
  if (!firebaseApp) {
    const app = initializeFirebase();
    if (!app) {
      // Return mock database for development
      return {
        ref: () => ({
          push: () => Promise.resolve({ key: 'mock-key' }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
          once: () => Promise.resolve({ val: () => null }),
        })
      } as any;
    }
  }
  return admin.database();
}

export function getFirebaseAuth(): admin.auth.Auth {
  if (!firebaseApp) {
    const app = initializeFirebase();
    if (!app) {
      // Return mock auth for development
      return {
        createCustomToken: () => Promise.resolve('mock-token'),
      } as any;
    }
  }
  return admin.auth();
}

export { admin };
