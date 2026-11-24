# CS Stays — villa & chalet booking demo

Prospect demo inspired by the CS Villas guest flow: homepage search, stays catalog with date filtering, property pages with calendar + request-to-book, and an admin back office that confirms bookings and blocks dates.

Guest site and admin share one availability engine. Pending requests do not block dates; confirmed bookings and admin blocks do.

Demo made for Thomas Tomaski by [Jalil Sayarh](https://jalilsayarh.com/now).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- libSQL / SQLite via Drizzle (`@libsql/client`) — local file in dev, Turso on Vercel
- date-fns, react-day-picker, Zod
- Vitest for availability rules

## Local setup

```bash
npm install
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin

- URL: `/admin`
- Email: `admin@demo.local`
- Password: `admin123`

## Deploy on Vercel (required for a live prospect link)

Local `better-sqlite3` / file SQLite cannot run on Vercel serverless. This app uses **Turso** (hosted libSQL).

1. Create a free DB at [turso.tech](https://turso.tech) (or `brew install tursodatabase/tap/turso` then `turso db create bms-demo`).
2. Copy the URL and a token:

```bash
turso db show bms-demo --url
turso db tokens create bms-demo
```

3. In the Vercel project → Settings → Environment Variables, add:

| Name | Value |
| --- | --- |
| `TURSO_DATABASE_URL` | `libsql://…turso.io` |
| `TURSO_AUTH_TOKEN` | token from Turso |

4. Redeploy. The first request creates tables and seeds demo data automatically.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the demo |
| `npm run db:seed` | Reset and seed the local (or Turso) database |
| `npm test` | Run availability unit tests |
| `npm run build` | Production build |
