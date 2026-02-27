import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Mock } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function PATCH(_request: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM mocks WHERE id = ?').get(params.id) as Mock | undefined;

  if (!existing) {
    return NextResponse.json({ error: 'Mock not found' }, { status: 404 });
  }

  const newActive = existing.is_active ? 0 : 1;
  const now = new Date().toISOString();

  db.prepare('UPDATE mocks SET is_active = ?, updated_at = ? WHERE id = ?').run(newActive, now, params.id);

  const mock = db.prepare('SELECT * FROM mocks WHERE id = ?').get(params.id) as Mock;
  return NextResponse.json(mock);
}
