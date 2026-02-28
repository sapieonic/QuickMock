import { NextRequest } from 'next/server';
import { getAdminAuth } from './firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthResult {
  user: DecodedIdToken;
}

export interface AuthError {
  error: string;
  status: number;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult | AuthError> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', status: 401 };
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    return { user: decodedToken };
  } catch {
    return { error: 'Invalid or expired token', status: 401 };
  }
}

export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return 'error' in result;
}
