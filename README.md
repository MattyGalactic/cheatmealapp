# Cheat Meal MVP Scaffold

Monorepo scaffold for the Nashville pilot MVP described in `../PRD.md` (root workspace PRD file).

## Stack
- App + API: Next.js (App Router + Route Handlers)
- Database: PostgreSQL (schema + seed SQL included)
- Ranking: modular workspace package (`packages/ranking`)

## Structure
- `apps/frontend` - Next.js app (UI + `/api/*` route handlers)
- `packages/ranking` - scoring/ranking formula module
- `packages/types` - shared TypeScript types
- `infra/postgres` - `schema.sql` + `seed.sql`
- `apps/backend` - legacy Express backend (retired from root scripts; kept for reference)

## Local Dev (One Project)
1. `npm install`
2. Optional: create Postgres DB `cheatmeal`
3. Optional: set env vars in `apps/frontend/.env.local` (see `apps/frontend/.env.example`)
4. Optional (if using Postgres): apply `infra/postgres/schema.sql` and `infra/postgres/seed.sql`
5. Start app: `npm run dev`
6. Open `http://localhost:3000`

If Postgres is not configured, the Next.js API routes fall back to mock Nashville chain/menu data so the UI still works.

## Production Test (Local)
1. `npm run build`
2. `npm run start`
3. Open `http://localhost:3000`

## Deploy (Vercel, One Project)
- Deploy the repo as a single Next.js project
- Required env vars for DB-backed mode:
  - `DATABASE_URL`
- Optional env vars:
  - `SEARCH_RADIUS_MILES`
  - `PILOT_CITY`
  - `PILOT_STATE`
- `NEXT_PUBLIC_API_BASE_URL` is not required in production (same-origin `/api/*`)

## Anonymous Event Logging (Dev)
- Events are posted to `POST /api/events` from the frontend (anonymous only, client-generated session id in `localStorage` key `cm_session_id`)
- Debug endpoint: `GET /api/events?limit=50` (disabled in production)
- Persistence:
  - Preferred: Postgres `events` table (included in `infra/postgres/schema.sql`)
  - Fallback: `apps/frontend/.data/events.jsonl` if DB is unavailable or the events table is not migrated

### View Events in Dev
1. Start the app: `npm run dev`
2. Use the app (submit a search, click a card, click `View Restaurant`)
3. Fetch recent events:
   - `curl http://localhost:3000/api/events?limit=50`
