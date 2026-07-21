import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from "react";
import {
  Ticket, QrCode, MapPin, Users, ShieldCheck, TrendingUp,
  Search, SlidersHorizontal, Wallet, BadgeCheck, ScanLine, ArrowRight,
  Star, Clock, Sun, Moon, CheckCircle2, BarChart3, UserCog, CalendarCheck2,
  Menu, X, Heart, Printer, Info, AlertTriangle, Loader2,
  ChevronLeft, ChevronRight, Keyboard, LogIn, LogOut,
} from "lucide-react";
import { useAuth } from "./auth/AuthContext";
import { api, ApiError } from "./api/client";

import imgMainStage from "./assets/illustrations/main-stage.svg";
import imgCheckinLine from "./assets/illustrations/checkin-line.svg";
import imgRiversideDusk from "./assets/illustrations/riverside-dusk.svg";
import imgWorkshopRoom from "./assets/illustrations/workshop-room.svg";
import imgScanningTickets from "./assets/illustrations/scanning-tickets.svg";
import imgAttendeeLounge from "./assets/illustrations/attendee-lounge.svg";
import imgMarqueeGardens from "./assets/illustrations/marquee-gardens.svg";
import imgPostTeardown from "./assets/illustrations/post-teardown.svg";
import imgConcertCrowd from "./assets/illustrations/concert-crowd.svg";

/* ---------------------------------------------------------------
   EventSphere Pro — Marketing / Product Frontend
   Design system: "Marquee & Stub" — ink, porcelain, marquee gold,
   velvet plum, ticket teal. Built from scratch for this brief.

   NOTE on persistence: browser storage (localStorage/sessionStorage)
   does not work inside Claude.ai artifacts, so "saved" preferences
   below (theme, favorites) live in React state for this session only.
   In a real deployment these would be persisted server-side per user
   or in localStorage.
------------------------------------------------------------------ */

const PALETTE = {
  ink: "#15171C",
  inkSoft: "#1D2027",
  porcelain: "#F1F1F4",
  porcelainSoft: "#E7E8ED",
  gold: "#D9A441",
  goldSoft: "#F0CE8C",
  plum: "#6A2C55",
  teal: "#146B63",
  slate: "#5C6270",
  line: "#DBDCE1",
  lineDark: "#2A2D35",
  danger: "#B5473C",
};

const CATEGORY_TONE = { conferences: "gold", concerts: "plum", workshops: "teal", weddings: "plum" };
const CATEGORY_IMAGE = {
  conferences: imgMainStage,
  concerts: imgConcertCrowd,
  workshops: imgWorkshopRoom,
  weddings: imgMarqueeGardens,
};

function formatEventDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const datePart = d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
  const timePart = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

function adaptEvent(e) {
  const slug = e.category?.slug || "conferences";
  const priceNum = Number(e.price);
  return {
    id: e.id,
    title: e.title,
    category: e.category?.name || "Event",
    categorySlug: slug,
    date: formatEventDate(e.date_time),
    venue: `${e.venue}, ${e.city}`,
    price: priceNum > 0 ? `PKR ${priceNum.toLocaleString()}` : "Free",
    seatsLeft: e.seats_left,
    seatsTotal: e.capacity,
    tone: CATEGORY_TONE[slug] || "gold",
    image: CATEGORY_IMAGE[slug] || imgMainStage,
  };
}

// `photo` points at /public/media — a real event photo the site owner drops in later.
// `img` is the existing illustration, used as the onError fallback until then.
const GALLERY = [
  { caption: "Main stage, AI Summit 2026", photo: "/media/gallery/gallery-01-main-stage.jpg", img: imgMainStage },
  { caption: "Check-in line at Expo Center", photo: "/media/gallery/gallery-02-checkin-line.jpg", img: imgCheckinLine },
  { caption: "Riverside Amphitheatre at dusk", photo: "/media/gallery/gallery-03-riverside-dusk.jpg", img: imgRiversideDusk },
  { caption: "Workshop breakout room", photo: "/media/gallery/gallery-04-workshop-room.jpg", img: imgWorkshopRoom },
  { caption: "Organizer scanning tickets", photo: "/media/gallery/gallery-05-scanning-tickets.jpg", img: imgScanningTickets },
  { caption: "Attendee lounge", photo: "/media/gallery/gallery-06-attendee-lounge.jpg", img: imgAttendeeLounge },
  { caption: "Marquee Gardens setup", photo: "/media/gallery/gallery-07-marquee-gardens.jpg", img: imgMarqueeGardens },
  { caption: "Post-event teardown", photo: "/media/gallery/gallery-08-post-teardown.jpg", img: imgPostTeardown },
];

const ROLE_PHOTOS = {
  Admin: "/media/roles/role-admin.jpg",
  Organizer: "/media/roles/role-organizer.jpg",
  Attendee: "/media/roles/role-attendee.jpg",
};

const SHORTCUTS = [
  ["/", "Focus the search field"],
  ["D", "Toggle light / dark theme"],
  ["?", "Open this shortcuts panel"],
  ["Esc", "Close any open dialog"],
  ["← / →", "Navigate the photo gallery"],
];

/* ---------------------------------- Global styles ---------------------------------- */
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

      .es-root { font-family: 'Inter', ui-sans-serif, system-ui; }
      .es-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui; }
      .es-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }

      .es-root :focus-visible {
        outline: 2px solid ${PALETTE.gold};
        outline-offset: 2px;
        border-radius: 4px;
      }

      .es-bg-ink { background-color: ${PALETTE.ink}; }
      .es-bg-ink-soft { background-color: ${PALETTE.inkSoft}; }
      .es-bg-porcelain { background-color: ${PALETTE.porcelain}; }
      .es-bg-porcelain-soft { background-color: ${PALETTE.porcelainSoft}; }
      .es-bg-gold { background-color: ${PALETTE.gold}; }
      .es-bg-plum { background-color: ${PALETTE.plum}; }
      .es-bg-teal { background-color: ${PALETTE.teal}; }

      .es-text-ink { color: ${PALETTE.ink}; }
      .es-text-porcelain { color: ${PALETTE.porcelain}; }
      .es-text-gold { color: ${PALETTE.gold}; }
      .es-text-plum { color: ${PALETTE.plum}; }
      .es-text-teal { color: ${PALETTE.teal}; }
      .es-text-slate { color: ${PALETTE.slate}; }

      /* Perforated tear line — signature motif */
      .es-tear {
        position: relative;
        border-top: 1.5px dashed ${PALETTE.line};
      }
      .es-stub-dark::before, .es-stub-dark::after {
        content: '';
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: ${PALETTE.ink};
        left: -9px;
      }
      .es-stub-dark::before { top: -9px; }
      .es-stub-dark::after { bottom: -9px; }

      @keyframes es-marquee {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
      .es-marquee-track { animation: es-marquee 26s linear infinite; width: max-content; }

      @keyframes es-scan { 0% { top: 6%; } 50% { top: 88%; } 100% { top: 6%; } }
      .es-scanline { animation: es-scan 2.6s ease-in-out infinite; }

      @keyframes es-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
      .es-skeleton {
        background-image: linear-gradient(90deg, var(--sk-a) 25%, var(--sk-b) 37%, var(--sk-a) 63%);
        background-size: 400% 100%;
        animation: es-shimmer 1.4s ease infinite;
      }

      @keyframes es-pop { from { opacity: 0; transform: scale(0.96) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      .es-pop { animation: es-pop 0.18s ease-out; }

      @keyframes es-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .es-toast { animation: es-toast-in 0.2s ease-out; }

      @keyframes es-tooltip-in { from { opacity: 0; transform: translate(-50%, 4px); } to { opacity: 1; transform: translate(-50%, 0); } }
      .es-tooltip { animation: es-tooltip-in 0.12s ease-out; }

      .es-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
      .es-reveal.es-visible { opacity: 1; transform: translateY(0); }

      .es-card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
      .es-card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 28px -12px rgba(0,0,0,0.35); }

      @media (prefers-reduced-motion: reduce) {
        .es-marquee-track, .es-scanline, .es-skeleton, .es-pop, .es-toast, .es-tooltip { animation: none !important; }
        .es-reveal { transition: none !important; opacity: 1 !important; transform: none !important; }
        .es-card-hover:hover { transform: none !important; }
      }

      @media print {
        body * { visibility: hidden !important; }
        .es-print-area, .es-print-area * { visibility: visible !important; }
        .es-print-area {
          position: absolute; left: 0; top: 0; width: 100%;
          box-shadow: none !important;
        }
        .es-no-print { display: none !important; }
      }
    `}</style>
  );
}

/* ---------------------------------- Small utilities ---------------------------------- */
function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function HeroVideo({ reducedMotion }) {
  const [videoOk, setVideoOk] = useState(true);
  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      {videoOk && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          poster="/media/hero/hero-poster.jpg"
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          onError={() => setVideoOk(false)}
        >
          <source src="/media/hero/hero-loop.mp4" type="video/mp4" />
        </video>
      )}
      {/* Scrim so hero copy stays legible over any footage, in both themes */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(115deg, ${PALETTE.ink}F2 0%, ${PALETTE.ink}D9 38%, ${PALETTE.ink}A8 100%)` }}
      />
    </div>
  );
}

function CheckinPhoto({ dark }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <div
      className="es-card-hover absolute -bottom-6 -right-6 w-28 h-20 rounded-xl overflow-hidden border-4 shadow-lg hidden sm:block"
      style={{ borderColor: dark ? PALETTE.ink : "#fff" }}
    >
      <img
        src="/media/tickets/checkin-moment.jpg"
        alt="Organizer scanning a ticket at the door"
        loading="lazy"
        onError={() => setOk(false)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function Reveal({ children, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`es-reveal ${visible ? "es-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ---------------------------------- Error boundary ---------------------------------- */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() {}
  handleReset = () => this.setState({ hasError: false });
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: this.props.lineColor || PALETTE.lineDark }}>
          <AlertTriangle className="w-6 h-6 mx-auto mb-3" style={{ color: PALETTE.danger }} />
          <p className="es-display font-semibold mb-1" style={{ color: this.props.textColor }}>
            Something broke on this panel
          </p>
          <p className="text-sm mb-4" style={{ color: this.props.mutedColor }}>
            The rest of the page still works. Reload this section to try again.
          </p>
          <button
            onClick={() => { this.handleReset(); this.props.onReset && this.props.onReset(); }}
            className="text-sm font-semibold px-4 py-2 rounded-full es-bg-gold es-text-ink"
          >
            Reload section
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function CrashDemo({ crash }) {
  if (crash) { throw new Error("Demo error for the error boundary"); }
  return null;
}

/* ---------------------------------- Tooltip ---------------------------------- */
function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className="es-mono es-tooltip absolute -top-9 left-1/2 whitespace-nowrap text-[11px] font-medium px-2.5 py-1.5 rounded-md z-40"
          style={{ backgroundColor: PALETTE.ink, color: PALETTE.porcelain, border: `1px solid ${PALETTE.lineDark}` }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

/* ---------------------------------- Toasts ---------------------------------- */
function ToastStack({ toasts }) {
  const iconFor = { success: CheckCircle2, error: AlertTriangle, info: Info };
  const colorFor = { success: PALETTE.teal, error: PALETTE.danger, info: PALETTE.gold };
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-72 max-w-[90vw]"
    >
      {toasts.map((t) => {
        const Icon = iconFor[t.type] || Info;
        return (
          <div
            key={t.id}
            className="es-toast flex items-start gap-2.5 rounded-xl px-4 py-3 shadow-lg border"
            style={{ backgroundColor: PALETTE.inkSoft, borderColor: PALETTE.lineDark }}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: colorFor[t.type] }} />
            <p className="text-sm" style={{ color: PALETTE.porcelain }}>{t.message}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------- Modal (focus-trapped) ---------------------------------- */
function Modal({ open, onClose, title, children, dark = true }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement;
    const t = setTimeout(() => panelRef.current?.focus(), 0);

    function onKeyDown(e) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
      if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="es-pop relative rounded-2xl w-full max-w-md p-6 outline-none"
        style={{
          backgroundColor: dark ? PALETTE.inkSoft : "#fff",
          color: dark ? PALETTE.porcelain : PALETTE.ink,
          border: `1px solid ${dark ? PALETTE.lineDark : PALETTE.line}`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="es-display text-lg font-semibold">{title}</h3>
          <button
            aria-label="Close dialog"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: dark ? PALETTE.porcelain : PALETTE.ink }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------- Create-event form (real-time validation) ---------------------------------- */
function CreateEventForm({ onSubmit, categories, dark = true }) {
  const labelColor = dark ? "#B9BBC4" : PALETTE.slate;
  const fieldTextColor = dark ? PALETTE.porcelain : PALETTE.ink;
  const fieldBorderColor = dark ? PALETTE.lineDark : PALETTE.line;
  const [values, setValues] = useState({
    title: "", venue: "", city: "", category_id: "", date_time: "", capacity: "", price: "", description: "",
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverFieldErrors, setServerFieldErrors] = useState({});

  const errors = useMemo(() => {
    const e = {};
    if (!values.title.trim()) e.title = "Event name is required.";
    else if (values.title.trim().length < 3) e.title = "Use at least 3 characters.";

    if (!values.venue.trim()) e.venue = "Venue is required.";
    if (!values.city.trim()) e.city = "City is required.";
    if (!values.category_id) e.category_id = "Pick a category.";

    if (!values.capacity) e.capacity = "Capacity is required.";
    else if (!/^\d+$/.test(values.capacity) || Number(values.capacity) <= 0) e.capacity = "Enter a whole number greater than 0.";

    if (values.price === "" || Number.isNaN(Number(values.price)) || Number(values.price) < 0) e.price = "Enter a price of 0 or more.";

    if (!values.date_time) e.date_time = "Pick a date and time.";
    else if (new Date(values.date_time) <= new Date()) e.date_time = "Date/time must be in the future.";

    return { ...e, ...serverFieldErrors };
  }, [values, serverFieldErrors]);

  const isValid = Object.keys(errors).length === 0;

  function field(key, label, type = "text", placeholder = "") {
    const showError = touched[key] && errors[key];
    return (
      <div className="mb-4">
        <label htmlFor={`ce-${key}`} className="text-xs font-medium mb-1.5 block" style={{ color: labelColor }}>
          {label}
        </label>
        <input
          id={`ce-${key}`}
          type={type}
          placeholder={placeholder}
          value={values[key]}
          onChange={(e) => { setValues((v) => ({ ...v, [key]: e.target.value })); setServerFieldErrors((f) => { const { [key]: _drop, ...rest } = f; return rest; }); }}
          onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
          aria-invalid={!!showError}
          aria-describedby={showError ? `ce-${key}-err` : undefined}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none border bg-transparent"
          style={{ borderColor: showError ? PALETTE.danger : fieldBorderColor, color: fieldTextColor }}
        />
        {showError && (
          <p id={`ce-${key}-err`} className="text-xs mt-1.5 flex items-center gap-1" style={{ color: PALETTE.danger }}>
            <AlertTriangle className="w-3 h-3" /> {errors[key]}
          </p>
        )}
      </div>
    );
  }

  const allTouchKeys = ["title", "venue", "city", "category_id", "date_time", "capacity", "price"];

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setTouched(Object.fromEntries(allTouchKeys.map((k) => [k, true])));
        setServerError("");
        if (!isValid) return;

        setSubmitting(true);
        try {
          await onSubmit({
            title: values.title.trim(),
            venue: values.venue.trim(),
            city: values.city.trim(),
            category_id: Number(values.category_id),
            date_time: new Date(values.date_time).toISOString(),
            capacity: Number(values.capacity),
            price: Number(values.price),
            description: values.description.trim(),
          });
          setValues({ title: "", venue: "", city: "", category_id: "", date_time: "", capacity: "", price: "", description: "" });
          setTouched({});
        } catch (err) {
          if (err instanceof ApiError && err.fields) {
            setServerFieldErrors(Object.fromEntries(Object.entries(err.fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])));
          } else {
            setServerError(err?.message || "Could not create the event. Please try again.");
          }
        } finally {
          setSubmitting(false);
        }
      }}
      noValidate
    >
      {field("title", "Event name", "text", "e.g. AI Summit 2026")}
      {field("venue", "Venue", "text", "e.g. Expo Center")}
      {field("city", "City", "text", "e.g. Lahore")}

      <div className="mb-4">
        <label htmlFor="ce-category" className="text-xs font-medium mb-1.5 block" style={{ color: labelColor }}>Category</label>
        <select
          id="ce-category"
          value={values.category_id}
          onChange={(e) => { setValues((v) => ({ ...v, category_id: e.target.value })); setServerFieldErrors((f) => { const { category_id: _drop, ...rest } = f; return rest; }); }}
          onBlur={() => setTouched((t) => ({ ...t, category_id: true }))}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none border bg-transparent"
          style={{ borderColor: touched.category_id && errors.category_id ? PALETTE.danger : fieldBorderColor, color: fieldTextColor }}
        >
          <option value="" style={{ color: PALETTE.ink }}>Select a category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} style={{ color: PALETTE.ink }}>{c.name}</option>
          ))}
        </select>
        {touched.category_id && errors.category_id && (
          <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: PALETTE.danger }}>
            <AlertTriangle className="w-3 h-3" /> {errors.category_id}
          </p>
        )}
      </div>

      {field("capacity", "Capacity", "text", "e.g. 200")}
      {field("price", "Price (PKR, 0 for free)", "text", "e.g. 4500")}
      {field("date_time", "Date & time", "datetime-local")}

      {serverError && (
        <p className="text-xs mb-3 flex items-center gap-1" style={{ color: PALETTE.danger }}>
          <AlertTriangle className="w-3 h-3" /> {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-opacity"
        style={{
          backgroundColor: PALETTE.gold,
          color: PALETTE.ink,
          opacity: isValid && !submitting ? 1 : 0.45,
          cursor: isValid && !submitting ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? "Creating…" : "Create event"} <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

/* ---------------------------------- Auth form (login / register) ---------------------------------- */
function AuthForm({ mode, onSubmit, onSwitchMode, dark = true }) {
  const isRegister = mode === "register";
  const labelColor = dark ? "#B9BBC4" : PALETTE.slate;
  const fieldTextColor = dark ? PALETTE.porcelain : PALETTE.ink;
  const fieldBorderColor = dark ? PALETTE.lineDark : PALETTE.line;
  const [values, setValues] = useState({ name: "", email: "", password: "", role: "attendee" });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const errors = useMemo(() => {
    const e = {};
    if (isRegister && values.name.trim().length < 2) e.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Enter a valid email address.";
    if (isRegister) {
      if (values.password.length < 8 || !/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
        e.password = "At least 8 characters, with a letter and a digit.";
      }
    } else if (!values.password) {
      e.password = "Enter your password.";
    }
    return e;
  }, [values, isRegister]);

  const isValid = Object.keys(errors).length === 0;

  function field(key, label, type = "text") {
    const showError = touched[key] && errors[key];
    return (
      <div className="mb-4">
        <label htmlFor={`au-${key}`} className="text-xs font-medium mb-1.5 block" style={{ color: labelColor }}>
          {label}
        </label>
        <input
          id={`au-${key}`}
          type={type}
          value={values[key]}
          onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
          aria-invalid={!!showError}
          aria-describedby={showError ? `au-${key}-err` : undefined}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none border bg-transparent"
          style={{ borderColor: showError ? PALETTE.danger : fieldBorderColor, color: fieldTextColor }}
        />
        {showError && (
          <p id={`au-${key}-err`} className="text-xs mt-1.5 flex items-center gap-1" style={{ color: PALETTE.danger }}>
            <AlertTriangle className="w-3 h-3" /> {errors[key]}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setTouched({ name: true, email: true, password: true });
        setServerError("");
        if (!isValid) return;

        setSubmitting(true);
        try {
          await onSubmit(values);
        } catch (err) {
          setServerError(err?.message || "Something went wrong. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
      noValidate
    >
      {isRegister && field("name", "Full name")}
      {field("email", "Email", "email")}
      {field("password", "Password", "password")}

      {isRegister && (
        <div className="mb-4">
          <label htmlFor="au-role" className="text-xs font-medium mb-1.5 block" style={{ color: labelColor }}>I am signing up as</label>
          <select
            id="au-role"
            value={values.role}
            onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none border bg-transparent"
            style={{ borderColor: fieldBorderColor, color: fieldTextColor }}
          >
            <option value="attendee" style={{ color: PALETTE.ink }}>Attendee — book tickets</option>
            <option value="organizer" style={{ color: PALETTE.ink }}>Organizer — create events</option>
          </select>
        </div>
      )}

      {serverError && (
        <p className="text-xs mb-3 flex items-center gap-1" style={{ color: PALETTE.danger }}>
          <AlertTriangle className="w-3 h-3" /> {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-opacity"
        style={{
          backgroundColor: PALETTE.gold,
          color: PALETTE.ink,
          opacity: isValid && !submitting ? 1 : 0.45,
          cursor: isValid && !submitting ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? (isRegister ? "Creating account…" : "Logging in…") : isRegister ? "Create account" : "Log in"}
        <ArrowRight className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onSwitchMode}
        className="w-full mt-3 text-xs underline decoration-dotted text-center"
        style={{ color: labelColor }}
      >
        {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
      </button>
    </form>
  );
}

/* ---------------------------------- Event card ---------------------------------- */
const EventCard = React.memo(function EventCard({ event, dark, isFavorite, onToggleFavorite, onBook, booking }) {
  const { title, category, date, venue, price, seatsLeft, seatsTotal, tone, image } = event;
  const pct = Math.round((seatsLeft / seatsTotal) * 100);
  const soldOut = seatsLeft <= 0;
  const accent = tone === "teal" ? PALETTE.teal : tone === "plum" ? PALETTE.plum : PALETTE.gold;
  const badgeBg = tone === "gold" ? PALETTE.goldSoft : tone === "teal" ? "#CFE6E2" : "#E4CBDA";
  const badgeFg = tone === "gold" ? "#7A5A17" : tone === "teal" ? PALETTE.teal : PALETTE.plum;

  return (
    <div
      className="es-card-hover relative rounded-2xl overflow-hidden border shadow-sm flex flex-col"
      style={{ borderColor: dark ? PALETTE.lineDark : PALETTE.line, backgroundColor: dark ? PALETTE.inkSoft : "#fff" }}
    >
      <div className="relative h-36 w-full overflow-hidden">
        {image && (
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${accent}33, ${PALETTE.ink}B3)` }}
        />
        <div className="relative h-full w-full flex items-start justify-between px-5 py-4">
          <span
            className="es-mono inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase"
            style={{ backgroundColor: badgeBg, color: badgeFg }}
          >
            {category}
          </span>
          <Tooltip label={isFavorite ? "Remove from favorites" : "Save to favorites"}>
            <button
              aria-label={isFavorite ? `Remove ${title} from favorites` : `Save ${title} to favorites`}
              aria-pressed={isFavorite}
              onClick={() => onToggleFavorite(event)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/45 transition-colors"
            >
              <Heart className="w-4 h-4" style={{ color: "#fff", fill: isFavorite ? "#fff" : "none" }} />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h4 className="es-display text-lg font-semibold" style={{ color: dark ? PALETTE.porcelain : PALETTE.ink }}>
          {title}
        </h4>

        <div className="flex flex-col gap-1.5 text-sm" style={{ color: dark ? "#B9BBC4" : PALETTE.slate }}>
          <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {date}</span>
          <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {venue}</span>
        </div>

        <div className="mt-1">
          <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: dark ? "#9DA0AC" : PALETTE.slate }}>
            <span>{seatsLeft} seats left</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: dark ? PALETTE.lineDark : PALETTE.porcelainSoft }}>
            <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: accent }} />
          </div>
        </div>

        <div className="es-tear mt-2 pt-3 flex items-center justify-between" style={{ borderColor: dark ? PALETTE.lineDark : PALETTE.line }}>
          <span className="es-mono text-base font-semibold" style={{ color: dark ? PALETTE.porcelain : PALETTE.ink }}>
            {price}
          </span>
          <button
            onClick={() => onBook(event)}
            disabled={soldOut || booking}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
            style={{ backgroundColor: accent, color: tone === "gold" ? PALETTE.ink : "#fff" }}
          >
            {soldOut ? "Sold out" : booking ? "Booking…" : "Book now"} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

function EventCardSkeleton({ dark }) {
  const vars = { "--sk-a": dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", "--sk-b": dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)" };
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: dark ? PALETTE.lineDark : PALETTE.line, backgroundColor: dark ? PALETTE.inkSoft : "#fff", ...vars }}>
      <div className="h-36 w-full es-skeleton" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-5 w-3/4 es-skeleton rounded" />
        <div className="h-3 w-1/2 es-skeleton rounded" />
        <div className="h-3 w-2/3 es-skeleton rounded" />
        <div className="h-1.5 w-full es-skeleton rounded-full mt-2" />
        <div className="h-8 w-full es-skeleton rounded-full mt-3" />
      </div>
    </div>
  );
}

function RoleCard({ icon: Icon, title, accent, points, dark, photo }) {
  const [photoOk, setPhotoOk] = useState(true);
  return (
    <div
      className="es-card-hover relative rounded-2xl p-6 border flex flex-col gap-4"
      style={{ borderColor: dark ? PALETTE.lineDark : PALETTE.line, backgroundColor: dark ? PALETTE.inkSoft : "#fff" }}
    >
      <div className="relative w-11 h-11 shrink-0">
        {photoOk ? (
          <img
            src={photo}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={() => setPhotoOk(false)}
            className="w-11 h-11 rounded-xl object-cover"
            style={{ border: `1px solid ${accent}55` }}
          />
        ) : (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + "22" }}>
            <Icon className="w-5 h-5" style={{ color: accent }} />
          </div>
        )}
        <div
          className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2"
          style={{ backgroundColor: accent, borderColor: dark ? PALETTE.inkSoft : "#fff", display: photoOk ? "flex" : "none" }}
        >
          <Icon className="w-2.5 h-2.5" style={{ color: "#fff" }} />
        </div>
      </div>
      <h3 className="es-display text-lg font-semibold" style={{ color: dark ? PALETTE.porcelain : PALETTE.ink }}>{title}</h3>
      <ul className="flex flex-col gap-2 text-sm" style={{ color: dark ? "#B9BBC4" : PALETTE.slate }}>
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------- Main component ---------------------------------- */
export default function EventSpherePro() {
  const { user, login, register, logout } = useAuth();
  const reducedMotion = usePrefersReducedMotion();

  const [dark, setDark] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);
  const [navOpen, setNavOpen] = useState(false);

  const [favorites, setFavorites] = useState(() => new Set());
  const [toasts, setToasts] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [crashDemo, setCrashDemo] = useState(false);

  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [page, setPage] = useState(1);
  const [bookingEventId, setBookingEventId] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const searchRef = useRef(null);
  const sentinelRef = useRef(null);

  const addToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const toggleFavorite = useCallback((event) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(event.id)) { next.delete(event.id); addToast("info", `Removed "${event.title}" from favorites`); }
      else { next.add(event.id); addToast("success", `Saved "${event.title}" to favorites`); }
      return next;
    });
  }, [addToast]);

  const handleOpenCreateEvent = useCallback(() => {
    if (!user) { setAuthMode("register"); setAuthOpen(true); addToast("info", "Create an organizer account to publish events."); return; }
    if (user.role !== "organizer") { addToast("error", "Only organizer accounts can create events."); return; }
    setCreateOpen(true);
  }, [user, addToast]);

  const handleLogout = useCallback(async () => {
    await logout();
    addToast("info", "Logged out.");
  }, [logout, addToast]);

  const handleCreateEvent = useCallback(async (payload) => {
    const data = await api.post("/events", payload);
    addToast("success", `"${data.event.title}" was created and is pending admin approval before it goes live.`);
    setCreateOpen(false);
  }, [addToast]);

  const handleBook = useCallback(async (event) => {
    if (!user) { setAuthMode("login"); setAuthOpen(true); addToast("info", "Log in as an attendee to book tickets."); return; }
    if (user.role !== "attendee") { addToast("error", "Only attendee accounts can book tickets."); return; }

    setBookingEventId(event.id);
    try {
      const data = await api.post(`/events/${event.id}/bookings`, { quantity: 1 });
      addToast("success", `Booked! Your ticket code is ${data.booking.ticket_code}.`);
      setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, seatsLeft: Math.max(0, e.seatsLeft - 1) } : e)));
    } catch (err) {
      addToast("error", err?.message || "Could not complete the booking.");
    } finally {
      setBookingEventId(null);
    }
  }, [user, addToast]);

  // Categories drive both the filter pills and the create-event form.
  useEffect(() => {
    api.get("/categories").then((data) => setCategories(data.categories)).catch(() => {});
  }, []);

  const categorySlugForFilter = activeFilter === "All" ? null : categories.find((c) => c.name === activeFilter)?.slug;

  const fetchEvents = useCallback((targetPage, replace) => {
    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    params.set("per_page", targetPage === 1 ? "6" : "3");
    if (categorySlugForFilter) params.set("category", categorySlugForFilter);
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());

    const setLoading = replace ? setFilterLoading : setLoadingMore;
    setLoading(true);
    return api
      .get(`/events?${params.toString()}`)
      .then((data) => {
        const adapted = data.events.map(adaptEvent);
        setEvents((prev) => (replace ? adapted : [...prev, ...adapted]));
        setTotalEvents(data.total);
        setPage(targetPage);
      })
      .catch(() => addToast("error", "Could not load events. Please try again."))
      .finally(() => setLoading(false));
  }, [categorySlugForFilter, debouncedQuery, addToast]);

  // Initial load
  useEffect(() => {
    fetchEvents(1, true).finally(() => setInitialLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch from page 1 whenever the filter or search term changes (initial mount handled above)
  const skipNextFilterFetch = useRef(true);
  useEffect(() => {
    if (skipNextFilterFetch.current) { skipNextFilterFetch.current = false; return; }
    fetchEvents(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, debouncedQuery]);

  const hasMore = events.length < totalEvents;

  // Infinite scroll
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore && !filterLoading && hasMore) {
        fetchEvents(page + 1, false);
      }
    }, { threshold: 0.5 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [loadingMore, filterLoading, hasMore, page, fetchEvents]);

  // Global keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement && document.activeElement.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === "/" && !typing) { e.preventDefault(); searchRef.current?.focus(); }
      else if (e.key.toLowerCase() === "d" && !typing) { setDark((d) => !d); }
      else if (e.key === "?" && !typing) { setShortcutsOpen(true); }
      else if (e.key === "Escape") { setShortcutsOpen(false); setCreateOpen(false); setAuthOpen(false); setLightboxIndex(null); }
      else if (lightboxIndex !== null && e.key === "ArrowRight") { setLightboxIndex((i) => (i + 1) % GALLERY.length); }
      else if (lightboxIndex !== null && e.key === "ArrowLeft") { setLightboxIndex((i) => (i - 1 + GALLERY.length) % GALLERY.length); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex]);

  const filters = categories.length ? ["All", ...categories.map((c) => c.name)] : ["All", "Conferences", "Concerts", "Workshops", "Weddings"];

  const contentBg = dark ? PALETTE.ink : PALETTE.porcelain;
  const contentBgSoft = dark ? PALETTE.inkSoft : "#fff";
  const contentText = dark ? PALETTE.porcelain : PALETTE.ink;
  const contentMuted = dark ? "#B9BBC4" : PALETTE.slate;
  const contentLine = dark ? PALETTE.lineDark : PALETTE.line;
  const skeletonVars = { "--sk-a": dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", "--sk-b": dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)" };

  return (
    <div className="es-root min-h-screen" style={{ backgroundColor: contentBg, color: contentText }}>
      <Styles />
      <ToastStack toasts={toasts} />

      {/* Skip link for keyboard users */}
      <a
        href="#es-main"
        className="es-no-print sr-only focus:not-sr-only fixed top-2 left-2 z-50 px-4 py-2 rounded-full text-sm font-semibold es-bg-gold es-text-ink"
      >
        Skip to content
      </a>

      {/* ---------------- NAV ---------------- */}
      <header className="es-no-print sticky top-0 z-30 border-b transition-colors" style={{ backgroundColor: contentBgSoft, borderColor: contentLine }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg es-bg-gold flex items-center justify-center">
              <Ticket className="w-4 h-4" style={{ color: PALETTE.ink }} />
            </div>
            <span className="es-display text-lg font-semibold" style={{ color: contentText }}>
              EventSphere <span className="es-text-gold">Pro</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: contentMuted }} aria-label="Primary">
            <a href="#discover" className="hover:opacity-70 transition-opacity">Discover</a>
            <a href="#organizers" className="hover:opacity-70 transition-opacity">For organizers</a>
            <a href="#analytics" className="hover:opacity-70 transition-opacity">Analytics</a>
            <a href="#tickets" className="hover:opacity-70 transition-opacity">Ticketing</a>
            <a href="#gallery" className="hover:opacity-70 transition-opacity">Gallery</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Tooltip label="Keyboard shortcuts (?)">
              <button
                aria-label="Show keyboard shortcuts"
                onClick={() => setShortcutsOpen(true)}
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hidden sm:flex"
                style={{ borderColor: contentLine, color: contentMuted }}
              >
                <Keyboard className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip label={dark ? "Switch to light theme (D)" : "Switch to dark theme (D)"}>
              <button
                aria-label="Toggle color theme"
                onClick={() => setDark((d) => !d)}
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors"
                style={{ borderColor: contentLine, color: contentMuted }}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </Tooltip>
            {user ? (
              <>
                {user.role === "organizer" && (
                  <button
                    onClick={handleOpenCreateEvent}
                    className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full es-bg-gold es-text-ink"
                  >
                    Create event <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <Tooltip label={`Signed in as ${user.name} (${user.role})`}>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border" style={{ borderColor: contentLine, color: contentMuted }}>
                    {user.name}
                  </span>
                </Tooltip>
                <Tooltip label="Log out">
                  <button
                    aria-label="Log out"
                    onClick={handleLogout}
                    className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors"
                    style={{ borderColor: contentLine, color: contentMuted }}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </Tooltip>
              </>
            ) : (
              <button
                onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full es-bg-gold es-text-ink"
              >
                Log in <LogIn className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              aria-label={navOpen ? "Close menu" : "Open menu"}
              className="md:hidden w-9 h-9 flex items-center justify-center"
              style={{ color: contentText }}
              onClick={() => setNavOpen((n) => !n)}
            >
              {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {navOpen && (
          <div className="md:hidden flex flex-col gap-4 px-5 pb-5 text-sm font-medium" style={{ color: contentMuted }}>
            <a href="#discover">Discover</a>
            <a href="#organizers">For organizers</a>
            <a href="#analytics">Analytics</a>
            <a href="#tickets">Ticketing</a>
            <a href="#gallery">Gallery</a>
            {user ? (
              <>
                {user.role === "organizer" && (
                  <button
                    onClick={handleOpenCreateEvent}
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full es-bg-gold es-text-ink w-fit"
                  >
                    Create event <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold w-fit"
                >
                  Log out ({user.name}) <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => { setAuthMode("login"); setAuthOpen(true); setNavOpen(false); }}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full es-bg-gold es-text-ink w-fit"
              >
                Log in <LogIn className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </header>

      <main id="es-main">
        {/* ---------------- HERO ---------------- */}
        <section className="pt-16 pb-20 px-5 sm:px-8 relative overflow-hidden transition-colors" style={{ backgroundColor: PALETTE.ink }}>
          <HeroVideo reducedMotion={reducedMotion} />
          <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <Reveal>
              <span className="es-mono text-xs tracking-[0.2em] uppercase es-text-gold">Event infrastructure, not just a listing page</span>
              <h1 className="es-display text-4xl sm:text-5xl font-bold leading-tight mt-4" style={{ color: PALETTE.porcelain }}>
                Sell the seat.<br />Scan the ticket.<br /><span className="es-text-gold">Own the data.</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed max-w-md" style={{ color: "rgba(241,241,244,0.78)" }}>
                EventSphere Pro gives organizers a real backend for events — bookings, payments,
                QR check-in, and live revenue analytics — instead of a form bolted onto a calendar.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleOpenCreateEvent}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-full es-bg-gold es-text-ink"
                >
                  Start selling tickets <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#tickets"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-full border"
                  style={{ borderColor: "rgba(241,241,244,0.3)", color: PALETTE.porcelain }}
                >
                  <ScanLine className="w-4 h-4" /> See the QR flow
                </a>
              </div>
            </Reveal>

            {/* Signature: ticket stub visual, also the print target */}
            <Reveal className="relative mx-auto max-w-sm w-full">
              <div className="es-print-area rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: PALETTE.inkSoft, border: `1px solid ${PALETTE.lineDark}` }}>
                <div className="p-5 flex items-center justify-between" style={{ background: `linear-gradient(120deg, ${PALETTE.plum}, ${PALETTE.inkSoft})` }}>
                  <span className="es-mono text-[11px] tracking-widest uppercase text-white/80">EventSphere</span>
                  <BadgeCheck className="w-4 h-4 text-white/80" />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide" style={{ color: "#9DA0AC" }}>Event</p>
                  <p className="es-display text-lg font-semibold es-text-porcelain">AI Summit 2026</p>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide" style={{ color: "#9DA0AC" }}>Attendee</p>
                      <p className="es-text-porcelain font-medium">Sara</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide" style={{ color: "#9DA0AC" }}>Ticket ID</p>
                      <p className="es-mono es-text-gold font-semibold">ES-10293</p>
                    </div>
                  </div>
                </div>
                <div className="relative es-tear es-stub-dark mx-5" style={{ borderColor: PALETTE.lineDark }} />
                <div className="p-6 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-lg grid grid-cols-5 grid-rows-5 gap-0.5 p-2" style={{ backgroundColor: "#fff" }}>
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className="rounded-[1px]" style={{ backgroundColor: [3, 4, 7, 10, 12, 14, 17, 20, 21].includes(i) ? PALETTE.ink : "transparent" }} />
                    ))}
                  </div>
                </div>
                <div className="px-5 pb-5 flex items-center justify-center gap-2 text-xs" style={{ color: "#9DA0AC" }}>
                  <QrCode className="w-3.5 h-3.5" /> Scan at entry to check in
                </div>
              </div>
              <div className="es-no-print flex justify-center mt-4">
                <Tooltip label="Print this ticket">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border"
                    style={{ borderColor: "rgba(241,241,244,0.3)", color: PALETTE.porcelain }}
                  >
                    <Printer className="w-4 h-4" /> Print ticket
                  </button>
                </Tooltip>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- MARQUEE STAT TICKER ---------------- */}
        <section className="es-no-print es-bg-plum py-3 overflow-hidden border-y" style={{ borderColor: PALETTE.lineDark }} aria-hidden="true">
          <div className="flex es-marquee-track">
            {[1, 2].map((rep) => (
              <div key={rep} className="flex items-center gap-10 pr-10 shrink-0">
                {[
                  ["12,400+", "tickets scanned"],
                  ["3,180", "events hosted"],
                  ["58", "cities"],
                  ["99.4%", "on-time check-in"],
                  ["4.8/5", "organizer rating"],
                ].map(([num, label]) => (
                  <span key={label + rep} className="es-mono text-sm font-semibold text-white/90 flex items-center gap-2 whitespace-nowrap">
                    <Ticket className="w-3.5 h-3.5 text-white/60" /> {num} <span className="font-normal text-white/60">{label}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- ROLES ---------------- */}
        <section id="organizers" className="px-5 sm:px-8 py-20" style={{ backgroundColor: contentBg }}>
          <div className="max-w-6xl mx-auto">
            <Reveal className="max-w-xl mb-12">
              <span className="es-mono text-xs tracking-[0.2em] uppercase es-text-teal">Three roles, one platform</span>
              <h2 className="es-display text-3xl font-bold mt-3" style={{ color: contentText }}>Built around who's actually in the room</h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: contentMuted }}>
                Every screen is scoped to a role, so nobody sees a control they don't need.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              <Reveal><RoleCard icon={UserCog} title="Admin" accent={PALETTE.plum} dark={dark} photo={ROLE_PHOTOS.Admin}
                points={["Approve and verify organizers", "Manage categories platform-wide", "Monitor usage across every event", "Full platform analytics"]} /></Reveal>
              <Reveal><RoleCard icon={CalendarCheck2} title="Organizer" accent={PALETTE.gold} dark={dark} photo={ROLE_PHOTOS.Organizer}
                points={["Publish events with tiered ticketing", "Track bookings as they land", "Scan QR tickets at the door", "Revenue analytics per event"]} /></Reveal>
              <Reveal><RoleCard icon={Users} title="Attendee" accent={PALETTE.teal} dark={dark} photo={ROLE_PHOTOS.Attendee}
                points={["Search and filter by date, price, city", "Pay securely, get a QR ticket instantly", "Manage bookings in one place", "Leave a review after the event"]} /></Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- DISCOVERY ---------------- */}
        <section id="discover" className="px-5 sm:px-8 py-20" style={{ backgroundColor: dark ? PALETTE.inkSoft : PALETTE.porcelainSoft }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <Reveal>
                <span className="es-mono text-xs tracking-[0.2em] uppercase es-text-gold">Discover</span>
                <h2 className="es-display text-3xl font-bold mt-3" style={{ color: contentText }}>What's on right now</h2>
              </Reveal>
              <div className="flex items-center gap-2 rounded-full border px-4 py-2.5 w-full md:w-80" style={{ borderColor: contentLine, backgroundColor: contentBgSoft }}>
                <Search className="w-4 h-4 shrink-0" style={{ color: contentMuted }} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, venues, cities  (press / )"
                  aria-label="Search events"
                  className="bg-transparent outline-none text-sm w-full"
                  style={{ color: contentText }}
                />
                {query !== debouncedQuery ? (
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" style={{ color: contentMuted }} />
                ) : (
                  <SlidersHorizontal className="w-4 h-4 shrink-0" style={{ color: contentMuted }} />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    aria-pressed={activeFilter === f}
                    className="text-sm font-medium px-4 py-1.5 rounded-full border transition-colors"
                    style={activeFilter === f
                      ? { backgroundColor: PALETTE.gold, borderColor: PALETTE.gold, color: PALETTE.ink }
                      : { borderColor: contentLine, color: contentMuted }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCrashDemo(true)}
                className="es-no-print text-xs underline decoration-dotted"
                style={{ color: contentMuted }}
                title="Intentionally throws, to demonstrate the error boundary below"
              >
                Test error boundary
              </button>
            </div>

            <ErrorBoundary
              textColor={contentText}
              mutedColor={contentMuted}
              lineColor={contentLine}
              onReset={() => setCrashDemo(false)}
            >
              <CrashDemo crash={crashDemo} />

              {initialLoading || filterLoading ? (
                <div className="grid md:grid-cols-3 gap-6" style={skeletonVars}>
                  {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} dark={dark} />)}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border" style={{ borderColor: contentLine }}>
                  <Search className="w-6 h-6 mx-auto mb-3" style={{ color: contentMuted }} />
                  <p className="es-display font-semibold" style={{ color: contentText }}>No events match that search</p>
                  <p className="text-sm mt-1" style={{ color: contentMuted }}>Try a different keyword or clear the category filter.</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-6">
                    {events.map((ev) => (
                      <EventCard
                        key={ev.id}
                        event={ev}
                        dark={dark}
                        isFavorite={favorites.has(ev.id)}
                        onToggleFavorite={toggleFavorite}
                        onBook={handleBook}
                        booking={bookingEventId === ev.id}
                      />
                    ))}
                  </div>

                  {loadingMore && (
                    <div className="grid md:grid-cols-3 gap-6 mt-6" style={skeletonVars}>
                      {Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} dark={dark} />)}
                    </div>
                  )}

                  <div ref={sentinelRef} className="h-4" />
                  {!hasMore && !loadingMore && (
                    <p className="text-center text-xs mt-8" style={{ color: contentMuted }}>
                      You've reached the end — {totalEvents} event{totalEvents !== 1 ? "s" : ""} total.
                    </p>
                  )}
                </>
              )}
            </ErrorBoundary>
          </div>
        </section>

        {/* ---------------- ANALYTICS ---------------- */}
        <section id="analytics" className="px-5 sm:px-8 py-20 transition-colors" style={{ backgroundColor: contentBg }}>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <Reveal>
              <span className="es-mono text-xs tracking-[0.2em] uppercase es-text-teal">For organizers</span>
              <h2 className="es-display text-3xl font-bold mt-3" style={{ color: contentText }}>Know what sold, and why</h2>
              <p className="mt-3 text-sm leading-relaxed max-w-md" style={{ color: contentMuted }}>
                Every booking, refund, and check-in rolls up into a live dashboard —
                no spreadsheet exports required.
              </p>
              <div className="mt-8 flex flex-col gap-4">
                {[
                  [TrendingUp, "Monthly revenue trends across every event you run"],
                  [BarChart3, "Popularity ranking to see which events to repeat"],
                  [Wallet, "Payout tracking across Stripe, JazzCash and Easypaisa"],
                ].map(([Icon, text]) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: PALETTE.teal + "22" }}>
                      <Icon className="w-4 h-4 es-text-teal" />
                    </div>
                    <p className="text-sm mt-1.5" style={{ color: contentMuted }}>{text}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="rounded-2xl p-6 border" >
              <div style={{ backgroundColor: PALETTE.inkSoft, borderColor: PALETTE.lineDark }} className="rounded-2xl p-0">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[["18", "Events"], ["2,140", "Sold"], ["Rs 612K", "Revenue"], ["96%", "Attendance"]].map(([num, label]) => (
                    <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: PALETTE.ink }}>
                      <p className="es-mono text-lg font-semibold es-text-gold">{num}</p>
                      <p className="text-[10px] uppercase tracking-wide mt-1" style={{ color: "#8B8E99" }}>{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "#8B8E99" }}>Monthly revenue</p>
                <div className="flex items-end gap-2 h-28 mb-6">
                  {[40, 55, 48, 70, 62, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md transition-all duration-700" style={{ height: `${h}%`, backgroundColor: i === 5 ? PALETTE.gold : PALETTE.lineDark }} />
                  ))}
                </div>
                <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "#8B8E99" }}>Top events this month</p>
                <div className="flex flex-col gap-2">
                  {["AI Summit 2026", "Riverside Acoustic Night", "Product Design Workshop"].map((name, i) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span style={{ color: "#D7D9DF" }}>{name}</span>
                      <span className="es-mono es-text-teal">{[92, 74, 61][i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- QR / CHECK-IN ---------------- */}
        <section id="tickets" className="px-5 sm:px-8 py-20" style={{ backgroundColor: contentBg }}>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <Reveal className="order-2 lg:order-1 relative mx-auto max-w-xs w-full">
              <div className="relative rounded-2xl aspect-[4/5] border-2 border-dashed flex items-center justify-center overflow-hidden" style={{ borderColor: PALETTE.teal, backgroundColor: dark ? PALETTE.inkSoft : "#fff" }}>
                <QrCode className="w-20 h-20" style={{ color: contentMuted }} />
                <div className="es-scanline absolute left-3 right-3 h-0.5" style={{ backgroundColor: PALETTE.teal }} />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: PALETTE.teal + "1A", color: PALETTE.teal }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ticket valid — attendance marked
                </div>
              </div>
              <CheckinPhoto dark={dark} />
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <span className="es-mono text-xs tracking-[0.2em] uppercase es-text-plum">At the door</span>
              <h2 className="es-display text-3xl font-bold mt-3" style={{ color: contentText }}>One scan, no guest list printouts</h2>
              <p className="mt-3 text-sm leading-relaxed max-w-md" style={{ color: contentMuted }}>
                Every booking generates a unique QR ticket the moment payment clears.
                Organizers scan at entry from any phone — no extra hardware.
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm" style={{ color: contentMuted }}>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 es-text-plum" /> Duplicate scans are flagged instantly</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 es-text-plum" /> Real-time attendance count during the event</li>
                <li className="flex items-center gap-2"><Star className="w-4 h-4 es-text-plum" /> Review request sent automatically afterward</li>
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ---------------- GALLERY / LIGHTBOX ---------------- */}
        <section id="gallery" className="px-5 sm:px-8 py-20" style={{ backgroundColor: dark ? PALETTE.inkSoft : PALETTE.porcelainSoft }}>
          <div className="max-w-6xl mx-auto">
            <Reveal className="max-w-xl mb-10">
              <span className="es-mono text-xs tracking-[0.2em] uppercase es-text-gold">From the field</span>
              <h2 className="es-display text-3xl font-bold mt-3" style={{ color: contentText }}>Moments from events on the platform</h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: contentMuted }}>
                Placeholder tiles stand in for real event photography — select one to open the viewer.
              </p>
            </Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {GALLERY.map((g, i) => (
                <button
                  key={g.caption}
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Open photo: ${g.caption}`}
                  className="es-card-hover group relative aspect-square rounded-xl overflow-hidden"
                >
                  <img
                    src={g.photo}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = g.img; }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-2 left-2 right-2 text-[11px] font-medium text-white/90 line-clamp-2 text-left">
                    {g.caption}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- FINAL CTA ---------------- */}
        <section className="es-bg-gold px-5 sm:px-8 py-16">
          <Reveal className="max-w-4xl mx-auto text-center">
            <h2 className="es-display text-3xl sm:text-4xl font-bold es-text-ink">Your next event doesn't need a spreadsheet.</h2>
            <p className="mt-3 text-sm max-w-lg mx-auto" style={{ color: "#5B4517" }}>
              Set up your first event on EventSphere Pro in under ten minutes.
            </p>
            <button
              onClick={handleOpenCreateEvent}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full es-bg-ink es-text-porcelain"
            >
              Create your first event <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>
        </section>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="es-no-print px-5 sm:px-8 pt-12 pb-8 es-tear transition-colors" style={{ backgroundColor: contentBg, borderColor: contentLine }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md es-bg-gold flex items-center justify-center">
                <Ticket className="w-4 h-4 es-text-ink" />
              </div>
              <span className="es-display font-semibold" style={{ color: contentText }}>EventSphere Pro</span>
            </div>
            <p className="text-sm" style={{ color: contentMuted }}>Event infrastructure for organizers who sell real tickets.</p>
          </div>
          {[
            ["Product", ["Discovery", "Ticketing", "Analytics", "QR check-in"]],
            ["Organizers", ["Pricing", "Verification", "API"]],
            ["Company", ["About", "Support", "Status"]],
          ].map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs uppercase tracking-wide mb-3" style={{ color: contentMuted }}>{heading}</p>
              <ul className="flex flex-col gap-2 text-sm" style={{ color: contentText }}>
                {links.map((l) => <li key={l}><a href="#" className="hover:opacity-70 transition-opacity">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: contentLine, color: contentMuted }}>
          <span>© 2026 EventSphere Pro. Built for the DevHatch Labs portfolio.</span>
          <span className="es-mono">ES-10293 · AI Summit 2026</span>
        </div>
      </footer>

      {/* ---------------- AUTH MODAL ---------------- */}
      <Modal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title={authMode === "register" ? "Create your account" : "Log in"}
        dark={dark}
      >
        <AuthForm
          mode={authMode}
          dark={dark}
          onSwitchMode={() => setAuthMode((m) => (m === "register" ? "login" : "register"))}
          onSubmit={async (values) => {
            if (authMode === "register") {
              const u = await register(values.name.trim(), values.email.trim(), values.password, values.role);
              addToast("success", `Welcome, ${u.name}! Your account was created.`);
            } else {
              const u = await login(values.email.trim(), values.password);
              addToast("success", `Welcome back, ${u.name}.`);
            }
            setAuthOpen(false);
          }}
        />
      </Modal>

      {/* ---------------- CREATE EVENT MODAL ---------------- */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a new event" dark={dark}>
        <CreateEventForm categories={categories} onSubmit={handleCreateEvent} dark={dark} />
      </Modal>

      {/* ---------------- SHORTCUTS MODAL ---------------- */}
      <Modal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard shortcuts" dark={dark}>
        <div className="flex flex-col gap-3">
          {SHORTCUTS.map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span style={{ color: dark ? "#C7C9D1" : PALETTE.slate }}>{desc}</span>
              <kbd className="es-mono text-xs px-2 py-1 rounded-md border" style={{ borderColor: dark ? PALETTE.lineDark : PALETTE.line, color: dark ? PALETTE.gold : "#7A5A17" }}>{key}</kbd>
            </div>
          ))}
        </div>
      </Modal>

      {/* ---------------- LIGHTBOX ---------------- */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Photo viewer">
          <div className="absolute inset-0 bg-black/80" onClick={() => setLightboxIndex(null)} />
          <div className="es-pop relative max-w-2xl w-full">
            <button
              aria-label="Close photo viewer"
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="rounded-2xl overflow-hidden aspect-video">
              <img
                src={GALLERY[lightboxIndex].photo}
                alt={GALLERY[lightboxIndex].caption}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = GALLERY[lightboxIndex].img; }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <button
                aria-label="Previous photo"
                onClick={() => setLightboxIndex((i) => (i - 1 + GALLERY.length) % GALLERY.length)}
                className="text-white/80 hover:text-white flex items-center gap-1 text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-white/70 text-sm">{GALLERY[lightboxIndex].caption} · {lightboxIndex + 1}/{GALLERY.length}</span>
              <button
                aria-label="Next photo"
                onClick={() => setLightboxIndex((i) => (i + 1) % GALLERY.length)}
                className="text-white/80 hover:text-white flex items-center gap-1 text-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
