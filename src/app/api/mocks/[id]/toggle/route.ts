import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(_request: NextRequest, { params }: { params: { id: string } }) {
  const existing = await queryOne('SELECT * FROM mocks WHERE id = ?', [params.id]);

  if (!existing) {
    return NextResponse.json({ error: 'Mock not found' }, { status: 404 });
  }

  const newActive = existing.is_active ? 0 : 1;
  const now = new Date().toISOString();

  await execute('UPDATE mocks SET is_active = ?, updated_at = ? WHERE id = ?', [newActive, now, params.id]);

  const mock = await queryOne('SELECT * FROM mocks WHERE id = ?', [params.id]);
  return NextResponse.json(mock);
}
