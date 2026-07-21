<div align="center">

# EventSphere Pro

**Sell the seat. Scan the ticket. Own the data.**

Event infrastructure for organizers — real bookings, QR check-in, and revenue analytics, backed by an actual API and database instead of a form bolted onto a calendar.

[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Flask](https://img.shields.io/badge/Flask-3-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)

[![Tests](https://img.shields.io/badge/backend%20tests-11%20passing-success?style=flat-square)]()
[![Status](https://img.shields.io/badge/status-active-success?style=flat-square)]()

</div>

---

## Here's what actually exists in this repo right now

**Backend** — `backend/` (Flask + PostgreSQL, not MySQL):
- JWT auth with three roles (admin/organizer/attendee), bcrypt passwords, rate-limited login/register, httpOnly+CSRF-protected refresh cookie
- Events (organizer-owned, admin-approval gated before publishing) and bookings (seat-locked to prevent overbooking, each booking gets a `ticket_code`)
- 11 passing pytest tests; Postgres migrations via Flask-Migrate
- See `backend/README.md` for setup and API details

**Frontend** — `frontend/` (Vite + React, not Next.js/TypeScript yet):
- The full "Marquee & Stub" UI, wired to the real API — live event data, real login/register, real bookings
- Looping video hero, real event photography, and icon-driven UI (Lucide icons only, no emoji) — see `frontend/README.md` for the full media asset list
- `EventSpherePro_Frontend.jsx` at the repo root is the original standalone draft this was built from; it's kept for reference and isn't wired to anything
- See `frontend/README.md` for setup

**Infrastructure:**
- One-command Docker setup — `docker compose up -d --build` builds and starts Postgres, Flask, and Vite together, with migrations/seeding automatic and source hot-reload preserved via bind mounts

**Not built yet:** payments, QR-code scanning/check-in, email notifications, analytics dashboards, an organizer "my events" UI, and an admin UI (organizer approval + category management are API-only for now — see `backend/README.md`).

### Quick start

**Option A — one command (Docker), recommended:**

```bash
cd backend  && cp .env.example .env  && cd ..
cd frontend && cp .env.example .env  && cd ..
docker compose up -d --build
```

That builds and starts Postgres, the Flask API, and the Vite dev server together — migrations and seeding run automatically on backend startup. Frontend: http://localhost:5173 · Backend: http://localhost:5057. Source is bind-mounted into both containers, so edits on your machine still hot-reload. See the root `docker-compose.yml`.

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

---

*Everything from here down is the original planning document, kept as-is for historical context. Parts of it (Next.js/TypeScript, MySQL, payments, QR scanning, analytics dashboards) describe the long-term vision and haven't been built yet — see the "what actually exists" section above for the real current state.*

## 1. Executive Summary

**EventSphere Pro** is a full-stack SaaS-style Event Management Platform built as a portfolio project.
The platform is envisioned as a complete event lifecycle system covering **discovery, booking, ticketing, payments, QR check-in, and analytics** — not a simple CRUD app, but a multi-role, production-grade product.

> **Vision statement:** *"A complete event discovery, booking, ticketing, and management platform where organizers can create events, sell tickets, manage attendees, and analyze performance."*

---

## 2. Strategic Rationale

| Project | Industry | Core Skills Demonstrated |
|---|---|---|
| AgentForge | AI SaaS | RAG, LLM integration, AI Agents |
| StockFlow | Business ERP | Inventory management, analytics, CRUD + workflows |
| **EventSphere Pro** | Booking Platform | Payments, QR systems, real-time features |

Adding EventSphere Pro diversifies the portfolio into a **transactional, consumer-facing product domain**, distinguishing it from a "typical frontend developer" portfolio by proving the developer can handle payments, real-time data, security/roles, and third-party integrations — signals typically associated with more senior engineering work.

---

## 3. User Roles & Target Users

The system is built around three roles with distinct permissions:

### Admin
- Manage platform users
- Verify/approve organizers
- View platform-wide analytics
- Manage event categories

### Organizer
- Create and manage events
- Define ticket types and pricing
- Track bookings in real time
- Scan attendee QR tickets at the door
- View revenue analytics

### Attendee
- Browse and search events
- Book tickets and pay online
- Receive a QR-coded digital ticket
- Leave reviews and ratings

---

## 4. Recommended Technology Stack

**Frontend**
- Next.js + React + TypeScript
- Tailwind CSS + Shadcn UI (component library)
- Framer Motion (animations)
- Recharts (analytics visualizations)

**Backend**
- Flask (REST API)
- JWT-based authentication
- Role-Based Access Control (RBAC)

**Database**
- MySQL

**Third-Party Integrations**
- QR code generation library
- Transactional email service
- Payment gateway(s)
- Cloud storage (for event banners/images)

---

## 5. Core Modules Breakdown

### 5.1 Authentication System
- Register/login flows
- JWT token issuance and refresh
- Role selection at signup (Admin is typically seeded, not self-registered)
- Profile management
- Role hierarchy: `User → Admin / Organizer / Attendee`

### 5.2 Event Management (Organizer)
Organizers can create events with the following attributes:
- Event name, description, category
- Banner image, venue, date, time
- Capacity and ticket price
- Status (draft/published/closed)

Example event types: AI Conference, University Seminar, Wedding Event, Concert.

### 5.3 Event Discovery (Attendee)
- Full-text search
- Filters: category, location, date, price range
- Event card UI: image, name, date, venue, available seats, price, "Book Now" CTA

### 5.4 Ticket Booking Engine
**Flow:**
`Select event → Choose ticket quantity → Check availability → Payment → Generate ticket → Send confirmation email`

**Core table — `Booking`:**
- `id`, `user_id`, `event_id`, `quantity`, `total_amount`, `status`, `booking_date`

### 5.5 QR Ticket System ⭐
- On successful booking, a unique QR-coded ticket is generated containing event name, attendee name, and ticket ID (e.g., `ES-10293`)
- Organizers scan the QR at entry; a valid scan marks attendance
- **Core table — `Ticket`:** `id`, `booking_id`, `qr_code`, `checked_in`

### 5.6 Payment Integration
- **International:** Stripe
- **Pakistan-specific:** JazzCash, Easypaisa

**Flow:** `Booking created → Payment pending → Payment success → Ticket generated`

### 5.7 Organizer Dashboard (Analytics)
- Summary cards: Total Events, Tickets Sold, Revenue, Attendance
- Charts: Monthly revenue, event popularity, booking trends (via Recharts)

### 5.8 Email Notification System
Automated transactional emails for:
- Booking confirmation
- Pre-event reminders ("starts tomorrow")
- Cancellation notices

---

## 6. Database Design

**Primary tables:**
`Users`, `Events`, `Categories`, `Venues`, `Tickets`, `Bookings`, `Payments`, `Reviews`, `Notifications`, `Attendance`

**Core relational flow:**
```
User → Booking → Event → Ticket
```
This is a standard normalized relational model appropriate for MySQL, with `Booking` acting as the central join entity connecting users to events, and `Ticket`/`Payment` extending from `Booking`.

---

## 7. Premium / Differentiating Features

These are the features intended to make the project stand out ("portfolio killer" features):

| Feature | Description |
|---|---|
| Live Seat Availability | Real-time display (e.g., "120/200 booked, 80 remaining") |
| Event Map | Google Maps integration for venue location |
| Reviews & Ratings | Post-event attendee feedback |
| Coupon System | Discount codes (e.g., `SAVE20` → 20% off) |
| Organizer Verification Badge | Trust signal for verified organizers |
| Dark Premium UI | Polished, modern visual design |

---

## 8. Application Pages / Information Architecture

**Public**
- Landing Page, Events Listing, Event Details, Login/Register

**Attendee Dashboard**
- My Tickets, Booking History, Profile

**Organizer Dashboard**
- Overview, My Events, Create Event, Bookings, Analytics, QR Scanner

**Admin Dashboard**
- Users, Organizers, Reports, Platform Analytics

---

## 9. Development Roadmap

| Phase | Focus | Deliverables |
|---|---|---|
| **Phase 1** | Frontend foundation | Landing page, auth UI, dashboard layouts |
| **Phase 2** | Backend foundation | Flask API, MySQL schema, authentication |
| **Phase 3** | Event system | Create events, search/filter, booking |
| **Phase 4** | Advanced features | QR tickets, payments, emails, analytics |
| **Phase 5** | Deployment | Frontend: Vercel · Backend: Render/AWS · DB: MySQL Cloud |

---

## 10. Risk & Complexity Assessment

An honest look at where effort will concentrate, since not all modules are equally difficult:

- **Payments (high effort):** Integrating Stripe is well-documented and fast. JazzCash/Easypaisa have less mature docs, more manual sandbox setup, and Pakistan-specific compliance quirks — budget extra time here.
- **QR ticketing (medium effort):** Conceptually simple (generate a unique ID, encode as QR, validate on scan) but the scanning UX (camera access, offline handling at the door) needs care.
- **Live seat availability (medium effort):** A "real-time" feel can be achieved with simple polling for an MVP; WebSockets are a nice-to-have, not a requirement.
- **Email automation (low-medium effort):** Standard with a provider like SendGrid/Mailgun plus a scheduled job (e.g., cron or Celery beat) for reminder emails.
- **Premium features (Google Maps, coupons, badges, dark UI):** Best treated as post-MVP polish rather than Phase 1–4 requirements, to avoid scope creep before the core booking flow works end-to-end.

**Recommended sequencing:** Build the core loop first — *auth → event CRUD → discovery → booking → Stripe payment → QR ticket → check-in* — before layering in the second payment gateway and premium features.

---

## 11. Suggested Immediate Next Step

As proposed in the original planning notes, the logical next step before writing code is to produce:
1. A **system architecture diagram**
2. A **database ER diagram**
3. A **project folder structure** (Next.js frontend + Flask backend)

This ensures development starts on a professional, structured foundation rather than ad hoc feature-building.

---
