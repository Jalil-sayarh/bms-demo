# CS Stays — villa & chalet booking demo

Prospect demo inspired by the CS Villas guest flow: homepage search, stays catalog with date filtering, property pages with calendar + request-to-book, and an admin back office that confirms bookings and blocks dates.

Guest site and admin share one availability engine (SQLite). Pending requests do not block inventory; confirmed bookings and admin blocks do.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- SQLite via Drizzle ORM + better-sqlite3
- date-fns, react-day-picker, Zod
- Vitest for availability rules

## Setup

```bash
npm install
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin

- URL: [http://localhost:3000/admin](http://localhost:3000/admin)
- Email: `admin@demo.local`
- Password: `admin123`

Re-seed anytime with `npm run db:seed` (resets the local database).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the demo |
| `npm run db:seed` | Reset and seed SQLite |
| `npm test` | Run availability unit tests |
| `npm run build` | Production build |

## Demo walkthrough

1. On the homepage, search Saint-Tropez for a week of dates and open a property.
2. Pick fewer than 7 nights — the form blocks the request.
3. Pick a valid week, submit a booking request.
4. Sign in to admin, confirm the request.
5. Search the same dates again — that property no longer appears.

Seeded fixtures already include a confirmed July week on Villa Eupheme, a pending Christmas request on Chalet Andaz, and owner/maintenance blocks on Villa La Ferme and Chalet Namur.
