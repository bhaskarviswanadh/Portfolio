/**
 * CustomCursor — premium dot-plus-ring cursor
 *
 * Architecture:
 *  • Inner dot  (5 px)  — snaps to raw mouse coords instantly via RAF
 *  • Outer ring (32 px) — smooth lag follower (10 % ease per frame)
 *
 * States:
 *  "default"  — ring 32px circle, dot 5px white
 *  "text"     — ring 24px, dot same  (subtly smaller while reading)
 *  "link"     — ring 46px rounded-rect, faint teal fill, brighter border
 *  "clicking" — ring contracts to 28px, ripple emitted via CSS class
 *
 * Visibility guarantee:
 *  Dot = white (#fff) + teal box-shadow glow.
 *  Works on void-black bg, teal text, muted-grey text — always visible.
 *  Ring has a faint dark drop-shadow so it reads against the dark bg.
 *
 * Performance:
 *  transform-only updates via RAF — zero layout thrash.
 *  CSS handles all animations (ripple, dot-ping).
 *  No blend modes, no weird icons, no mix-mode weirdness.
 */

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Selectors ──────────────────────────────────────────────── */
const SEL_LINK =
  'a, button, [role="button"], input, textarea, select, label, summary, ' +
  '[tabindex]:not([tabindex="-1"]), .cursor-pointer';

const SEL_TEXT =
  "p, h1, h2, h3, h4, h5, h6, li, pre, code, blockquote, span, strong, em";

/* ─── Types ──────────────────────────────────────────────────── */
type Mode = "default" | "text" | "link" | "clicking";

interface Ripple {
  id:   number;
  x:    number;
  y:    number;
}

let uid = 0;

/* ─── Geometry per mode ──────────────────────────────────────── */
const RING: Record<Mode, { size: number; radius: string; borderColor: string; bg: string; shadow: string }> = {
  default: {
    size:        32,
    radius:      "50%",
    borderColor: "rgba(45,212,191,0.55)",
    bg:          "transparent",
    shadow:      "0 0 0 0.5px rgba(0,0,0,0.5), 0 0 8px rgba(45,212,191,0.15)",
  },
  text: {
    size:        24,
    radius:      "50%",
    borderColor: "rgba(45,212,191,0.4)",
    bg:          "transparent",
    shadow:      "0 0 0 0.5px rgba(0,0,0,0.5)",
  },
  link: {
    size:        46,
    radius:      "10px",
    borderColor: "rgba(45,212,191,0.85)",
    bg:          "rgba(45,212,191,0.05)",
    shadow:      "0 0 0 0.5px rgba(0,0,0,0.4), 0 0 18px rgba(45,212,191,0.3)",
  },
  clicking: {
    size:        28,
    radius:      "50%",
    borderColor: "rgba(45,212,191,1)",
    bg:          "transparent",
    shadow:      "0 0 0 0.5px rgba(0,0,0,0.5), 0 0 20px rgba(45,212,191,0.5)",
  },
};

const DOT_SIZE: Record<Mode, number> = {
  default: 5,
  text:    5,
  link:    4,
  clicking:6,
};

/* ─── Component ──────────────────────────────────────────────── */
export default function CustomCursor() {
  /* Never render on touch devices */
  const isTouch = typeof window !== "undefined"
    ? window.matchMedia("(pointer: coarse)").matches
    : false;

  const [visible, setVisible] = useState(false);
  const [mode,    setMode]    = useState<Mode>("default");
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [dotPing, setDotPing] = useState(false);

  /* Position refs — no state, mutated every RAF */
  const raw      = useRef({ x: -300, y: -300 });
  const follower = useRef({ x: -300, y: -300 });

  /* DOM refs — transform applied directly for zero-repaint */
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const rafId       = useRef(0);
  const isDown      = useRef(false);
  const prevMode    = useRef<Mode>("default");

  /* ── Mode resolver ───────────────────────────────────────── */
  const resolveMode = useCallback((x: number, y: number): Mode => {
    if (isDown.current) return "clicking";
    const el = document.elementFromPoint(x, y);
    if (!el) return "default";
    if (el.closest(SEL_LINK)) return "link";
    if (el.closest(SEL_TEXT)) return "text";
    return "default";
  }, []);

  /* ── Mouse handlers ──────────────────────────────────────── */
  const onMove = useCallback((e: MouseEvent) => {
    raw.current = { x: e.clientX, y: e.clientY };
    if (!visible) setVisible(true);

    const next = resolveMode(e.clientX, e.clientY);
    if (next !== prevMode.current) {
      prevMode.current = next;
      setMode(next);
    }
  }, [visible, resolveMode]);

  const onDown = useCallback((e: MouseEvent) => {
    isDown.current = true;
    prevMode.current = "clicking";
    setMode("clicking");

    /* Dot ping animation */
    setDotPing(false);
    requestAnimationFrame(() => setDotPing(true));
    setTimeout(() => setDotPing(false), 320);

    /* Emit ripple */
    const r: Ripple = { id: uid++, x: e.clientX, y: e.clientY };
    setRipples(prev => [...prev.slice(-4), r]);
    /* Auto-remove after animation finishes */
    setTimeout(() => {
      setRipples(prev => prev.filter(p => p.id !== r.id));
    }, 620);
  }, []);

  const onUp = useCallback((e: MouseEvent) => {
    isDown.current = false;
    const next = resolveMode(e.clientX, e.clientY);
    prevMode.current = next;
    setMode(next);
  }, [resolveMode]);

  /* ── RAF animation loop ──────────────────────────────────── */
  const tick = useCallback(() => {
    /* Outer ring eases toward raw position (magnetic lag) */
    follower.current.x += (raw.current.x - follower.current.x) * 0.1;
    follower.current.y += (raw.current.y - follower.current.y) * 0.1;

    if (dotRef.current) {
      dotRef.current.style.transform =
        `translate(${raw.current.x}px, ${raw.current.y}px)`;
    }
    if (ringRef.current) {
      ringRef.current.style.transform =
        `translate(${follower.current.x}px, ${follower.current.y}px)`;
    }

    rafId.current = requestAnimationFrame(tick);
  }, []);

  /* ── Lifecycle ───────────────────────────────────────────── */
  useEffect(() => {
    if (isTouch) return;

    document.addEventListener("mousemove",  onMove,  { passive: true });
    document.addEventListener("mousedown",  onDown);
    document.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseleave", () => setVisible(false));
    document.addEventListener("mouseenter", () => setVisible(true));

    rafId.current = requestAnimationFrame(tick);
    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
      cancelAnimationFrame(rafId.current);
      document.body.style.cursor = "";
    };
  }, [isTouch, onMove, onDown, onUp, tick]);

  /* Touch bail-out */
  if (isTouch) return null;

  /* ── Derived geometry ────────────────────────────────────── */
  const ring    = RING[mode];
  const dotSize = DOT_SIZE[mode];

  return (
    <>
      {/* ── Click ripples — CSS-animated, no RAF ────────────── */}
      {ripples.map(r => (
        <div
          key={r.id}
          className="cursor-ripple"
          style={{
            position:     "fixed",
            top:          r.y - 22,
            left:         r.x - 22,
            width:        44,
            height:       44,
            borderRadius: "50%",
            border:       "1.5px solid rgba(45,212,191,0.7)",
            pointerEvents:"none",
            zIndex:       99995,
          }}
        />
      ))}

      {/* ── Outer ring — smooth follower ─────────────────────── */}
      <div
        ref={ringRef}
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          width:        ring.size,
          height:       ring.size,
          /* Centre on cursor */
          marginLeft:   -ring.size / 2,
          marginTop:    -ring.size / 2,
          borderRadius: ring.radius,
          border:       `1.5px solid ${ring.borderColor}`,
          background:   ring.bg,
          boxShadow:    ring.shadow,
          pointerEvents:"none",
          zIndex:       99998,
          opacity:      visible ? 1 : 0,
          /*
           * Spring-style transitions on geometry.
           * transform is NOT transitioned — that's handled by RAF.
           */
          transition:
            "width 220ms cubic-bezier(0.34,1.56,0.64,1)," +
            "height 220ms cubic-bezier(0.34,1.56,0.64,1)," +
            "margin 220ms cubic-bezier(0.34,1.56,0.64,1)," +
            "border-radius 200ms ease," +
            "border-color 150ms ease," +
            "background 200ms ease," +
            "box-shadow 150ms ease," +
            "opacity 250ms ease",
          willChange: "transform, width, height",
        }}
      />

      {/* ── Inner dot — instant, always visible ──────────────── */}
      {/*
       * White fill + teal glow = visible on void-black, graphite,
       * teal accent text (#2dd4bf), muted grey text — everywhere.
       * No blend modes, no hacks.
       */}
      <div
        ref={dotRef}
        className={dotPing ? "cursor-dot-ping" : undefined}
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          width:        dotSize,
          height:       dotSize,
          marginLeft:   -dotSize / 2,
          marginTop:    -dotSize / 2,
          borderRadius: "50%",
          /* White core, teal halo — visible on any bg */
          background:   "#ffffff",
          boxShadow:
            "0 0 0 1.5px rgba(45,212,191,0.8)," +   /* teal ring  */
            "0 0 10px rgba(45,212,191,0.65),"  +    /* teal glow  */
            "0 0 2px rgba(0,0,0,0.6)",              /* dark shadow for dark bg */
          pointerEvents:"none",
          zIndex:       99999,
          opacity:      visible ? 1 : 0,
          transition:
            "width 140ms ease," +
            "height 140ms ease," +
            "margin 140ms ease," +
            "opacity 250ms ease",
          willChange: "transform",
        }}
      />
    </>
  );
}
