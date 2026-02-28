import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { verifyAuth, isAuthError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await verifyAuth(request);
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const userId = authResult.user.uid;

  const existing = await queryOne('SELECT * FROM mocks WHERE id = ? AND user_id = ?', [params.id, userId]);

  if (!existing) {
    return NextResponse.json({ error: 'Mock not found' }, { status: 404 });
  }

  const newActive = existing.is_active ? 0 : 1;
  const now = new Date().toISOString();

  await execute('UPDATE mocks SET is_active = ?, updated_at = ? WHERE id = ? AND user_id = ?', [newActive, now, params.id, userId]);

  const mock = await queryOne('SELECT * FROM mocks WHERE id = ? AND user_id = ?', [params.id, userId]);
  return NextResponse.json(mock);
}
