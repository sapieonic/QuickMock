# Mock Server

A configurable mock API server built with Next.js. Define mock endpoints via a web UI and serve them at `/mock/{any_route}`. Supports configurable methods, headers, query params, status codes, and response bodies. Mock definitions are stored in SQLite (local file or Turso cloud).

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- @libsql/client (SQLite via Turso — local file or cloud)
- Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard. The SQLite database is auto-created in `data/mocks.db` on first API call (no configuration needed for local dev).

### Environment Variables

Copy `.env.example` to `.env.local` and configure as needed:

```bash
# Local dev (default — uses local SQLite file, no token needed)
TURSO_DATABASE_URL=file:data/mocks.db

# Cloud deployment (Turso hosted)
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-token
```

If no environment variables are set, the server defaults to `file:data/mocks.db`.

### Docker

Build and run with a single command:

```bash
docker build -t mock-server .
docker run -d --name mock-server -p 3000:3000 -v mock-data:/app/data mock-server
```

The `-v mock-data:/app/data` flag persists the SQLite database across container restarts. Drop it if you want a fresh database each time.

To connect to Turso cloud from Docker, pass environment variables:

```bash
docker run -d --name mock-server -p 3000:3000 \
  -e TURSO_DATABASE_URL=libsql://your-db-name.turso.io \
  -e TURSO_AUTH_TOKEN=your-token \
  mock-server
```

## Usage

### Web UI

- **Dashboard** (`/`) — List, search, and filter mock endpoints. Toggle active/inactive, edit, or delete.
- **New Mock** (`/mocks/new`) — Create a mock endpoint with method, route, response status, headers, and body.
- **Edit Mock** (`/mocks/[id]/edit`) — Update an existing mock.

### API

| Endpoint | Method | Description |
|---|---|---|
| `/api/mocks` | GET | List mocks (query: `search`, `method`, `active`) |
| `/api/mocks` | POST | Create a mock |
| `/api/mocks/[id]` | GET | Get a single mock |
| `/api/mocks/[id]` | PUT | Update a mock |
| `/api/mocks/[id]` | DELETE | Delete a mock |
| `/api/mocks/[id]/toggle` | PATCH | Toggle active/inactive |

### Serving Mocks

Any request to `/mock/{route}` is matched against active mock definitions by route path and HTTP method. When multiple mocks share the same route and method, the server picks the best match based on request headers and query params.

```bash
# Create a mock
curl -X POST http://localhost:3000/api/mocks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Get Users",
    "route_path": "api/users",
    "method": "GET",
    "response_status_code": 200,
    "response_headers": "{\"Content-Type\": \"application/json\"}",
    "response_body": "{\"users\": [{\"id\": 1, \"name\": \"Alice\"}]}"
  }'

# Hit the mock
curl http://localhost:3000/mock/api/users
# => {"users": [{"id": 1, "name": "Alice"}]}
```

## Mock Configuration Fields

| Field | Description |
|---|---|
| `name` | Display name for the mock |
| `route_path` | Path after `/mock/` (e.g. `api/users`) |
| `method` | HTTP method (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) |
| `request_headers` | JSON object of headers to match against (optional) |
| `query_params` | JSON object of query params to match against (optional) |
| `response_status_code` | HTTP status code to return (default: 200) |
| `response_headers` | JSON object of response headers |
| `response_body` | Response body string |
| `is_active` | Whether the mock is active |

## Exposing via ngrok

To make your mock server publicly accessible (useful for webhooks, mobile testing, or sharing with teammates), you can use [ngrok](https://ngrok.com):

```bash
# Install ngrok (macOS)
brew install ngrok

# Start the mock server
npm run dev

# In another terminal, expose port 3000
ngrok http 3000
```

ngrok will output a public URL like `https://a1b2c3d4.ngrok-free.app`. Your mocks are now reachable externally:

```bash
curl https://a1b2c3d4.ngrok-free.app/mock/api/users
```

The dashboard is also accessible at the same URL, and the **cURL copy button** will automatically use the ngrok host.

> **Tip:** Use `ngrok http 3000 --domain your-name.ngrok-free.app` with a free static domain to get a stable URL across restarts.

## Project Structure

```
src/
├── lib/
│   ├── db.ts              # Turso/libSQL client + schema init
│   └── types.ts           # TypeScript interfaces
├── components/
│   ├── Header.tsx          # Navigation header
│   ├── MockTable.tsx       # Dashboard table
│   └── MockForm.tsx        # Create/edit form
└── app/
    ├── page.tsx            # Dashboard
    ├── mocks/new/          # Create mock page
    ├── mocks/[id]/edit/    # Edit mock page
    ├── api/mocks/          # CRUD API routes
    └── mock/[...path]/     # Catch-all mock serving
```
