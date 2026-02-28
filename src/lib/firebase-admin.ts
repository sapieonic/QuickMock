import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

let _adminAuth: Auth | null = null;

export function getAdminAuth(): Auth {
  if (_adminAuth) return _adminAuth;

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  _adminAuth = getAuth(getApps()[0]);
  return _adminAuth;
}
