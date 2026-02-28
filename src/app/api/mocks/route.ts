import { NextRequest, NextResponse } from 'next/server';
import { type InValue } from '@libsql/client';
import { queryAll, queryOne, execute } from '@/lib/db';
import { verifyAuth, isAuthError } from '@/lib/auth';
import { HTTP_METHODS, HttpMethod } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const userId = authResult.user.uid;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const method = searchParams.get('method') || '';
  const active = searchParams.get('active');

  let query = 'SELECT * FROM mocks WHERE user_id = ?';
  const params: InValue[] = [userId];

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

  const mocks = await queryAll(query, params);
  return NextResponse.json(mocks);
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const userId = authResult.user.uid;

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

  const result = await execute(
    `INSERT INTO mocks (name, route_path, method, request_headers, query_params, response_status_code, response_headers, response_body, is_active, user_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      normalizedPath,
      normalizedMethod,
      request_headers || null,
      query_params || null,
      response_status_code ?? 200,
      response_headers || null,
      response_body || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      userId,
      now,
      now,
    ]
  );

  const mock = await queryOne('SELECT * FROM mocks WHERE id = ?', [Number(result.lastInsertRowid)]);
  return NextResponse.json(mock, { status: 201 });
}
