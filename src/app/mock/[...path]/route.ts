import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { Mock } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function handleMockRequest(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const routePath = pathSegments.join('/');
  const method = request.method.toUpperCase();

  // Find all active mocks matching route and method
  const candidates = await queryAll(
    'SELECT * FROM mocks WHERE route_path = ? AND method = ? AND is_active = 1',
    [routePath, method]
  ) as unknown as Mock[];

  if (candidates.length === 0) {
    return NextResponse.json(
      {
        error: 'No mock found',
        debug: {
          requested_path: routePath,
          requested_method: method,
          hint: 'Create a mock at the dashboard or check that it is active',
        },
      },
      { status: 404 }
    );
  }

  // Score candidates by how well they match request headers and query params
  const requestHeaders = Object.fromEntries(request.headers.entries());
  const requestQuery = Object.fromEntries(new URL(request.url).searchParams.entries());

  let bestMatch: Mock | null = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    let score = 0;
    let disqualified = false;

    // Check request headers matching
    if (candidate.request_headers) {
      try {
        const requiredHeaders = JSON.parse(candidate.request_headers) as Record<string, string>;
        let headersMatch = true;
        for (const [key, value] of Object.entries(requiredHeaders)) {
          const actual = requestHeaders[key.toLowerCase()];
          if (actual === undefined || actual !== value) {
            headersMatch = false;
            break;
          }
        }
        if (!headersMatch) {
          disqualified = true;
        } else {
          score += Object.keys(requiredHeaders).length;
        }
      } catch {
        // Ignore invalid JSON
      }
    }

    // Check query params matching
    if (candidate.query_params && !disqualified) {
      try {
        const requiredParams = JSON.parse(candidate.query_params) as Record<string, string>;
        let paramsMatch = true;
        for (const [key, value] of Object.entries(requiredParams)) {
          if (requestQuery[key] === undefined || requestQuery[key] !== value) {
            paramsMatch = false;
            break;
          }
        }
        if (!paramsMatch) {
          disqualified = true;
        } else {
          score += Object.keys(requiredParams).length;
        }
      } catch {
        // Ignore invalid JSON
      }
    }

    if (!disqualified && score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  // If no specific match found, fall back to candidates without constraints
  if (!bestMatch) {
    bestMatch = candidates.find(c => !c.request_headers && !c.query_params) || null;
  }

  if (!bestMatch) {
    return NextResponse.json(
      {
        error: 'No matching mock found',
        debug: {
          requested_path: routePath,
          requested_method: method,
          candidates_found: candidates.length,
          hint: 'Mocks exist for this route but none matched your request headers or query params',
        },
      },
      { status: 404 }
    );
  }

  // Build response
  const responseHeaders = new Headers();
  if (bestMatch.response_headers) {
    try {
      const headers = JSON.parse(bestMatch.response_headers) as Record<string, string>;
      for (const [key, value] of Object.entries(headers)) {
        responseHeaders.set(key, value);
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  // Default content-type if not set
  if (!responseHeaders.has('content-type')) {
    responseHeaders.set('content-type', 'application/json');
  }

  return new NextResponse(bestMatch.response_body ?? '', {
    status: bestMatch.response_status_code,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleMockRequest(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleMockRequest(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleMockRequest(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleMockRequest(request, params.path);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleMockRequest(request, params.path);
}

export async function HEAD(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleMockRequest(request, params.path);
}

export async function OPTIONS(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleMockRequest(request, params.path);
}
