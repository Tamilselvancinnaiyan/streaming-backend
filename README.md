# LiveKit Backend (Simple Auth + Token API)

This backend is simplified to:
- `users` and `streams` tables
- login flow APIs
- LiveKit token generation API
- basic stream lifecycle APIs

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Database

Run schema:

```sql
-- file: database/schema.sql
```

Tables created:
- `users`
  - `id`, `name`, `email`, `password_hash`, `role`, `last_login_at`, `created_at`, `updated_at`
- `streams`
  - `id`, `host_user_id`, `room_id`, `title`, `category`, `status`, `started_at`, `ended_at`, `created_at`, `updated_at`

## APIs

### Auth
- `POST /auth/register`
  - body: `{ "name": "Tom", "email": "tom@x.com", "password": "secret123", "role": "viewer" }`
- `POST /auth/login`
  - body: `{ "email": "tom@x.com", "password": "secret123" }`
- `GET /auth/me`
  - header: `Authorization: Bearer <token>`

### LiveKit
- `GET /token?room=my-room&role=host|viewer&identity=user_1`

### Streams
- `POST /streams/start`
  - body: `{ "hostUserId": "<uuid>", "title": "My stream", "category": "general" }`
  - creates stream record and random `room_id`
- `PATCH /streams/:id/stop`
  - sets `ended_at` to current time and status to `ended`
- `GET /streams/reconcile`
  - returns records where `ended_at IS NULL OR ended_at <= NOW()`

## Notes
- Passwords are hashed with `scrypt`.
- Auth token is HMAC-signed and expires in 7 days.
