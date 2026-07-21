<div align="center">

# EventSphere Pro

**Sell the seat. Scan the ticket. Own the data.**

Event infrastructure for organizers — real bookings, QR check-in, and revenue analytics, backed by an actual API and database instead of a form bolted onto a calendar.

[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Flask](https://img.shields.io/badge/Flask-3-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)

[![Tests](https://img.shields.io/badge/backend%20tests-11%20passing-success?style=flat-square)]()
[![Status](https://img.shields.io/badge/status-active-success?style=flat-square)]()
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation / Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running Commands](#running-commands)
- [Demo Credentials](#demo-credentials)
- [Project Structure](#project-structure)
- [License](#license)

## About

EventSphere Pro is a multi-role event-booking platform built as a portfolio project: **attendees** discover and book events and get a QR ticket instantly, **organizers** publish ticketed events and track revenue, and **admins** approve organizers and manage categories. It's a real full-stack app — a Flask + PostgreSQL API backing a React frontend, not a static mockup or mock-data demo.

**Not built yet:** payments, QR-code scanning/check-in at the door, email notifications, an organizer "my events" dashboard, and an admin UI (organizer approval + category management are API-only for now).

## Features

**Backend**
- JWT auth with three roles (admin/organizer/attendee), bcrypt password hashing, rate-limited login/register
- httpOnly + CSRF-protected refresh cookie, silent session restore
- Events (organizer-owned, admin-approval gated before publishing) and seat-locked bookings (no overbooking), each booking gets a unique `ticket_code`
- 11 passing pytest tests; Postgres migrations via Flask-Migrate

**Frontend**
- Debounced search, category filters, infinite scroll, skeleton loading states
- Register/login as attendee or organizer with real-time field validation
- Live booking flow — instant `ticket_code`, seat counts update immediately, sold-out handling
- Printable ticket stub (`window.print()`), animated QR scan-line demo
- Analytics preview panel (revenue trend, top events, attendance)
- Lightbox photo gallery with full keyboard navigation
- Light/dark theming, full keyboard-shortcut support, accessible by default (skip link, focus-trapped modals, `aria-live` toasts, `prefers-reduced-motion` respected)
- A real React error boundary isolates a crashing section instead of white-screening the app

**Infrastructure**
- One-command Docker setup — builds and starts Postgres, Flask, and Vite together, with migrations/seeding automatic and source hot-reload preserved via bind mounts

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 3, Lucide icons |
| Backend | Flask 3, Flask-JWT-Extended, Flask-Migrate, bcrypt |
| Database | PostgreSQL 16 |
| Testing | Pytest (backend, 11 tests) |
| Infrastructure | Docker & Docker Compose |

## Prerequisites

- **Docker Desktop** (recommended path — runs Postgres, Flask, and Vite together)
- Or, to run natively instead of in Docker: **Node.js 18+**, **Python 3.11+**, and Docker just for the Postgres container
- **Git**

## Installation / Setup

**Option A — one command (Docker), recommended:**

```bash
cd backend  && cp .env.example .env  && cd ..
cd frontend && cp .env.example .env  && cd ..
docker compose up -d --build
```

Frontend: http://localhost:5173 · Backend: http://localhost:5057. Source is bind-mounted into both containers, so edits on your machine still hot-reload.

**Option B — run natively (no Docker for the app servers):**

```bash
# Backend (still needs Docker, just for Postgres)
cd backend
python -m venv .venv && .venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env
docker compose -f ../docker-compose.yml up -d db
flask db upgrade
python seed.py
python run.py          # http://localhost:5057

# Frontend, in a second terminal
cd frontend
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

## Environment Variables

**`backend/.env`** (copy from `backend/.env.example`):

| Variable | Purpose | Default |
|---|---|---|
| `FLASK_ENV` | Flask environment | `development` |
| `PORT` | Backend port | `5057` |
| `SECRET_KEY` | Flask session secret — change for any real deployment | placeholder |
| `JWT_SECRET_KEY` | JWT signing secret — change for any real deployment | placeholder |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg2://eventsphere:eventsphere@localhost:5432/eventsphere` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account, created by `seed.py` | `Platform Admin` / `admin@eventspherepro.test` / `ChangeMe123!` |

**`frontend/.env`** (copy from `frontend/.env.example`):

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL the frontend calls for the API | `http://localhost:5057/api` |

## Running Commands

**Docker (whole stack):**

```bash
docker compose up -d --build   # start everything
docker compose logs -f         # follow logs
docker compose down            # stop everything
```

**Backend** (from `backend/`):

```bash
flask db upgrade   # apply migrations
python seed.py     # seed categories + first admin account
python run.py      # start the API — http://localhost:5057
pytest             # run the 11 backend tests
```

**Frontend** (from `frontend/`):

```bash
npm run dev        # start the dev server — http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build locally
npm run lint       # oxlint
```

## Demo Credentials

Seeded via `seed.py` (admin) and the API (organizer/attendee + 5 published sample events). Log in from the nav's **Log in** button.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@eventspherepro.test` | `ChangeMe123!` |
| Organizer | `organizer@eventspherepro.test` | `Demo123!` |
| Attendee | `attendee@eventspherepro.test` | `Demo123!` |

## Project Structure

```
EventSphere-Pro/
├─ backend/                  # Flask API
│  ├─ app/
│  │  ├─ models/             # SQLAlchemy models (User, Event, Category, Booking)
│  │  ├─ routes/             # auth, events, bookings, admin blueprints
│  │  └─ schemas/             # marshmallow request validation
│  ├─ migrations/             # Flask-Migrate/Alembic migrations
│  ├─ tests/                  # pytest suite
│  └─ seed.py                 # categories + first admin account
├─ frontend/                  # Vite + React app
│  ├─ src/
│  │  ├─ App.jsx              # the app: nav, hero, sections, modals, gallery
│  │  ├─ auth/                # AuthContext — session, login/register/logout
│  │  ├─ api/                 # fetch client — bearer token + CSRF-safe refresh retry
│  │  └─ assets/illustrations/ # bundled SVG fallback art
│  └─ public/media/           # real event photos/video (see frontend/README.md)
├─ docker-compose.yml         # Postgres + Flask + Vite, one command
└─ EventSpherePro_Frontend.jsx # original standalone draft, kept for reference only
```

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for the full setup and API/media details for each side.

## License

Licensed under the [MIT License](LICENSE).
