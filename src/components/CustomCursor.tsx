import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────────── */
interface TrailDot {
  id: number;
  x: number;
  y: number;
  alpha: number;
  scale: number;
}

/* ─── Helpers ────────────────────────────────────────────────── */
const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, [tabindex]:not([tabindex="-1"]), .cursor-pointer';

let trailId = 0;

/* ─── Component ──────────────────────────────────────────────── */
export default function CustomCursor() {
  /* Hide on touch devices */
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [trail, setTrail] = useState<TrailDot[]>([]);

  /* Raw mouse position (instant) */
  const rawPos = useRef({ x: -100, y: -100 });

  /* Smoothed positions for outer ring (lags behind = "magnetic" feel) */
  const outerPos = useRef({ x: -100, y: -100 });

  /* Inner dot (follows raw instantly) */
  const innerPos = useRef({ x: -100, y: -100 });

  /* DOM refs */
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  /* RAF handle */
  const rafRef = useRef<number>(0);

  /* Trail throttle */
  const lastTrail = useRef(0);

  /* ── Mouse move ──────────────────────────────────────────── */
  const onMouseMove = useCallback((e: MouseEvent) => {
    rawPos.current = { x: e.clientX, y: e.clientY };
    if (!visible) setVisible(true);

    /* Spawn trail dot every ~30ms */
    const now = Date.now();
    if (now - lastTrail.current > 30) {
      lastTrail.current = now;
      const dot: TrailDot = {
        id: trailId++,
        x: e.clientX,
        y: e.clientY,
        alpha: 0.55,
        scale: 1,
      };
      setTrail((prev) => [...prev.slice(-10), dot]);
    }

    /* Detect hover state */
    const el = document.elementFromPoint(e.clientX, e.clientY);
    setHovered(!!el?.closest(INTERACTIVE));
  }, [visible]);

  const onMouseDown = useCallback(() => setClicking(true), []);
  const onMouseUp   = useCallback(() => setClicking(false), []);
  const onMouseLeave = useCallback(() => setVisible(false), []);
  const onMouseEnter = useCallback(() => setVisible(true), []);

  /* ── RAF animation loop ──────────────────────────────────── */
  const animate = useCallback(() => {
    const ease = 0.1; // outer ring easing (lower = more lag = more "magnetic")

    outerPos.current.x += (rawPos.current.x - outerPos.current.x) * ease;
    outerPos.current.y += (rawPos.current.y - outerPos.current.y) * ease;
    innerPos.current.x = rawPos.current.x;
    innerPos.current.y = rawPos.current.y;

    if (outerRef.current) {
      outerRef.current.style.transform = `translate(${outerPos.current.x}px, ${outerPos.current.y}px)`;
    }
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${innerPos.current.x}px, ${innerPos.current.y}px)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  /* ── Trail fade-out ──────────────────────────────────────── */
  useEffect(() => {
    const timer = setInterval(() => {
      setTrail((prev) =>
        prev
          .map((d) => ({ ...d, alpha: d.alpha - 0.08, scale: d.scale * 0.88 }))
          .filter((d) => d.alpha > 0)
      );
    }, 30);
    return () => clearInterval(timer);
  }, []);

  /* ── Mount / unmount ─────────────────────────────────────── */
  useEffect(() => {
    /* Only enable on non-touch */
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.addEventListener("mousemove",  onMouseMove);
    document.addEventListener("mousedown",  onMouseDown);
    document.addEventListener("mouseup",    onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    rafRef.current = requestAnimationFrame(animate);

    /* Hide native cursor */
    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove",  onMouseMove);
      document.removeEventListener("mousedown",  onMouseDown);
      document.removeEventListener("mouseup",    onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(rafRef.current);
      document.body.style.cursor = "";
    };
  }, [onMouseMove, onMouseDown, onMouseUp, onMouseLeave, onMouseEnter, animate]);

  if (window.matchMedia("(pointer: coarse)").matches) return null;

  /* ── Derived states ──────────────────────────────────────── */
  const isActive = hovered || clicking;

  return (
    <>
      {/* ── Trail particles ─────────────────────────────────── */}
      {trail.map((dot) => (
        <div
          key={dot.id}
          className="cursor-trail-dot"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#2dd4bf",
            pointerEvents: "none",
            zIndex: 99997,
            transform: `translate(${dot.x - 2.5}px, ${dot.y - 2.5}px) scale(${dot.scale})`,
            opacity: dot.alpha,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* ── Outer ring (lagged / magnetic) ──────────────────── */}
      <div
        ref={outerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isActive ? (clicking ? 44 : 56) : 36,
          height: isActive ? (clicking ? 44 : 56) : 36,
          border: `1.5px solid ${clicking ? "rgba(45,212,191,0.95)" : "rgba(45,212,191,0.55)"}`,
          borderRadius: hovered ? "10px" : "50%",
          transform: "translate(-100px, -100px)",
          /* Centre the ring on the cursor tip */
          marginLeft: isActive ? (clicking ? -22 : -28) : -18,
          marginTop:  isActive ? (clicking ? -22 : -28) : -18,
          pointerEvents: "none",
          zIndex: 99998,
          opacity: visible ? 1 : 0,
          /* All morphing transitions */
          transition:
            "width 220ms cubic-bezier(0.34,1.56,0.64,1), " +
            "height 220ms cubic-bezier(0.34,1.56,0.64,1), " +
            "border-radius 220ms ease, " +
            "margin 220ms cubic-bezier(0.34,1.56,0.64,1), " +
            "border-color 150ms ease, " +
            "opacity 200ms ease",
          willChange: "transform, width, height",
          /* Glow */
          boxShadow: clicking
            ? "0 0 18px rgba(45,212,191,0.55), 0 0 36px rgba(45,212,191,0.2)"
            : hovered
            ? "0 0 12px rgba(45,212,191,0.35)"
            : "0 0 6px rgba(45,212,191,0.15)",
          backdropFilter: hovered ? "blur(1px)" : "none",
        }}
      >
        {/* Corner accent ticks — terminal crosshair feel */}
        {!hovered && (
          <>
            <span style={{ position:"absolute", top:-4,  left:-4,  width:6, height:6, borderTop:"1.5px solid #2dd4bf", borderLeft:"1.5px solid #2dd4bf" }} />
            <span style={{ position:"absolute", top:-4,  right:-4, width:6, height:6, borderTop:"1.5px solid #2dd4bf", borderRight:"1.5px solid #2dd4bf" }} />
            <span style={{ position:"absolute", bottom:-4, left:-4,  width:6, height:6, borderBottom:"1.5px solid #2dd4bf", borderLeft:"1.5px solid #2dd4bf" }} />
            <span style={{ position:"absolute", bottom:-4, right:-4, width:6, height:6, borderBottom:"1.5px solid #2dd4bf", borderRight:"1.5px solid #2dd4bf" }} />
          </>
        )}
      </div>

      {/* ── Inner dot (terminal block cursor) ───────────────── */}
      <div
        ref={innerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width:  clicking ? 6 : hovered ? 5 : 4,
          height: clicking ? 9 : hovered ? 5 : 8,
          borderRadius: hovered ? "50%" : "1px",
          background: "#2dd4bf",
          transform: "translate(-100px, -100px)",
          marginLeft: clicking ? -3  : hovered ? -2.5 : -2,
          marginTop:  clicking ? -4.5 : hovered ? -2.5 : -4,
          pointerEvents: "none",
          zIndex: 99999,
          opacity: visible ? (clicking ? 0.9 : 1) : 0,
          transition:
            "width 150ms ease, height 150ms ease, " +
            "border-radius 150ms ease, opacity 200ms ease, " +
            "margin 150ms ease",
          willChange: "transform",
          boxShadow: "0 0 8px rgba(45,212,191,0.9)",
        }}
      />
    </>
  );
}
