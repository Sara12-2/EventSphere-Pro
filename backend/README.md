# EventSphere Pro — Backend

Flask + PostgreSQL API: auth (JWT, roles), events, bookings. See `../README.md` for the original product brief.

## Setup

### Option A — Docker (whole stack, recommended)

```bash
cp .env.example .env          # edit SECRET_KEY / JWT_SECRET_KEY for anything beyond local dev
cd ..
docker compose up -d --build  # builds + starts db, backend, and frontend together
```

This runs `flask db upgrade` and `python seed.py` automatically on every container start (see `Dockerfile` / `docker-entrypoint.sh`) — nothing to run by hand. Source is bind-mounted, so the Flask debug reloader picks up code changes. See the root `docker-compose.yml`.

### Option B — native Python (Docker only for Postgres)

```bash
python -m venv .venv
.venv/Scripts/activate        # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt

cp .env.example .env          # edit SECRET_KEY / JWT_SECRET_KEY for anything beyond local dev

docker compose -f ../docker-compose.yml up -d db   # starts Postgres on localhost:5432
flask db upgrade              # applies migrations
python seed.py                # seeds the 4 categories + an admin user (see .env for admin credentials)

python run.py                 # http://localhost:5057 — 5000 is commonly taken by other local projects
```

## Tests

```bash
pytest
```

Runs against an in-memory SQLite database (config override in `app/config.py::TestConfig`) — no Docker/Postgres needed. Covers the register→login flow, the organizer-verification gate on publishing, booking + overbooking rejection + cancellation, and role/ownership checks.

## Security notes

- Access tokens: 15 min, Authorization header only, never persisted client-side beyond memory.
- Refresh tokens: 7 days, httpOnly+Secure(prod)+SameSite=Lax cookie, CSRF-protected, scoped to `/api/auth`.
- Passwords: bcrypt, minimum 8 chars with a letter and a digit.
- Rate limiting on `/auth/register` and `/auth/login` (in-memory store — swap `RATELIMIT_STORAGE_URI` for Redis before running multiple workers in production).
- Every event/booking mutation checks resource ownership, not just role.
- Organizers can create events, but they stay in `draft` until an admin approves the account (`POST /api/admin/organizers/:id/approve`).

## Scope

Events + bookings only, per the current build. No payments, no email, no QR-scanning/check-in endpoint, no analytics endpoints — the schema doesn't preclude adding them later (bookings already carry a `ticket_code`).
