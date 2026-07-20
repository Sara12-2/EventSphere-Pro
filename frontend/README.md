# EventSphere Pro — Frontend

Vite + React app for EventSphere Pro. Talks to the Flask API in `../backend`.

## Setup

```bash
npm install
cp .env.example .env   # points VITE_API_BASE_URL at the local backend (http://localhost:5057/api)
npm run dev            # http://localhost:5173
```

The backend must be running first (see `../backend/README.md`) — the Discover section, login/register, and booking flow all call it directly; there's no mock-data fallback.

## What's wired up

- `src/App.jsx` — the full UI (design system "Marquee & Stub"). Events, categories, and bookings come from the API; the photo gallery is still placeholder art.
- `src/auth/AuthContext.jsx` — current user + login/register/logout, with silent session restore on load via the refresh cookie.
- `src/api/client.js` — fetch wrapper: attaches the in-memory access token, retries once through `/auth/refresh` on a 401.

## Known gaps

- No organizer "my events" dashboard yet — organizers can create events (they land as `draft`) but there's no UI to publish them or see their own list. Do it via the API directly for now (`PATCH /api/events/:id` with `{"status": "published"}`), once an admin has approved the organizer account.
- No admin UI — organizer approval and category management are API-only (`/api/admin/...`).
