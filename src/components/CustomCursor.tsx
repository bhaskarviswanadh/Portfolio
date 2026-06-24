/**
 * CustomCursor — Terminal Targeting Reticle
 *
 * 3-layer architecture:
 *  1. Aura       — 160px soft radial glow, slowest follow (5% ease)
 *  2. Reticle    — 4 corner L-brackets, medium follow (11% ease)
 *  3. Dot        — 5px sharp dot, instant (raw coords)
 *
 * States:
 *  idle     → brackets 50px apart, dim teal
 *  text     → brackets spread wider (58px), giving text room to breathe
 *  link     → brackets converge (36px), bright + "lock-on" glow
 *  clicking → brackets snap tight (28px) + CSS ripple bursts out
 *
 * Visibility: reticle wraps OUTSIDE content (not over it),
 * so it reads clearly on any background or text color.
 * Center dot is white + teal shadow = visible everywhere.
 */

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Selectors ──────────────────────────────────────────────── */
const SEL_LINK =
  'a, button, [role="button"], input, textarea, select, label, summary, ' +
  '[tabindex]:not([tabindex="-1"]), .cursor-pointer';

const SEL_TEXT =
  "p, h1, h2, h3, h4, h5, h6, li, pre, code, blockquote";

/* ─── Types ──────────────────────────────────────────────────── */
type Mode = "idle" | "text" | "link" | "clicking";

interface Ripple { id: number; x: number; y: number; }

let uid = 0;

/* ─── Per-state config ───────────────────────────────────────── */
const CFG: Record<Mode, {
  bracketGap:  number;   /* gap between opposing brackets */
  bracketSize: number;   /* L-arm length in px */
  weight:      string;   /* border width */
  color:       string;   /* bracket color */
  auraScale:   number;   /* aura radial opacity multiplier */
}> = {
  idle: {
    bracketGap:  50,
    bracketSize: 12,
    weight:      "1.5px",
    color:       "rgba(45,212,191,0.65)",
    auraScale:   1,
  },
  text: {
    bracketGap:  58,    /* wider — frames the text being read */
    bracketSize: 10,
    weight:      "1.5px",
    color:       "rgba(45,212,191,0.45)",
    auraScale:   0.7,
  },
  link: {
    bracketGap:  36,    /* converge inward — "locking on" */
    bracketSize: 13,
    weight:      "2px",
    color:       "rgba(45,212,191,1)",
    auraScale:   2.2,
  },
  clicking: {
    bracketGap:  28,    /* snap closed on click */
    bracketSize: 13,
    weight:      "2px",
    color:       "rgba(45,212,191,1)",
    auraScale:   3,
  },
};

/* ─── Component ──────────────────────────────────────────────── */
export default function CustomCursor() {
  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  const [visible,  setVisible]  = useState(false);
  const [mode,     setMode]     = useState<Mode>("idle");
  const [ripples,  setRipples]  = useState<Ripple[]>([]);

  /* Position accumulators */
  const rawPos     = useRef({ x: -400, y: -400 });
  const reticlePos = useRef({ x: -400, y: -400 });
  const auraPos    = useRef({ x: -400, y: -400 });

  /* DOM refs — driven by RAF, zero React re-renders for motion */
  const dotEl     = useRef<HTMLDivElement>(null);
  const reticleEl = useRef<HTMLDivElement>(null);
  const auraEl    = useRef<HTMLDivElement>(null);

  const rafId    = useRef(0);
  const isDown   = useRef(false);
  const prevMode = useRef<Mode>("idle");

  /* ── Mode resolver ───────────────────────────────────────── */
  const resolveMode = useCallback(
    (x: number, y: number): Mode => {
      if (isDown.current) return "clicking";
      const el = document.elementFromPoint(x, y);
      if (!el) return "idle";
      if (el.closest(SEL_LINK)) return "link";
      if (el.closest(SEL_TEXT)) return "text";
      return "idle";
    },
    []
  );

  /* ── Mouse handlers ──────────────────────────────────────── */
  const onMove = useCallback(
    (e: MouseEvent) => {
      rawPos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const next = resolveMode(e.clientX, e.clientY);
      if (next !== prevMode.current) {
        prevMode.current = next;
        setMode(next);
      }
    },
    [visible, resolveMode]
  );

  const onDown = useCallback(
    (e: MouseEvent) => {
      isDown.current = true;
      prevMode.current = "clicking";
      setMode("clicking");

      /* Fire ripple — CSS animates it, setTimeout cleans it up */
      const r: Ripple = { id: uid++, x: e.clientX, y: e.clientY };
      setRipples((prev) => [...prev.slice(-4), r]);
      setTimeout(
        () => setRipples((prev) => prev.filter((p) => p.id !== r.id)),
        680
      );
    },
    []
  );

  const onUp = useCallback(
    (e: MouseEvent) => {
      isDown.current = false;
      const next = resolveMode(e.clientX, e.clientY);
      prevMode.current = next;
      setMode(next);
    },
    [resolveMode]
  );

  /* ── RAF loop ────────────────────────────────────────────── */
  const tick = useCallback(() => {
    /* Reticle: 11 % ease — snappy but smooth */
    reticlePos.current.x +=
      (rawPos.current.x - reticlePos.current.x) * 0.11;
    reticlePos.current.y +=
      (rawPos.current.y - reticlePos.current.y) * 0.11;

    /* Aura: 5 % ease — dreamy trail */
    auraPos.current.x +=
      (rawPos.current.x - auraPos.current.x) * 0.05;
    auraPos.current.y +=
      (rawPos.current.y - auraPos.current.y) * 0.05;

    if (dotEl.current) {
      dotEl.current.style.transform =
        `translate(${rawPos.current.x}px, ${rawPos.current.y}px)`;
    }
    if (reticleEl.current) {
      reticleEl.current.style.transform =
        `translate(${reticlePos.current.x}px, ${reticlePos.current.y}px)`;
    }
    if (auraEl.current) {
      auraEl.current.style.transform =
        `translate(${auraPos.current.x}px, ${auraPos.current.y}px)`;
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

  if (isTouch) return null;

  /* ── Derived values ──────────────────────────────────────── */
  const { bracketGap, bracketSize, weight, color, auraScale } = CFG[mode];
  const half    = bracketGap / 2;
  const bracket = `${weight} solid ${color}`;

  /* drop-shadow creates true outer glow on non-rectangular shapes */
  const reticleFilter =
    mode === "link" || mode === "clicking"
      ? "drop-shadow(0 0 5px rgba(45,212,191,0.9)) drop-shadow(0 0 12px rgba(45,212,191,0.4))"
      : "drop-shadow(0 0 3px rgba(45,212,191,0.3))";

  return (
    <>
      {/* ── Click ripples — CSS keyframe, zero RAF overhead ───── */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="cursor-ripple"
          style={{
            position:     "fixed",
            top:          r.y - 26,
            left:         r.x - 26,
            width:        52,
            height:       52,
            borderRadius: "50%",
            border:       "1.5px solid rgba(45,212,191,0.85)",
            pointerEvents:"none",
            zIndex:       99994,
          }}
        />
      ))}

      {/* ── Aura — soft radial glow, floats behind everything ─── */}
      <div
        ref={auraEl}
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          width:        180,
          height:       180,
          marginLeft:   -90,
          marginTop:    -90,
          borderRadius: "50%",
          background:   `radial-gradient(circle, rgba(45,212,191,${0.055 * auraScale}) 0%, rgba(45,212,191,${0.02 * auraScale}) 40%, transparent 70%)`,
          pointerEvents:"none",
          zIndex:       99995,
          opacity:      visible ? 1 : 0,
          transition:   "opacity 300ms ease, background 250ms ease",
          willChange:   "transform",
        }}
      />

      {/* ── Reticle — 4 corner L-brackets ─────────────────────── */}
      {/*
       * The wrapper div is sized to bracketGap × bracketGap and
       * centred on the cursor. Each corner span is positioned
       * in its corner using absolute coords. The wrapper's
       * CSS size/margin transitions handle the convergence
       * animation; the transform is driven by RAF separately.
       */}
      <div
        ref={reticleEl}
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          width:        bracketGap,
          height:       bracketGap,
          marginLeft:   -half,
          marginTop:    -half,
          pointerEvents:"none",
          zIndex:       99998,
          opacity:      visible ? 1 : 0,
          filter:       reticleFilter,
          transition:
            "width 260ms cubic-bezier(0.34,1.56,0.64,1)," +
            "height 260ms cubic-bezier(0.34,1.56,0.64,1)," +
            "margin 260ms cubic-bezier(0.34,1.56,0.64,1)," +
            "filter 180ms ease," +
            "opacity 260ms ease",
          willChange: "transform, width, height",
        }}
      >
        {/* ┌ top-left */}
        <span style={{
          position:    "absolute",
          top:         0, left: 0,
          width:       bracketSize,
          height:      bracketSize,
          borderTop:   bracket,
          borderLeft:  bracket,
          transition:  "width 260ms cubic-bezier(0.34,1.56,0.64,1), height 260ms cubic-bezier(0.34,1.56,0.64,1), border-color 180ms ease, border-width 180ms ease",
        }} />

        {/* ┐ top-right */}
        <span style={{
          position:    "absolute",
          top:         0, right: 0,
          width:       bracketSize,
          height:      bracketSize,
          borderTop:   bracket,
          borderRight: bracket,
          transition:  "width 260ms cubic-bezier(0.34,1.56,0.64,1), height 260ms cubic-bezier(0.34,1.56,0.64,1), border-color 180ms ease, border-width 180ms ease",
        }} />

        {/* └ bottom-left */}
        <span style={{
          position:       "absolute",
          bottom:         0, left: 0,
          width:          bracketSize,
          height:         bracketSize,
          borderBottom:   bracket,
          borderLeft:     bracket,
          transition:     "width 260ms cubic-bezier(0.34,1.56,0.64,1), height 260ms cubic-bezier(0.34,1.56,0.64,1), border-color 180ms ease, border-width 180ms ease",
        }} />

        {/* ┘ bottom-right */}
        <span style={{
          position:       "absolute",
          bottom:         0, right: 0,
          width:          bracketSize,
          height:         bracketSize,
          borderBottom:   bracket,
          borderRight:    bracket,
          transition:     "width 260ms cubic-bezier(0.34,1.56,0.64,1), height 260ms cubic-bezier(0.34,1.56,0.64,1), border-color 180ms ease, border-width 180ms ease",
        }} />
      </div>

      {/* ── Center dot — white + teal shadow = always visible ──── */}
      {/*
       * White fill reads clearly on:
       *  - void-black background (#0d0e11) ✓
       *  - teal accent text (#2dd4bf)      ✓
       *  - muted grey text (#8b909c)       ✓
       *  - bright white headings (#fff)    ✓ (teal ring contrasts)
       * No blend-mode tricks needed.
       */}
      <div
        ref={dotEl}
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          width:        5,
          height:       5,
          marginLeft:   -2.5,
          marginTop:    -2.5,
          borderRadius: "50%",
          background:   "#ffffff",
          boxShadow:
            `0 0 0 1.5px ${color},` +           /* teal ring matches state */
            "0 0 10px rgba(45,212,191,0.75)," + /* teal outer glow */
            "0 0 2px rgba(0,0,0,0.6)",           /* dark halo for bg contrast */
          pointerEvents:"none",
          zIndex:       99999,
          opacity:      visible ? 1 : 0,
          transition:
            "opacity 260ms ease," +
            "box-shadow 150ms ease",
          willChange: "transform",
        }}
      />
    </>
  );
}
