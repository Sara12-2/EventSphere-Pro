<div align="center">

# EventSphere Pro — Frontend

**Sell the seat. Scan the ticket. Own the data.**

Event infrastructure for organizers — bookings, QR check-in, and live revenue analytics, built as a real product UI instead of a form bolted onto a calendar.

[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Lucide Icons](https://img.shields.io/badge/Icons-Lucide-F56565?style=for-the-badge&logo=lucide&logoColor=white)](https://lucide.dev)

[![Status](https://img.shields.io/badge/status-active-success?style=flat-square)]()
[![Backend](https://img.shields.io/badge/backend-Flask%20%2B%20PostgreSQL-3776AB?style=flat-square&logo=flask&logoColor=white)]()

</div>

---

## About

EventSphere Pro is a multi-role event platform: **attendees** discover and book events and get a QR ticket instantly, **organizers** publish ticketed events and track revenue, and **admins** approve organizers and manage categories. This package is the marketing/product frontend — a single-page React app ("Marquee & Stub" design system) wired to a real Flask + PostgreSQL API in [`../backend`](../backend), not mock data.

It is built to read like a polished, portfolio-quality product surface: a looping video hero, real event photography, icon-driven UI (no emoji, ever — [Lucide](https://lucide.dev) icons throughout), scroll-reveal animations, light/dark theming, and full keyboard-shortcut support.

## Features

| Area | What's implemented |
|---|---|
| **Discovery** | Debounced search, category filters, infinite scroll, skeleton loading states |
| **Auth** | Register / log in as attendee or organizer, real-time field validation, silent session restore on reload |
| **Booking** | Book a live event, get a `ticket_code` back, seat counts update instantly, sold-out handling |
| **Organizer tools** | Create-event form with full client + server-side validation; new events stay in `draft` until an admin approves the organizer account |
| **Ticketing** | QR ticket stub visual, print-friendly ticket layout (`window.print()`), animated scan-line demo |
| **Analytics preview** | Revenue trend, top-events, and attendance mockup panel |
| **Gallery** | Lightbox photo viewer with keyboard navigation (`←` / `→` / `Esc`) |
| **Accessibility** | Skip-to-content link, focus-trapped modals, `aria-live` toasts, visible focus rings, `prefers-reduced-motion` respected everywhere (including the hero video) |
| **Theming** | Light/dark toggle (`D` key), persisted for the session |
| **Resilience** | A real React error boundary isolates a crashing section instead of white-screening the app |

## Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Focus the search field |
| `D` | Toggle light / dark theme |
| `?` | Open the shortcuts panel |
| `Esc` | Close any open dialog |
| `←` / `→` | Navigate the photo gallery lightbox |

## Tech stack

- **React 19** + **Vite 8** — app shell and dev/build tooling
- **Tailwind CSS 3** — utility styling, layered with a small custom design-token stylesheet (`<Styles />` in `App.jsx`) for the brand's animations and color system
- **Lucide React** — the only icon source used anywhere in this codebase
- Plain `fetch` API client (`src/api/client.js`) — no Axios/React Query, by design, to keep the auth/refresh flow explicit and easy to audit

## Project structure

```
frontend/
├─ src/
│  ├─ App.jsx              # the entire UI: nav, hero, sections, modals, gallery
│  ├─ auth/AuthContext.jsx # current user + login/register/logout, session restore
│  ├─ api/client.js        # fetch wrapper: bearer token + CSRF-safe refresh retry
│  └─ assets/illustrations # bundled SVG illustrations (fallback art, see below)
└─ public/media/            # real photos & video — see "Media assets" below
```

## Getting started

The backend must be running first — the Discover section, login/register, and booking flow all call it directly; there is no mock-data fallback. See [`../backend/README.md`](../backend/README.md).

**Docker (whole stack, recommended):**

```bash
cp .env.example .env
cd ..
docker compose up -d --build   # http://localhost:5173, backend at :5057, db at :5432
```

**Native:**

```bash
npm install
cp .env.example .env   # points VITE_API_BASE_URL at the local backend (http://localhost:5057/api)
npm run dev             # http://localhost:5173
```

Other scripts:

```bash
npm run build     # production build → dist/
npm run preview    # preview the production build locally
npm run lint        # oxlint
```

## Media assets

The UI already has paths, layout, and graceful fallbacks wired up for real photography and a hero video — they just aren't in the repo yet (kept out to keep the repo light and because they're project-specific). Nothing breaks with these missing: the hero shows its gradient background, gallery tiles fall back to the bundled SVG illustrations, and role-card / check-in photos simply don't render.

Drop files at the **exact paths and filenames** below (each folder also has its own `README.md` with the same table):

| Path | Purpose | Recommended spec |
|---|---|---|
| `public/media/hero/hero-loop.mp4` | Looping video behind the hero headline | 1920×1080, H.264 MP4, 8–15s, under ~6MB |
| `public/media/hero/hero-poster.jpg` | Poster frame before the video loads | 1920×1080 JPG, under ~300KB |
| `public/media/gallery/gallery-01-main-stage.jpg` | Gallery: "Main stage, AI Summit 2026" | 1:1, ≥800×800 |
| `public/media/gallery/gallery-02-checkin-line.jpg` | Gallery: "Check-in line at Expo Center" | 1:1, ≥800×800 |
| `public/media/gallery/gallery-03-riverside-dusk.jpg` | Gallery: "Riverside Amphitheatre at dusk" | 1:1, ≥800×800 |
| `public/media/gallery/gallery-04-workshop-room.jpg` | Gallery: "Workshop breakout room" | 1:1, ≥800×800 |
| `public/media/gallery/gallery-05-scanning-tickets.jpg` | Gallery: "Organizer scanning tickets" | 1:1, ≥800×800 |
| `public/media/gallery/gallery-06-attendee-lounge.jpg` | Gallery: "Attendee lounge" | 1:1, ≥800×800 |
| `public/media/gallery/gallery-07-marquee-gardens.jpg` | Gallery: "Marquee Gardens setup" | 1:1, ≥800×800 |
| `public/media/gallery/gallery-08-post-teardown.jpg` | Gallery: "Post-event teardown" | 1:1, ≥800×800 |
| `public/media/roles/role-admin.jpg` | Admin role card photo | 1:1, ≥200×200 |
| `public/media/roles/role-organizer.jpg` | Organizer role card photo | 1:1, ≥200×200 |
| `public/media/roles/role-attendee.jpg` | Attendee role card photo | 1:1, ≥200×200 |
| `public/media/tickets/checkin-moment.jpg` | Small overlap photo on the QR check-in section | ~4:3, ≥400×300 |
| `public/media/categories/conferences.jpg` | Discover card header photo — Conferences | ~16:9, ≥800×450 |
| `public/media/categories/concerts.jpg` | Discover card header photo — Concerts | ~16:9, ≥800×450 |
| `public/media/categories/workshops.jpg` | Discover card header photo — Workshops | ~16:9, ≥800×450 |
| `public/media/categories/weddings.jpg` | Discover card header photo — Weddings | ~16:9, ≥800×450 |

All JPGs should be compressed for the web (under ~400KB each). No code changes are needed — just add the files at those paths and reload.

## Known gaps

- No organizer "my events" dashboard yet — organizers can create events (they land as `draft`) but there's no UI to publish them or see their own list. Do it via the API directly for now (`PATCH /api/events/:id` with `{"status": "published"}`), once an admin has approved the organizer account.
- No admin UI — organizer approval and category management are API-only (`/api/admin/...`).

---

<div align="center">Built for the DevHatch Labs portfolio.</div>
