import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from "react";
import {
  Ticket, QrCode, MapPin, Users, ShieldCheck, TrendingUp,
  Search, SlidersHorizontal, Wallet, BadgeCheck, ScanLine, ArrowRight,
  Star, Clock, Sun, Moon, CheckCircle2, BarChart3, UserCog, CalendarCheck2,
  Menu, X, Heart, Printer, Info, AlertTriangle, Loader2, Image as ImageIcon,
  ChevronLeft, ChevronRight, Keyboard,
} from "lucide-react";

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

const EVENTS = [
  { id: "e1", title: "AI Summit 2026", category: "Conferences", date: "Sat, 14 Mar · 9:00 AM", venue: "Expo Center, Lahore", price: "PKR 4,500", seatsLeft: 80, seatsTotal: 200, tone: "gold" },
  { id: "e2", title: "Riverside Acoustic Night", category: "Concerts", date: "Fri, 3 Apr · 7:30 PM", venue: "Riverside Amphitheatre", price: "PKR 2,200", seatsLeft: 34, seatsTotal: 150, tone: "plum" },
  { id: "e3", title: "Product Design Workshop", category: "Workshops", date: "Sun, 12 Apr · 11:00 AM", venue: "DevHatch Labs Studio", price: "PKR 1,800", seatsLeft: 12, seatsTotal: 40, tone: "teal" },
  { id: "e4", title: "Founders' Rooftop Mixer", category: "Conferences", date: "Thu, 18 Apr · 6:00 PM", venue: "Skyline Rooftop, Karachi", price: "PKR 3,000", seatsLeft: 22, seatsTotal: 90, tone: "gold" },
  { id: "e5", title: "Indie Folk Sessions", category: "Concerts", date: "Sat, 20 Apr · 8:00 PM", venue: "The Attic, Islamabad", price: "PKR 1,500", seatsLeft: 5, seatsTotal: 60, tone: "plum" },
  { id: "e6", title: "UX Research Bootcamp", category: "Workshops", date: "Mon, 22 Apr · 10:00 AM", venue: "Innovation Hub, Lahore", price: "PKR 2,600", seatsLeft: 40, seatsTotal: 50, tone: "teal" },
  { id: "e7", title: "Zainab & Ali — Walima", category: "Weddings", date: "Sat, 27 Apr · 7:00 PM", venue: "Pearl Continental, Lahore", price: "By invite", seatsLeft: 60, seatsTotal: 400, tone: "plum" },
  { id: "e8", title: "Cloud Infra Conference", category: "Conferences", date: "Wed, 1 May · 9:00 AM", venue: "Expo Center, Lahore", price: "PKR 5,000", seatsLeft: 150, seatsTotal: 300, tone: "gold" },
  { id: "e9", title: "Sufi Night Under the Stars", category: "Concerts", date: "Fri, 3 May · 8:30 PM", venue: "Fort Garden, Multan", price: "PKR 1,900", seatsLeft: 18, seatsTotal: 120, tone: "plum" },
  { id: "e10", title: "Data Storytelling Workshop", category: "Workshops", date: "Sun, 5 May · 11:00 AM", venue: "DevHatch Labs Studio", price: "PKR 2,000", seatsLeft: 9, seatsTotal: 35, tone: "teal" },
  { id: "e11", title: "Hina & Bilal — Nikkah", category: "Weddings", date: "Sat, 11 May · 5:00 PM", venue: "Marquee Gardens, Faisalabad", price: "By invite", seatsLeft: 30, seatsTotal: 250, tone: "plum" },
  { id: "e12", title: "SaaS Growth Conference", category: "Conferences", date: "Thu, 16 May · 9:30 AM", venue: "Expo Center, Lahore", price: "PKR 4,800", seatsLeft: 65, seatsTotal: 220, tone: "gold" },
];

const GALLERY = [
  { caption: "Main stage, AI Summit 2026", from: "#D9A441", to: "#15171C" },
  { caption: "Check-in line at Expo Center", from: "#146B63", to: "#1D2027" },
  { caption: "Riverside Amphitheatre at dusk", from: "#6A2C55", to: "#15171C" },
  { caption: "Workshop breakout room", from: "#D9A441", to: "#6A2C55" },
  { caption: "Organizer scanning tickets", from: "#146B63", to: "#D9A441" },
  { caption: "Attendee lounge", from: "#6A2C55", to: "#146B63" },
  { caption: "Marquee Gardens setup", from: "#1D2027", to: "#D9A441" },
  { caption: "Post-event teardown", from: "#15171C", to: "#6A2C55" },
];

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
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: PALETTE.lineDark }}>
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
function Modal({ open, onClose, title, children }) {
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
        style={{ backgroundColor: PALETTE.inkSoft, color: PALETTE.porcelain, border: `1px solid ${PALETTE.lineDark}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="es-display text-lg font-semibold">{title}</h3>
          <button aria-label="Close dialog" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------- Create-event form (real-time validation) ---------------------------------- */
function CreateEventForm({ onSubmit }) {
  const [values, setValues] = useState({ name: "", email: "", capacity: "", date: "" });
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const e = {};
    if (!values.name.trim()) e.name = "Event name is required.";
    else if (values.name.trim().length < 3) e.name = "Use at least 3 characters.";

    if (!values.email.trim()) e.email = "Contact email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Enter a valid email address.";

    if (!values.capacity) e.capacity = "Capacity is required.";
    else if (!/^\d+$/.test(values.capacity) || Number(values.capacity) <= 0) e.capacity = "Enter a whole number greater than 0.";

    if (!values.date) e.date = "Pick a date.";
    else if (new Date(values.date) < new Date(new Date().toDateString())) e.date = "Date can't be in the past.";

    return e;
  }, [values]);

  const isValid = Object.keys(errors).length === 0;

  function field(key, label, type = "text", placeholder = "") {
    const showError = touched[key] && errors[key];
    return (
      <div className="mb-4">
        <label htmlFor={`ce-${key}`} className="text-xs font-medium mb-1.5 block" style={{ color: "#B9BBC4" }}>
          {label}
        </label>
        <input
          id={`ce-${key}`}
          type={type}
          placeholder={placeholder}
          value={values[key]}
          onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
          aria-invalid={!!showError}
          aria-describedby={showError ? `ce-${key}-err` : undefined}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none border bg-transparent"
          style={{ borderColor: showError ? PALETTE.danger : PALETTE.lineDark, color: PALETTE.porcelain }}
        />
        {showError && (
          <p id={`ce-${key}-err`} className="text-xs mt-1.5 flex items-center gap-1" style={{ color: PALETTE.danger }}>
            <AlertTriangle className="w-3 h-3" /> {errors[key]}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched({ name: true, email: true, capacity: true, date: true });
        if (isValid) { onSubmit(values); setValues({ name: "", email: "", capacity: "", date: "" }); setTouched({}); }
      }}
      noValidate
    >
      {field("name", "Event name", "text", "e.g. AI Summit 2026")}
      {field("email", "Contact email", "email", "you@organization.com")}
      {field("capacity", "Capacity", "text", "e.g. 200")}
      {field("date", "Event date", "date")}

      <button
        type="submit"
        disabled={!isValid}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-opacity"
        style={{
          backgroundColor: PALETTE.gold,
          color: PALETTE.ink,
          opacity: isValid ? 1 : 0.45,
          cursor: isValid ? "pointer" : "not-allowed",
        }}
      >
        Create event <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

/* ---------------------------------- Event card ---------------------------------- */
const EventCard = React.memo(function EventCard({ event, dark, isFavorite, onToggleFavorite }) {
  const { title, category, date, venue, price, seatsLeft, seatsTotal, tone } = event;
  const pct = Math.round((seatsLeft / seatsTotal) * 100);
  const accent = tone === "teal" ? PALETTE.teal : tone === "plum" ? PALETTE.plum : PALETTE.gold;
  const badgeBg = tone === "gold" ? PALETTE.goldSoft : tone === "teal" ? "#CFE6E2" : "#E4CBDA";
  const badgeFg = tone === "gold" ? "#7A5A17" : tone === "teal" ? PALETTE.teal : PALETTE.plum;

  return (
    <div
      className="es-card-hover relative rounded-2xl overflow-hidden border shadow-sm flex flex-col"
      style={{ borderColor: dark ? PALETTE.lineDark : PALETTE.line, backgroundColor: dark ? PALETTE.inkSoft : "#fff" }}
    >
      <div
        className="h-28 w-full flex items-center justify-between px-5"
        style={{ background: `linear-gradient(120deg, ${accent}, ${dark ? PALETTE.ink : PALETTE.inkSoft})` }}
      >
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
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
          >
            <Heart className="w-4 h-4" style={{ color: "#fff", fill: isFavorite ? "#fff" : "none" }} />
          </button>
        </Tooltip>
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
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: accent, color: tone === "gold" ? PALETTE.ink : "#fff" }}
          >
            Book now <ArrowRight className="w-3.5 h-3.5" />
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
      <div className="h-28 w-full es-skeleton" />
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

function RoleCard({ icon: Icon, title, accent, points, dark }) {
  return (
    <div
      className="es-card-hover relative rounded-2xl p-6 border flex flex-col gap-4"
      style={{ borderColor: dark ? PALETTE.lineDark : PALETTE.line, backgroundColor: dark ? PALETTE.inkSoft : "#fff" }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + "22" }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
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
  const [dark, setDark] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);
  const [navOpen, setNavOpen] = useState(false);

  const [favorites, setFavorites] = useState(() => new Set());
  const [toasts, setToasts] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [crashDemo, setCrashDemo] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

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

  // Initial page load skeleton
  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const filteredEvents = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return EVENTS.filter((ev) => {
      const matchesFilter = activeFilter === "All" || ev.category === activeFilter;
      const matchesQuery = !q || ev.title.toLowerCase().includes(q) || ev.venue.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, debouncedQuery]);

  // Brief skeleton + reset pagination whenever the result set changes
  useEffect(() => {
    setFilterLoading(true);
    setVisibleCount(6);
    const t = setTimeout(() => setFilterLoading(false), 300);
    return () => clearTimeout(t);
  }, [activeFilter, debouncedQuery]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  // Infinite scroll
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore && !filterLoading && hasMore) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((c) => Math.min(c + 3, filteredEvents.length));
          setLoadingMore(false);
        }, 600);
      }
    }, { threshold: 0.5 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [loadingMore, filterLoading, hasMore, filteredEvents.length]);

  // Global keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement && document.activeElement.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === "/" && !typing) { e.preventDefault(); searchRef.current?.focus(); }
      else if (e.key.toLowerCase() === "d" && !typing) { setDark((d) => !d); }
      else if (e.key === "?" && !typing) { setShortcutsOpen(true); }
      else if (e.key === "Escape") { setShortcutsOpen(false); setCreateOpen(false); setLightboxIndex(null); }
      else if (lightboxIndex !== null && e.key === "ArrowRight") { setLightboxIndex((i) => (i + 1) % GALLERY.length); }
      else if (lightboxIndex !== null && e.key === "ArrowLeft") { setLightboxIndex((i) => (i - 1 + GALLERY.length) % GALLERY.length); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex]);

  const filters = ["All", "Conferences", "Concerts", "Workshops", "Weddings"];

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
      <header className="es-no-print sticky top-0 z-30 es-bg-ink border-b" style={{ borderColor: PALETTE.lineDark }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg es-bg-gold flex items-center justify-center">
              <Ticket className="w-4 h-4" style={{ color: PALETTE.ink }} />
            </div>
            <span className="es-display text-lg font-semibold es-text-porcelain">
              EventSphere <span className="es-text-gold">Pro</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#C7C9D1" }} aria-label="Primary">
            <a href="#discover" className="hover:text-white transition-colors">Discover</a>
            <a href="#organizers" className="hover:text-white transition-colors">For organizers</a>
            <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
            <a href="#tickets" className="hover:text-white transition-colors">Ticketing</a>
            <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Tooltip label="Keyboard shortcuts (?)">
              <button
                aria-label="Show keyboard shortcuts"
                onClick={() => setShortcutsOpen(true)}
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hidden sm:flex"
                style={{ borderColor: PALETTE.lineDark, color: "#C7C9D1" }}
              >
                <Keyboard className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip label={dark ? "Switch to light theme (D)" : "Switch to dark theme (D)"}>
              <button
                aria-label="Toggle color theme"
                onClick={() => setDark((d) => !d)}
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors"
                style={{ borderColor: PALETTE.lineDark, color: "#C7C9D1" }}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </Tooltip>
            <button
              onClick={() => setCreateOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full es-bg-gold es-text-ink"
            >
              Create event <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              aria-label={navOpen ? "Close menu" : "Open menu"}
              className="md:hidden w-9 h-9 flex items-center justify-center text-white"
              onClick={() => setNavOpen((n) => !n)}
            >
              {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {navOpen && (
          <div className="md:hidden flex flex-col gap-4 px-5 pb-5 text-sm font-medium" style={{ color: "#C7C9D1" }}>
            <a href="#discover">Discover</a>
            <a href="#organizers">For organizers</a>
            <a href="#analytics">Analytics</a>
            <a href="#tickets">Ticketing</a>
            <a href="#gallery">Gallery</a>
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full es-bg-gold es-text-ink w-fit"
            >
              Create event <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </header>

      <main id="es-main">
        {/* ---------------- HERO ---------------- */}
        <section className="es-bg-ink pt-16 pb-20 px-5 sm:px-8 relative overflow-hidden">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <Reveal>
              <span className="es-mono text-xs tracking-[0.2em] uppercase es-text-gold">Event infrastructure, not just a listing page</span>
              <h1 className="es-display text-4xl sm:text-5xl font-bold leading-tight mt-4 es-text-porcelain">
                Sell the seat.<br />Scan the ticket.<br /><span className="es-text-gold">Own the data.</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed max-w-md" style={{ color: "#AEB1BC" }}>
                EventSphere Pro gives organizers a real backend for events — bookings, payments,
                QR check-in, and live revenue analytics — instead of a form bolted onto a calendar.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-full es-bg-gold es-text-ink"
                >
                  Start selling tickets <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#tickets"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-full border"
                  style={{ borderColor: PALETTE.lineDark, color: PALETTE.porcelain }}
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
                    style={{ borderColor: PALETTE.lineDark, color: PALETTE.porcelain }}
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
              <Reveal><RoleCard icon={UserCog} title="Admin" accent={PALETTE.plum} dark={dark}
                points={["Approve and verify organizers", "Manage categories platform-wide", "Monitor usage across every event", "Full platform analytics"]} /></Reveal>
              <Reveal><RoleCard icon={CalendarCheck2} title="Organizer" accent={PALETTE.gold} dark={dark}
                points={["Publish events with tiered ticketing", "Track bookings as they land", "Scan QR tickets at the door", "Revenue analytics per event"]} /></Reveal>
              <Reveal><RoleCard icon={Users} title="Attendee" accent={PALETTE.teal} dark={dark}
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
              onReset={() => setCrashDemo(false)}
            >
              <CrashDemo crash={crashDemo} />

              {initialLoading || filterLoading ? (
                <div className="grid md:grid-cols-3 gap-6" style={skeletonVars}>
                  {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} dark={dark} />)}
                </div>
              ) : visibleEvents.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border" style={{ borderColor: contentLine }}>
                  <Search className="w-6 h-6 mx-auto mb-3" style={{ color: contentMuted }} />
                  <p className="es-display font-semibold" style={{ color: contentText }}>No events match that search</p>
                  <p className="text-sm mt-1" style={{ color: contentMuted }}>Try a different keyword or clear the category filter.</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-6">
                    {visibleEvents.map((ev) => (
                      <EventCard key={ev.id} event={ev} dark={dark} isFavorite={favorites.has(ev.id)} onToggleFavorite={toggleFavorite} />
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
                      You've reached the end — {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} total.
                    </p>
                  )}
                </>
              )}
            </ErrorBoundary>
          </div>
        </section>

        {/* ---------------- ANALYTICS ---------------- */}
        <section id="analytics" className="es-bg-ink px-5 sm:px-8 py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <Reveal>
              <span className="es-mono text-xs tracking-[0.2em] uppercase es-text-teal">For organizers</span>
              <h2 className="es-display text-3xl font-bold mt-3 es-text-porcelain">Know what sold, and why</h2>
              <p className="mt-3 text-sm leading-relaxed max-w-md" style={{ color: "#AEB1BC" }}>
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
                    <p className="text-sm mt-1.5" style={{ color: "#C7C9D1" }}>{text}</p>
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
                  className="es-card-hover relative aspect-square rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                >
                  <ImageIcon className="w-6 h-6 text-white/70" />
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
              onClick={() => setCreateOpen(true)}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full es-bg-ink es-text-porcelain"
            >
              Create your first event <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>
        </section>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="es-no-print es-bg-ink px-5 sm:px-8 pt-12 pb-8 es-tear" style={{ borderColor: PALETTE.lineDark }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md es-bg-gold flex items-center justify-center">
                <Ticket className="w-4 h-4 es-text-ink" />
              </div>
              <span className="es-display font-semibold es-text-porcelain">EventSphere Pro</span>
            </div>
            <p className="text-sm" style={{ color: "#8B8E99" }}>Event infrastructure for organizers who sell real tickets.</p>
          </div>
          {[
            ["Product", ["Discovery", "Ticketing", "Analytics", "QR check-in"]],
            ["Organizers", ["Pricing", "Verification", "API"]],
            ["Company", ["About", "Support", "Status"]],
          ].map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "#8B8E99" }}>{heading}</p>
              <ul className="flex flex-col gap-2 text-sm" style={{ color: "#C7C9D1" }}>
                {links.map((l) => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: PALETTE.lineDark, color: "#6E717D" }}>
          <span>© 2026 EventSphere Pro. Built for the DevHatch Labs portfolio.</span>
          <span className="es-mono">ES-10293 · AI Summit 2026</span>
        </div>
      </footer>

      {/* ---------------- CREATE EVENT MODAL ---------------- */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a new event">
        <CreateEventForm
          onSubmit={(values) => {
            setCreateOpen(false);
            addToast("success", `"${values.name}" was created and is pending review`);
          }}
        />
      </Modal>

      {/* ---------------- SHORTCUTS MODAL ---------------- */}
      <Modal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard shortcuts">
        <div className="flex flex-col gap-3">
          {SHORTCUTS.map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span style={{ color: "#C7C9D1" }}>{desc}</span>
              <kbd className="es-mono text-xs px-2 py-1 rounded-md border" style={{ borderColor: PALETTE.lineDark, color: PALETTE.gold }}>{key}</kbd>
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
            <div
              className="rounded-2xl overflow-hidden aspect-video flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${GALLERY[lightboxIndex].from}, ${GALLERY[lightboxIndex].to})` }}
            >
              <ImageIcon className="w-10 h-10 text-white/70" />
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
