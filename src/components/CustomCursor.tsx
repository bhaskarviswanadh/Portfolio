/**
 * CustomCursor — Terminal Targeting Reticle v4
 *
 * What changed from v3:
 *  - Brackets → BRIGHT WHITE (#fff, 0.88 opacity)
 *    White reads on void-black, graphite cards, teal text, muted grey — everywhere.
 *    The teal identity is preserved as the glow / aura / dot ring.
 *  - Glow → dual drop-shadow: white blur + teal bloom
 *    This creates a "neon edge on black" feel that's unmistakably visible.
 *  - Text mode → MAGNIFIER LENS
 *    A separate backdrop-filter div sits inside the bracket zone and
 *    applies brightness(1.4) + saturate(1.2) to content underneath.
 *    No overflow tricks needed — backdrop-filter on a fixed sibling works natively.
 *  - Aura → stronger on link (2.5×), gentle on idle/text
 *  - Bracket arms → 14px (was 12px) for better presence
 *
 * 4-layer render order (z-index ascending):
 *  99994 ripples | 99995 aura | 99996 lens | 99998 brackets | 99999 dot
 */

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Selectors ──────────────────────────────────────────────── */
const SEL_LINK =
  'a, button, [role="button"], input, textarea, select, label, summary,' +
  '[tabindex]:not([tabindex="-1"]), .cursor-pointer';
const SEL_TEXT = "p, h1, h2, h3, h4, h5, h6, li, pre, code, blockquote";

/* ─── Types ──────────────────────────────────────────────────── */
type Mode = "idle" | "text" | "link" | "clicking";
interface Ripple { id: number; x: number; y: number; }
let uid = 0;

/* ─────────────────────────────────────────────────────────────
 * Per-mode visual config
 * bracketColor → always bright white for max visibility on any bg
 * filter       → white blur + teal glow = dual-layer visibility
 * ─────────────────────────────────────────────────────────────*/
const CFG: Record<Mode, {
  gap:         number;
  armSize:     number;
  bracketColor:string;
  lineWidth:   string;
  filter:      string;
  auraOpacity: number;
  lensActive:  boolean;
}> = {
  idle: {
    gap:          50,
    armSize:      14,
    bracketColor: "rgba(255,255,255,0.82)",
    lineWidth:    "1.5px",
    filter:
      "drop-shadow(0 0 4px rgba(255,255,255,0.5))" +
      " drop-shadow(0 0 8px rgba(45,212,191,0.55))",
    auraOpacity:  0.07,
    lensActive:   false,
  },
  text: {
    gap:          60,           /* wider bracket → frames text naturally */
    armSize:      12,
    bracketColor: "rgba(255,255,255,0.72)",
    lineWidth:    "1.5px",
    filter:
      "drop-shadow(0 0 3px rgba(255,255,255,0.4))" +
      " drop-shadow(0 0 6px rgba(45,212,191,0.35))",
    auraOpacity:  0.04,
    lensActive:   true,          /* 🔍 magnifier on text */
  },
  link: {
    gap:          36,           /* converge = "locking on" */
    armSize:      15,
    bracketColor: "rgba(255,255,255,0.95)",
    lineWidth:    "2px",
    filter:
      "drop-shadow(0 0 6px rgba(255,255,255,0.8))" +
      " drop-shadow(0 0 16px rgba(45,212,191,0.9))" +
      " drop-shadow(0 0 30px rgba(45,212,191,0.4))",
    auraOpacity:  0.22,
    lensActive:   false,
  },
  clicking: {
    gap:          28,
    armSize:      15,
    bracketColor: "rgba(255,255,255,1)",
    lineWidth:    "2px",
    filter:
      "drop-shadow(0 0 8px rgba(255,255,255,1))" +
      " drop-shadow(0 0 18px rgba(45,212,191,1))" +
      " drop-shadow(0 0 36px rgba(45,212,191,0.5))",
    auraOpacity:  0.35,
    lensActive:   false,
  },
};

/* ─── Component ──────────────────────────────────────────────── */
export default function CustomCursor() {
  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  const [visible, setVisible] = useState(false);
  const [mode,    setMode]    = useState<Mode>("idle");
  const [ripples, setRipples] = useState<Ripple[]>([]);

  /* Position accumulators */
  const rawPos    = useRef({ x: -400, y: -400 });
  const slowPos   = useRef({ x: -400, y: -400 }); /* reticle + lens */
  const auraPos   = useRef({ x: -400, y: -400 }); /* aura (slowest) */

  /* DOM refs — RAF-driven transforms, zero re-renders */
  const dotEl      = useRef<HTMLDivElement>(null);
  const reticleEl  = useRef<HTMLDivElement>(null);
  const lensEl     = useRef<HTMLDivElement>(null);
  const auraEl     = useRef<HTMLDivElement>(null);

  const rafId    = useRef(0);
  const isDown   = useRef(false);
  const prevMode = useRef<Mode>("idle");

  /* ── Resolve cursor state from element under pointer ─────── */
  const resolveMode = useCallback((x: number, y: number): Mode => {
    if (isDown.current) return "clicking";
    const el = document.elementFromPoint(x, y);
    if (!el) return "idle";
    if (el.closest(SEL_LINK)) return "link";
    if (el.closest(SEL_TEXT)) return "text";
    return "idle";
  }, []);

  /* ── Mouse events ────────────────────────────────────────── */
  const onMove = useCallback((e: MouseEvent) => {
    rawPos.current = { x: e.clientX, y: e.clientY };
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
    const r: Ripple = { id: uid++, x: e.clientX, y: e.clientY };
    setRipples(p => [...p.slice(-4), r]);
    setTimeout(() => setRipples(p => p.filter(x => x.id !== r.id)), 680);
  }, []);

  const onUp = useCallback((e: MouseEvent) => {
    isDown.current = false;
    const next = resolveMode(e.clientX, e.clientY);
    prevMode.current = next;
    setMode(next);
  }, [resolveMode]);

  /* ── RAF loop — position only, no state changes ──────────── */
  const tick = useCallback(() => {
    /* Reticle / lens: 11 % ease — quick but smooth */
    slowPos.current.x += (rawPos.current.x - slowPos.current.x) * 0.11;
    slowPos.current.y += (rawPos.current.y - slowPos.current.y) * 0.11;

    /* Aura: 5 % ease — floats lazily behind */
    auraPos.current.x += (rawPos.current.x - auraPos.current.x) * 0.05;
    auraPos.current.y += (rawPos.current.y - auraPos.current.y) * 0.05;

    if (dotEl.current)
      dotEl.current.style.transform =
        `translate(${rawPos.current.x}px,${rawPos.current.y}px)`;

    if (reticleEl.current)
      reticleEl.current.style.transform =
        `translate(${slowPos.current.x}px,${slowPos.current.y}px)`;

    if (lensEl.current)
      lensEl.current.style.transform =
        `translate(${slowPos.current.x}px,${slowPos.current.y}px)`;

    if (auraEl.current)
      auraEl.current.style.transform =
        `translate(${auraPos.current.x}px,${auraPos.current.y}px)`;

    rafId.current = requestAnimationFrame(tick);
  }, []);

  /* ── Lifecycle ───────────────────────────────────────────── */
  useEffect(() => {
    if (isTouch) return;
    document.addEventListener("mousemove",  onMove, { passive: true });
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

  const { gap, armSize, bracketColor, lineWidth, filter, auraOpacity, lensActive } = CFG[mode];
  const half = gap / 2;
  const arm  = `${lineWidth} solid ${bracketColor}`;

  return (
    <>
      {/* ── Ripples (CSS-animated, zero RAF) ─────────────────── */}
      {ripples.map(r => (
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
            border:       "1.5px solid rgba(255,255,255,0.7)",
            boxShadow:    "0 0 8px rgba(45,212,191,0.5)",
            pointerEvents:"none",
            zIndex:       99994,
          }}
        />
      ))}

      {/* ── Aura — teal radial bloom, laziest follower ─────────── */}
      <div
        ref={auraEl}
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          width:        200,
          height:       200,
          marginLeft:   -100,
          marginTop:    -100,
          borderRadius: "50%",
          background:   `radial-gradient(circle, rgba(45,212,191,${auraOpacity}) 0%, rgba(45,212,191,${auraOpacity * 0.35}) 45%, transparent 70%)`,
          pointerEvents:"none",
          zIndex:       99995,
          opacity:      visible ? 1 : 0,
          transition:   "opacity 300ms ease, background 220ms ease",
          willChange:   "transform",
        }}
      />

      {/* ── Magnifier lens — backdrop-filter on text ──────────── */}
      {/*
       * This is a SEPARATE element from the brackets so that
       * backdrop-filter doesn't interfere with will-change:transform.
       * When lensActive, it brightens + saturates the text underneath,
       * creating a "reading lens / magnifier" feel.
       *
       * Key: this element must NOT have will-change:transform set,
       * otherwise backdrop-filter won't composite correctly.
       */}
      <div
        ref={lensEl}
        style={{
          position:       "fixed",
          top:            0,
          left:           0,
          width:          gap,
          height:         gap,
          marginLeft:     -half,
          marginTop:      -half,
          borderRadius:   "2px",
          backdropFilter: lensActive
            ? "brightness(1.45) saturate(1.25) contrast(1.05)"
            : "none",
          background:     lensActive
            ? "rgba(45,212,191,0.025)"   /* faint teal tint = scanner feel */
            : "transparent",
          pointerEvents:  "none",
          zIndex:         99996,
          opacity:        visible ? 1 : 0,
          transition:
            "backdropFilter 200ms ease," +
            "background 200ms ease," +
            "width 260ms cubic-bezier(0.34,1.56,0.64,1)," +
            "height 260ms cubic-bezier(0.34,1.56,0.64,1)," +
            "margin 260ms cubic-bezier(0.34,1.56,0.64,1)," +
            "opacity 300ms ease",
          /* NO willChange here — backdrop-filter requires natural compositing */
        }}
      />

      {/* ── Bracket reticle — white arms, teal+white glow ──────── */}
      <div
        ref={reticleEl}
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          width:        gap,
          height:       gap,
          marginLeft:   -half,
          marginTop:    -half,
          pointerEvents:"none",
          zIndex:       99998,
          opacity:      visible ? 1 : 0,
          filter:       filter,
          transition:
            "width 260ms cubic-bezier(0.34,1.56,0.64,1)," +
            "height 260ms cubic-bezier(0.34,1.56,0.64,1)," +
            "margin 260ms cubic-bezier(0.34,1.56,0.64,1)," +
            "filter 200ms ease," +
            "opacity 260ms ease",
          willChange: "transform, width, height",
        }}
      >
        {/* ┌ */}
        <span style={{ position:"absolute", top:0,    left:0,  width:armSize, height:armSize, borderTop:arm, borderLeft:arm,
          transition:"width 260ms cubic-bezier(0.34,1.56,0.64,1),height 260ms cubic-bezier(0.34,1.56,0.64,1),border-color 180ms ease,border-width 180ms ease"
        }} />
        {/* ┐ */}
        <span style={{ position:"absolute", top:0,    right:0, width:armSize, height:armSize, borderTop:arm, borderRight:arm,
          transition:"width 260ms cubic-bezier(0.34,1.56,0.64,1),height 260ms cubic-bezier(0.34,1.56,0.64,1),border-color 180ms ease,border-width 180ms ease"
        }} />
        {/* └ */}
        <span style={{ position:"absolute", bottom:0, left:0,  width:armSize, height:armSize, borderBottom:arm, borderLeft:arm,
          transition:"width 260ms cubic-bezier(0.34,1.56,0.64,1),height 260ms cubic-bezier(0.34,1.56,0.64,1),border-color 180ms ease,border-width 180ms ease"
        }} />
        {/* ┘ */}
        <span style={{ position:"absolute", bottom:0, right:0, width:armSize, height:armSize, borderBottom:arm, borderRight:arm,
          transition:"width 260ms cubic-bezier(0.34,1.56,0.64,1),height 260ms cubic-bezier(0.34,1.56,0.64,1),border-color 180ms ease,border-width 180ms ease"
        }} />
      </div>

      {/* ── Center dot — white core, teal ring + glow ──────────── */}
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
            "0 0 0 1.5px rgba(45,212,191,0.9)," +  /* teal ring */
            "0 0 8px  rgba(45,212,191,0.8),"  +     /* teal glow */
            "0 0 16px rgba(45,212,191,0.35)," +     /* teal bloom */
            "0 0 2px  rgba(0,0,0,0.5)",             /* dark halo */
          pointerEvents:"none",
          zIndex:       99999,
          opacity:      visible ? 1 : 0,
          transition:   "opacity 260ms ease",
          willChange:   "transform",
        }}
      />
    </>
  );
}
