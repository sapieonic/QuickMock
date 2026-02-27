import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { HTTP_METHODS, HttpMethod, Mock } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const method = searchParams.get('method') || '';
  const active = searchParams.get('active');

  let query = 'SELECT * FROM mocks WHERE 1=1';
  const params: unknown[] = [];

  if (search) {
    query += ' AND (name LIKE ? OR route_path LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (method) {
    query += ' AND method = ?';
    params.push(method.toUpperCase());
  }
  if (active !== null && active !== '') {
    query += ' AND is_active = ?';
    params.push(Number(active));
  }

  query += ' ORDER BY updated_at DESC';

  const mocks = db.prepare(query).all(...params) as Mock[];
  return NextResponse.json(mocks);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  const { name, route_path, method, request_headers, query_params, response_status_code, response_headers, response_body, is_active } = body;

  if (!name || !route_path) {
    return NextResponse.json({ error: 'name and route_path are required' }, { status: 400 });
  }

  const normalizedMethod = (method || 'GET').toUpperCase() as HttpMethod;
  if (!HTTP_METHODS.includes(normalizedMethod)) {
    return NextResponse.json({ error: `Invalid method. Must be one of: ${HTTP_METHODS.join(', ')}` }, { status: 400 });
  }

  // Validate JSON fields if provided
  for (const [field, value] of Object.entries({ request_headers, query_params, response_headers })) {
    if (value) {
      try {
        JSON.parse(value);
      } catch {
        return NextResponse.json({ error: `${field} must be valid JSON` }, { status: 400 });
      }
    }
  }

  const normalizedPath = route_path.startsWith('/') ? route_path.slice(1) : route_path;
  const now = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO mocks (name, route_path, method, request_headers, query_params, response_status_code, response_headers, response_body, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    normalizedPath,
    normalizedMethod,
    request_headers || null,
    query_params || null,
    response_status_code ?? 200,
    response_headers || null,
    response_body || null,
    is_active !== undefined ? (is_active ? 1 : 0) : 1,
    now,
    now
  );

  const mock = db.prepare('SELECT * FROM mocks WHERE id = ?').get(result.lastInsertRowid) as Mock;
  return NextResponse.json(mock, { status: 201 });
}
