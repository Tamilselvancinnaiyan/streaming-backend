# LiveKit Streaming Platform Setup

This repository now contains:
- NestJS backend in the project root.
- Next.js dashboard UI in `/nextjs-dashboard`.
- PostgreSQL table schema in `/database/schema.sql`.

## 1) What `index.js` was doing before

The old `index.js` only handled `GET /token` and generated a LiveKit JWT.
It did **not** store streams, users, chat messages, viewer joins, or analytics in DB.

## 2) Backend (NestJS)

### Run

```bash
cp .env.example .env
npm install
npm run dev
```

### Core endpoints

- `GET /token?room=<room>&role=host|viewer&identity=<id>`
- `GET /live-sessions`
- `POST /streams`
- `PATCH /streams/:id/start`
- `PATCH /streams/:id/stop`
- `POST /streams/:id/join`
- `PATCH /streams/:id/leave?identity=<identity>`
- `GET /streams/:id/chat`
- `POST /streams/:id/chat`
- `POST /streams/:id/host-control`
- `GET /analytics/overview`

### DB config file used

- `/src/config/database.config.js` (same structure you requested)

## 3) Frontend (Next.js dashboard)

```bash
cd nextjs-dashboard
npm install
npm run dev
```

Pages implemented:
- `/` Live Sessions Dashboard
- `/live/[id]` Viewer page with chat panel
- `/studio` Host Studio
- `/create-stream` Create Stream form
- `/analytics` Analytics cards

Set backend URL in frontend:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

## 4) Database tables

SQL DDL is available at:
- `/database/schema.sql`

Tables:
- `users`
- `streams`
- `stream_participants`
- `chat_messages`
- `stream_events`
- `follows`
# streaming-backend
