/**
 * AnimatedTerminalPanel — v2 (bug-fixed)
 *
 * Bug fixes from v1:
 *  1. cancelledRef.current was NOT reset at the start of the effect.
 *     In React StrictMode (dev), useEffect runs TWICE. The cleanup from
 *     the first run sets cancelledRef.current = true.  When the second
 *     run's sleep() resolved it immediately returned.  Terminal = frozen.
 *     Fix: cancelledRef.current = false at the top of the effect.
 *
 *  2. Portrait rows were rendered in a separate JSX block keyed on
 *     phase === "RENDERING_PORTRAIT".  When the phase advanced, they
 *     vanished.  Fix: rows are pushed directly into the `lines` array
 *     so they persist like any other output line.
 *
 *  3. Removed the now-unnecessary portraitRows / shownRows state.
 */

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────── */
type Phase =
  | "IDLE"
  | "BOOT"
  | "INITIALIZING"
  | "VERIFYING"
  | "RENDERING_PORTRAIT"
  | "CAPABILITIES"
  | "READY";

interface Line {
  id:          number;
  text:        string;
  color?:      string;      /* text-* class */
  isPortrait?: boolean;
  isBar?:      boolean;
  barFill?:    number;
  barLabel?:   string;
}

/* ─── Constants ──────────────────────────────────────────────── */
const SESSION_KEY = "terminal_intro_played";
const BAR_TOTAL   = 18;
const FILLED      = "█";
const EMPTY       = "░";

/* ─── ID factory ─────────────────────────────────────────────── */
let _id = 0;
const L = (text: string, rest: Partial<Line> = {}): Line =>
  ({ id: _id++, text, ...rest });

/* ─── Helpers ────────────────────────────────────────────────── */
const sleep = (ms: number) =>
  new Promise<void>(r => setTimeout(r, ms));

const humanDelay = () =>
  Math.floor(Math.random() * 80 + 38);

/* ─── Blinking cursor ────────────────────────────────────────── */
function Cursor() {
  return <span className="cursor-blink" />;
}

/* ─── Progress bar ───────────────────────────────────────────── */
function ProgressBar({ pct }: { pct: number }) {
  const f = Math.round((pct / 100) * BAR_TOTAL);
  return (
    <span className="font-mono text-[11px]">
      <span className="text-muted">[</span>
      <span className="text-accent">{FILLED.repeat(f)}</span>
      <span className="text-iron">{EMPTY.repeat(BAR_TOTAL - f)}</span>
      <span className="text-muted">] </span>
      <span className="text-accent">{pct}%</span>
    </span>
  );
}

/* ─── Skill bar ──────────────────────────────────────────────── */
function SkillBar({ label, fill }: { label: string; fill: number }) {
  const f = Math.round(fill * BAR_TOTAL);
  return (
    <span className="font-mono text-[11px]">
      <span className="text-muted">{label.padEnd(13)}</span>
      <span className="text-accent">{FILLED.repeat(f)}</span>
      <span className="text-iron">{EMPTY.repeat(BAR_TOTAL - f)}</span>
    </span>
  );
}

/* ─── Prompt ─────────────────────────────────────────────────── */
function Prompt() {
  return (
    <>
      <span className="text-accent">bhaskar@portfolio</span>
      <span className="text-muted">:~$ </span>
    </>
  );
}

/* ─── Line renderer ──────────────────────────────────────────── */
function LineEl({ line }: { line: Line }) {
  if (line.isPortrait) {
    return (
      <div
        className="text-accent/60 whitespace-pre leading-none select-none"
        style={{ fontSize: "8px", lineHeight: "9.5px" }}
      >
        {line.text}
      </div>
    );
  }
  if (line.isBar) {
    return (
      <div className="leading-snug">
        <SkillBar label={line.barLabel ?? ""} fill={line.barFill ?? 0} />
      </div>
    );
  }
  return (
    <div className={`leading-snug whitespace-pre-wrap ${line.color ?? "text-fg"}`}>
      {line.text}
    </div>
  );
}

/* ─── Ready snapshot (shown on repeat visits) ────────────────── */
const READY_SNAPSHOT: Line[] = [
  L("bhaskar@portfolio:~$ initialize-profile --user bhaskar"),
  L("Initializing Developer Profile...", { color: "text-muted" }),
  L("✓ Personal Information",  { color: "text-ok" }),
  L("✓ Experience",            { color: "text-ok" }),
  L("✓ Skills",                { color: "text-ok" }),
  L("✓ Projects",              { color: "text-ok" }),
  L("✓ Infrastructure",        { color: "text-ok" }),
  L("bhaskar@portfolio:~$ verify_identity"),
  L("✓ Identity Confirmed",                  { color: "text-ok" }),
  L("Bhaskar Viswanadh Devisetti",           { color: "text-bright" }),
  L("Cloud • DevOps • Networking Engineer",  { color: "text-accent" }),
  L("bhaskar@portfolio:~$ list_capabilities"),
  L("OS      Ubuntu 24.04 LTS",      { color: "text-muted" }),
  L("Role    Cloud & DevOps Engineer",{ color: "text-muted" }),
  L("Status  Open To Work",           { color: "text-ok" }),
  L("Linux",      { isBar: true, barFill: 0.92, barLabel: "Linux" }),
  L("Docker",     { isBar: true, barFill: 0.80, barLabel: "Docker" }),
  L("AWS",        { isBar: true, barFill: 0.78, barLabel: "AWS" }),
  L("Networking", { isBar: true, barFill: 0.88, barLabel: "Networking" }),
  L("Python",     { isBar: true, barFill: 0.70, barLabel: "Python" }),
  L("bhaskar@portfolio:~$ ready"),
  L("System Ready. Welcome to my portfolio.", { color: "text-accent" }),
];

/* ═══════════════════════════════════════════════════════════════
 * Main component
 * ═══════════════════════════════════════════════════════════════ */
export default function AnimatedTerminalPanel() {
  const alreadyDone =
    typeof window !== "undefined" &&
    sessionStorage.getItem(SESSION_KEY) === "true";

  /* ── State ─────────────────────────────────────────────────── */
  const [phase,      setPhase]      = useState<Phase>(alreadyDone ? "READY" : "IDLE");
  const [lines,      setLines]      = useState<Line[]>(alreadyDone ? READY_SNAPSHOT : []);
  const [typing,     setTyping]     = useState("");     /* live typed chars */
  const [progress,   setProgress]   = useState(0);
  const [showProg,   setShowProg]   = useState(false);
  const [done,       setDone]       = useState(alreadyDone);

  /* ── Refs ──────────────────────────────────────────────────── */
  const portraitRef = useRef<string[]>([]);
  const cancelled   = useRef(false);
  const scrollEl    = useRef<HTMLDivElement>(null);

  /* ── Auto-scroll ───────────────────────────────────────────── */
  const scrollBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollEl.current)
        scrollEl.current.scrollTop = scrollEl.current.scrollHeight;
    });
  }, []);

  /* ── Push a line to output ─────────────────────────────────── */
  const push = useCallback((line: Line) => {
    setLines(p => [...p, line]);
    scrollBottom();
  }, [scrollBottom]);

  /* ── Human-like typing ─────────────────────────────────────── */
  const typeCmd = useCallback((cmd: string): Promise<void> =>
    new Promise(resolve => {
      let i = 0;
      const tick = () => {
        if (cancelled.current) { resolve(); return; }
        i++;
        setTyping(cmd.slice(0, i));
        if (i < cmd.length) setTimeout(tick, humanDelay());
        else resolve();
      };
      tick();
    }),
  []);

  /* ── Commit a typed command as a prompt line ───────────────── */
  const commitCmd = useCallback((cmd: string) => {
    setTyping("");
    push(L(`bhaskar@portfolio:~$ ${cmd}`));
  }, [push]);

  /* ── Load portrait ─────────────────────────────────────────── */
  useEffect(() => {
    fetch("/CONVERTED_ASCII.txt")
      .then(r => r.text())
      .then(txt => { portraitRef.current = txt.split("\n"); })
      .catch(() => { portraitRef.current = ["[portrait unavailable]"]; });
  }, []);

  /* ── Skip ──────────────────────────────────────────────────── */
  const skip = useCallback(() => {
    cancelled.current = true;
    setDone(true);
    setPhase("READY");
    setLines(READY_SNAPSHOT);
    setTyping("");
    setShowProg(false);
    sessionStorage.setItem(SESSION_KEY, "true");
  }, []);

  /* ═══════════════════════════════════════════════════════════
   * MAIN ANIMATION SEQUENCE
   * ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (alreadyDone) return;

    /* ── FIX #1: Reset the cancel flag every time this effect
     *            mounts.  In React 18 StrictMode (dev), effects
     *            run twice.  The cleanup from run #1 sets
     *            cancelled.current = true; without this reset
     *            the second run exits immediately at the first
     *            guard check, leaving the terminal frozen.      */
    cancelled.current = false;

    const run = async () => {
      /* Initial pause so the hero section fades in first */
      await sleep(900);
      if (cancelled.current) return;

      /* ── BOOT ──────────────────────────────────────────── */
      setPhase("BOOT");

      await typeCmd("initialize-profile --user bhaskar");
      if (cancelled.current) return;
      commitCmd("initialize-profile --user bhaskar");

      /* ── INITIALIZING ──────────────────────────────────── */
      setPhase("INITIALIZING");
      await sleep(220);

      const initMsgs = [
        L("Initializing Developer Profile...", { color: "text-muted" }),
        L("Loading profile metadata...",        { color: "text-muted" }),
        L("✓ Personal Information",  { color: "text-ok" }),
        L("✓ Experience",            { color: "text-ok" }),
        L("✓ Skills",                { color: "text-ok" }),
        L("✓ Projects",              { color: "text-ok" }),
        L("✓ Infrastructure",        { color: "text-ok" }),
        L("✓ Certifications",        { color: "text-ok" }),
      ];
      for (const l of initMsgs) {
        if (cancelled.current) return;
        await sleep(170);
        push(l);
      }

      /* ── VERIFYING ─────────────────────────────────────── */
      await sleep(350);
      if (cancelled.current) return;

      await typeCmd("verify_identity");
      if (cancelled.current) return;
      commitCmd("verify_identity");
      setPhase("VERIFYING");

      const verMsgs = [
        L("Scanning profile...",          { color: "text-muted" }),
        L("Analyzing identity...",        { color: "text-muted" }),
        L("Matching visual signature...", { color: "text-muted" }),
        L("Verification in progress...",  { color: "text-muted" }),
      ];
      for (const l of verMsgs) {
        if (cancelled.current) return;
        await sleep(230);
        push(l);
      }

      /* Progress bar */
      await sleep(200);
      if (cancelled.current) return;
      setShowProg(true);

      await new Promise<void>(res => {
        let pct = 0;
        const tick = () => {
          if (cancelled.current) { res(); return; }
          pct = Math.min(100, pct + Math.floor(Math.random() * 5) + 2);
          setProgress(pct);
          if (pct < 100) setTimeout(tick, 25);
          else res();
        };
        tick();
      });

      if (cancelled.current) return;
      setShowProg(false);
      await sleep(200);

      /* ── RENDERING_PORTRAIT ────────────────────────────── */
      setPhase("RENDERING_PORTRAIT");
      push(L("Rendering Developer Portrait...", { color: "text-muted" }));
      await sleep(250);
      if (cancelled.current) return;

      /* ── FIX #2: Push rows directly into `lines` so they
       *            persist when the phase advances.            */
      const rows = portraitRef.current;
      for (let i = 0; i < rows.length; i++) {
        if (cancelled.current) return;
        push(L(rows[i], { isPortrait: true }));
        await sleep(18);
      }

      if (cancelled.current) return;
      await sleep(300);

      push(L("✓ Identity Confirmed",                   { color: "text-ok" }));
      await sleep(140);
      push(L("Bhaskar Viswanadh Devisetti",            { color: "text-bright" }));
      await sleep(100);
      push(L("Cloud • DevOps • Networking Engineer",   { color: "text-accent" }));
      await sleep(500);
      if (cancelled.current) return;

      /* ── CAPABILITIES ──────────────────────────────────── */
      setPhase("CAPABILITIES");

      await typeCmd("list_capabilities");
      if (cancelled.current) return;
      commitCmd("list_capabilities");

      const capInfo = [
        L("OS      Ubuntu 24.04 LTS",       { color: "text-muted" }),
        L("Role    Cloud & DevOps Engineer", { color: "text-muted" }),
        L("Status  Open To Work",            { color: "text-ok" }),
      ];
      for (const l of capInfo) {
        if (cancelled.current) return;
        await sleep(190);
        push(l);
      }

      const skills = [
        { label: "Linux",      fill: 0.92 },
        { label: "Docker",     fill: 0.80 },
        { label: "AWS",        fill: 0.78 },
        { label: "Networking", fill: 0.88 },
        { label: "Python",     fill: 0.70 },
      ];
      for (const s of skills) {
        if (cancelled.current) return;
        await sleep(160);
        push(L(s.label, { isBar: true, barFill: s.fill, barLabel: s.label }));
      }

      await sleep(500);
      if (cancelled.current) return;

      /* ── READY ─────────────────────────────────────────── */
      await typeCmd("ready");
      if (cancelled.current) return;
      commitCmd("ready");
      await sleep(180);
      push(L("System Ready. Welcome to my portfolio.", { color: "text-accent" }));
      setPhase("READY");
      setDone(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    };

    run();

    return () => { cancelled.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Scroll on every update ─────────────────────────────────── */
  useEffect(scrollBottom, [lines, showProg, scrollBottom]);

  const isAnimating = !done && phase !== "IDLE";

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    /* Outer shell: IDENTICAL classes to the old static TerminalPanel */
    <div className="overflow-hidden rounded-lg border border-iron bg-obsidian font-mono text-[11px] leading-relaxed shadow-2xl shadow-black/40">

      {/* Title bar — identical to before */}
      <div className="flex items-center gap-2 border-b border-iron bg-graphite px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="ml-2 text-xs text-muted">~/bhaskar</span>

        {/* Skip intro button */}
        {!done && phase !== "IDLE" && (
          <button
            onClick={skip}
            className="ml-auto text-[10px] text-muted/50 hover:text-muted transition-colors select-none"
          >
            skip ↩
          </button>
        )}
      </div>

      {/* Terminal body — fixed height prevents layout shifts */}
      <div
        ref={scrollEl}
        className="h-[340px] overflow-y-auto overflow-x-hidden px-4 py-3 space-y-[2px]"
        style={{ scrollbarWidth: "none" }}
      >
        {/* IDLE: just a prompt with cursor */}
        {phase === "IDLE" && (
          <div>
            <Prompt /><Cursor />
          </div>
        )}

        {/* Committed output lines */}
        {lines.map(l => <LineEl key={l.id} line={l} />)}

        {/* Live progress bar */}
        {showProg && (
          <div className="py-0.5"><ProgressBar pct={progress} /></div>
        )}

        {/* Live typing line (prompt + chars being typed) */}
        {isAnimating && typing !== "" && (
          <div>
            <Prompt />{typing}<Cursor />
          </div>
        )}

        {/* Idle cursor after READY */}
        {phase === "READY" && (
          <div className="mt-1">
            <Prompt /><Cursor />
          </div>
        )}
      </div>
    </div>
  );
}
