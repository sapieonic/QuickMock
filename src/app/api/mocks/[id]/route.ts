import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { HTTP_METHODS, HttpMethod } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const mock = await queryOne('SELECT * FROM mocks WHERE id = ?', [params.id]);

  if (!mock) {
    return NextResponse.json({ error: 'Mock not found' }, { status: 404 });
  }

  return NextResponse.json(mock);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const existing = await queryOne('SELECT * FROM mocks WHERE id = ?', [params.id]);

  if (!existing) {
    return NextResponse.json({ error: 'Mock not found' }, { status: 404 });
  }

  const body = await request.json();
  const { name, route_path, method, request_headers, query_params, response_status_code, response_headers, response_body, is_active } = body;

  if (!name || !route_path) {
    return NextResponse.json({ error: 'name and route_path are required' }, { status: 400 });
  }

  const normalizedMethod = (method || 'GET').toUpperCase() as HttpMethod;
  if (!HTTP_METHODS.includes(normalizedMethod)) {
    return NextResponse.json({ error: `Invalid method. Must be one of: ${HTTP_METHODS.join(', ')}` }, { status: 400 });
  }

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

  await execute(
    `UPDATE mocks SET name = ?, route_path = ?, method = ?, request_headers = ?, query_params = ?,
      response_status_code = ?, response_headers = ?, response_body = ?, is_active = ?, updated_at = ?
    WHERE id = ?`,
    [
      name,
      normalizedPath,
      normalizedMethod,
      request_headers || null,
      query_params || null,
      response_status_code ?? 200,
      response_headers || null,
      response_body || null,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      now,
      params.id,
    ]
  );

  const mock = await queryOne('SELECT * FROM mocks WHERE id = ?', [params.id]);
  return NextResponse.json(mock);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const existing = await queryOne('SELECT * FROM mocks WHERE id = ?', [params.id]);

  if (!existing) {
    return NextResponse.json({ error: 'Mock not found' }, { status: 404 });
  }

  await execute('DELETE FROM mocks WHERE id = ?', [params.id]);
  return NextResponse.json({ message: 'Mock deleted' });
}
