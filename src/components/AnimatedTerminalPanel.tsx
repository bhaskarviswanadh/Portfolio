/**
 * AnimatedTerminalPanel — v4 (split-panel layout)
 *
 * Layout change: terminal body is now flex row:
 *  ├── LEFT (flex-1)  : scrollable command output
 *  └── RIGHT (185px)  : portrait + identity card, PINNED (no scroll)
 *
 * Portrait goes into the right panel so it NEVER scrolls away.
 * Right panel appears when PORTRAIT phase starts and stays visible.
 *
 * StrictMode fix (from v3): runId counter — alive() checks prevent
 * both StrictMode effect runs from executing simultaneously.
 */

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Config ──────────────────────────────────────────────── */
const SESSION_KEY   = "terminal_intro_v15";
const BAR_W         = 14;
const FILLED        = "█";
const EMPTY         = "░";
const BLANK_BRAILLE = "\u2800";

/* ─── Types ───────────────────────────────────────────────── */
type Phase = "IDLE" | "BOOT" | "INIT" | "VERIFY" | "PORTRAIT" | "CAPS" | "READY";

interface TermLine {
  id:      number;
  text:    string;
  cls?:    string;
  bar?:    boolean;
  barFill?:number;
  barLbl?: string;
}

let _uid = 0;
const L = (text: string, rest: Partial<TermLine> = {}): TermLine =>
  ({ id: _uid++, text, ...rest });

/* ─── Helpers ─────────────────────────────────────────────── */
const wait   = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const jitter = ()            => Math.floor(Math.random() * 20 + 10);

/**
 * Trim leading blank Braille (⠀ U+2800) so the face fills the right panel.
 *
 * THE KEY BUG in v4: using ALL rows to find minLead.
 * Rows 44-50 are sparse scatter-dots (clothes/background) that start at
 * column 1-5, pulling minLead down to 1.  Only 1 char gets trimmed, so
 * the face—which starts at column ~27—still has 26 blank chars of padding
 * in front of it (≈ 109px), pushing it off the right edge of the panel.
 *
 * FIX: compute minLead from DENSE rows only (≥ 10 non-blank chars).
 * Then additionally trim sparse rows (< 5 non-blank) from start & end.
 */
function processPortrait(raw: string): string[] {
  const B = BLANK_BRAILLE;
  const lines = raw.split("\n");

  const nonBlankCount = (l: string) =>
    [...l].filter(c => c !== B && c.trim() !== "").length;

  const getLeadBlanks = (l: string) => {
    let i = 0;
    while (i < l.length && l[i] === B) i++;
    return i;
  };

  /* Only use top 70% of rows to determine lead blanks (to ignore bottom scatter noise) */
  const faceLines = lines.slice(0, Math.floor(lines.length * 0.7));
  const denseLines = faceLines.filter(l => nonBlankCount(l) >= 10);
  if (!denseLines.length) return [];

  const minLead = Math.min(...denseLines.map(getLeadBlanks));

  /* Trim all rows by minLead and right-strip trailing blanks */
  const trimmed = lines.map(l => {
    const s = l.slice(minLead);
    let e = s.length;
    while (e > 0 && s[e - 1] === B) e--;
    return s.slice(0, e);
  });

  /* Remove leading/trailing blank rows */
  let s = 0, e = trimmed.length;
  while (s < e && trimmed[s] === "") s++;
  while (e > s && trimmed[e - 1] === "") e--;

  /* Additionally remove very sparse rows from start & end (background scatter) */
  const result = trimmed.slice(s, e);
  let rs = 0, re = result.length;
  while (rs < re && nonBlankCount(result[rs]) < 5) rs++;
  while (re > rs && nonBlankCount(result[re - 1]) < 5) re--;

  const finalRows = result.slice(rs, re);
  if (!finalRows.length) return [];

  // Pad all rows to the exact same length (using blank braille) so they can be centered without distortion
  const maxLen = Math.max(...finalRows.map(r => r.length));
  return finalRows.map(r => r + B.repeat(maxLen - r.length));
}

/* ─── Left-panel snapshot (repeat visits) ────────────────── */
/* Identity info now lives in the right panel, not here.      */
const SNAP: TermLine[] = [
  L("bhaskar@portfolio:~$ initialize-profile --user bhaskar"),
  L("Initializing Developer Profile…", { cls: "text-muted" }),
  L("✓ Personal Information", { cls: "text-ok" }),
  L("✓ Experience",           { cls: "text-ok" }),
  L("✓ Skills",               { cls: "text-ok" }),
  L("✓ Projects",             { cls: "text-ok" }),
  L("✓ Infrastructure",       { cls: "text-ok" }),
  L("✓ Certifications",       { cls: "text-ok" }),
  L("bhaskar@portfolio:~$ verify_identity"),
  L("Scanning…  Matching…  Confirmed.", { cls: "text-muted" }),
  L("bhaskar@portfolio:~$ list_capabilities"),
  L("Linux",      { bar: true, barFill: 0.93, barLbl: "Linux" }),
  L("Docker",     { bar: true, barFill: 0.80, barLbl: "Docker" }),
  L("AWS",        { bar: true, barFill: 0.78, barLbl: "AWS" }),
  L("Networking", { bar: true, barFill: 0.88, barLbl: "Networking" }),
  L("Python",     { bar: true, barFill: 0.70, barLbl: "Python" }),
  L("bhaskar@portfolio:~$ ready"),
  L("System Ready.", { cls: "text-accent" }),
  L("Welcome to my portfolio.", { cls: "text-accent" }),
];

/* ─── Sub-components ──────────────────────────────────────── */
function BlinkCursor() { return <span className="cursor-blink" />; }

function Prompt() {
  return (
    <>
      <span className="text-fg select-none">bhaskar@portfolio</span>
      <span className="text-muted select-none">:~$ </span>
    </>
  );
}

function BarLine({ lbl, fill, animate = false }: { lbl: string; fill: number; animate?: boolean }) {
  const targetF = Math.round(fill * BAR_W);
  const [currentF, setCurrentF] = useState(animate ? 0 : targetF);

  useEffect(() => {
    if (!animate) {
      setCurrentF(targetF);
      return;
    }
    let current = 0;
    const interval = setInterval(() => {
      if (current < targetF) {
        current++;
        setCurrentF(current);
      } else {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [targetF, animate]);

  const displayPct = Math.round((currentF / targetF) * (fill * 100)) || 0;

  return (
    <div className="leading-snug font-mono text-[9px] flex items-center justify-between w-full max-w-[210px]">
      <div className="flex items-center">
        <span className="text-muted inline-block w-[64px] flex-shrink-0">{lbl}</span>
        <span className="text-muted select-none">[</span>
        <span className="text-accent">{FILLED.repeat(currentF)}</span>
        <span className="text-muted/35">{EMPTY.repeat(BAR_W - currentF)}</span>
        <span className="text-muted select-none">]</span>
      </div>
      <span className="text-accent w-[28px] text-right">{displayPct}%</span>
    </div>
  );
}

function ProgBar({ pct }: { pct: number }) {
  const f = Math.round((pct / 100) * BAR_W);
  return (
    <div className="font-mono text-[9px] flex items-center justify-between w-full max-w-[210px]">
      <div className="flex items-center">
        <span className="text-muted inline-block w-[64px] flex-shrink-0">Boot</span>
        <span className="text-muted select-none">[</span>
        <span className="text-accent">{FILLED.repeat(f)}</span>
        <span className="text-muted/35">{EMPTY.repeat(BAR_W - f)}</span>
        <span className="text-muted select-none">]</span>
      </div>
      <span className="text-accent w-[28px] text-right">{pct}%</span>
    </div>
  );
}

function LineEl({ line, animate }: { line: TermLine; animate: boolean }) {
  if (line.bar) return <BarLine lbl={line.barLbl ?? ""} fill={line.barFill ?? 0} animate={animate} />;
  return (
    <div className={`leading-snug whitespace-pre-wrap break-words ${line.cls ?? "text-fg"}`}>
      {line.text}
    </div>
  );
}

/* ─── Right panel identity card ───────────────────────────── */
function IdentityCard() {
  return (
    <div className="border-t border-iron px-2 py-2 flex-shrink-0 space-y-0.5">
      <div className="text-ok font-mono" style={{ fontSize: "9px" }}>
        ✓ Identity Confirmed
      </div>
      <div className="text-bright font-bold font-mono leading-tight" style={{ fontSize: "10px" }}>
        Bhaskar Viswanadh Devisetti
      </div>
      <div className="text-accent font-mono" style={{ fontSize: "9px" }}>
        Cloud • DevOps • Networking
      </div>
      <div className="pt-1 font-mono" style={{ fontSize: "9px" }}>
        <span className="text-bright font-bold">Status: </span>
        <span className="text-ok">Open To Work</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * Main component
 * ══════════════════════════════════════════════════════════ */
export default function AnimatedTerminalPanel() {
  const done0 =
    typeof window !== "undefined" &&
    sessionStorage.getItem(SESSION_KEY) === "true";

  /* ── Left-panel state ───────────────────────────────────── */
  const [phase,    setPhase]    = useState<Phase>(done0 ? "READY" : "IDLE");
  const [lines,    setLines]    = useState<TermLine[]>(done0 ? SNAP : []);
  const [typing,   setTyping]   = useState("");
  const [pct,      setPct]      = useState(0);
  const [showProg, setShowProg] = useState(false);
  const [done,     setDone]     = useState(done0);

  /* ── Right-panel state ──────────────────────────────────── */
  const [rightRows,  setRightRows]  = useState<string[]>([]);  /* portrait rows */
  const [showRight,  setShowRight]  = useState(false);          /* right panel visible */
  const [showIdent,  setShowIdent]  = useState(false);          /* identity card visible */

  /* ── Refs ───────────────────────────────────────────────── */
  const portraitRef = useRef<string[]>([]);
  const runId       = useRef(0);
  const leftEl      = useRef<HTMLDivElement>(null);

  /* ── Scroll left panel ──────────────────────────────────── */
  const scrollBot = useCallback(() => {
    requestAnimationFrame(() => {
      if (leftEl.current)
        leftEl.current.scrollTop = leftEl.current.scrollHeight;
    });
  }, []);

  /* ── Push to left panel ─────────────────────────────────── */
  const push = useCallback((l: TermLine) => {
    setLines(p => [...p, l]);
    scrollBot();
  }, [scrollBot]);

  /* ── Human-like typing ──────────────────────────────────── */
  const typeCmd = useCallback(
    (cmd: string, alive: () => boolean): Promise<void> =>
      new Promise(resolve => {
        let i = 0;
        const tick = () => {
          if (!alive()) { resolve(); return; }
          setTyping(cmd.slice(0, ++i));
          if (i < cmd.length) setTimeout(tick, jitter());
          else resolve();
        };
        tick();
      }),
    []
  );

  /* ── Commit typed command ───────────────────────────────── */
  const commit = useCallback((cmd: string) => {
    setTyping("");
    push(L(`bhaskar@portfolio:~$ ${cmd}`));
  }, [push]);

  /* ── Load & process portrait ────────────────────────────── */
  useEffect(() => {
    fetch("/CONVERTED_ASCII.txt")
      .then(r => r.text())
      .then(txt => {
        const rows = processPortrait(txt);
        portraitRef.current = rows;
        /* On repeat visits: populate right panel immediately */
        if (done0) {
          setRightRows(rows);
          setShowRight(true);
          setShowIdent(true);
        }
      })
      .catch(() => { portraitRef.current = []; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Skip intro ─────────────────────────────────────────── */
  const skip = useCallback(() => {
    runId.current += 100;
    setDone(true);
    setPhase("READY");
    setLines(SNAP);
    setTyping("");
    setShowProg(false);
    /* Populate right panel with portrait if already loaded */
    if (portraitRef.current.length) {
      setRightRows(portraitRef.current);
      setShowRight(true);
      setShowIdent(true);
    }
    sessionStorage.setItem(SESSION_KEY, "true");
  }, []);

  /* ══════════════════════════════════════════════════════════
   * ANIMATION SEQUENCE
   * ══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (done0) return;

    const myRun = ++runId.current;
    const alive = () => runId.current === myRun;

    /* Clean start for StrictMode second run */
    setLines([]);
    setTyping("");
    setPct(0);
    setShowProg(false);
    setShowRight(false);
    setShowIdent(false);
    setRightRows([]);
    setPhase("IDLE");

    const run = async () => {
      await wait(300);
      if (!alive()) return;

      /* ── BOOT ──────────────────────────────────── */
      setPhase("BOOT");
      await typeCmd("initialize-profile --user bhaskar", alive);
      if (!alive()) return;
      commit("initialize-profile --user bhaskar");

      /* ── INIT ──────────────────────────────────── */
      setPhase("INIT");
      await wait(100);

      for (const l of [
        L("Initializing Developer Profile…", { cls: "text-muted" }),
        L("Loading profile metadata…",        { cls: "text-muted" }),
        L("✓ Personal Information", { cls: "text-ok" }),
        L("✓ Experience",           { cls: "text-ok" }),
        L("✓ Skills",               { cls: "text-ok" }),
        L("✓ Projects",             { cls: "text-ok" }),
        L("✓ Infrastructure",       { cls: "text-ok" }),
        L("✓ Certifications",       { cls: "text-ok" }),
      ]) {
        if (!alive()) return;
        await wait(80);
        push(l);
      }

      /* ── VERIFY ────────────────────────────────── */
      await wait(150);
      if (!alive()) return;
      await typeCmd("verify_identity", alive);
      if (!alive()) return;
      commit("verify_identity");
      setPhase("VERIFY");

      for (const l of [
        L("Scanning profile…",          { cls: "text-muted" }),
        L("Analyzing identity…",        { cls: "text-muted" }),
        L("Matching visual signature…", { cls: "text-muted" }),
      ]) {
        if (!alive()) return;
        await wait(100);
        push(l);
      }

      /* progress bar */
      await wait(80);
      if (!alive()) return;
      setShowProg(true);

      await new Promise<void>(res => {
        let p = 0;
        const tick = () => {
          if (!alive()) { res(); return; }
          p = Math.min(100, p + 1);
          setPct(p);
          if (p < 100) setTimeout(tick, 12);
          else         res();
        };
        tick();
      });

      if (!alive()) return;
      setShowProg(false);
      await wait(100);

      /* ── PORTRAIT (right panel reveal) ─────────── */
      setPhase("PORTRAIT");
      push(L("Rendering Developer Portrait…", { cls: "text-muted" }));
      setShowRight(true);   /* right panel appears */
      await wait(100);
      if (!alive()) return;

      const rows = portraitRef.current;
      for (let i = 0; i < rows.length; i++) {
        if (!alive()) return;
        /* Add portrait rows to RIGHT panel, not left */
        setRightRows(p => [...p, rows[i]]);
        await wait(18);
      }

      if (!alive()) return;
      await wait(150);
      setShowIdent(true);   /* identity card appears */
      await wait(250);

      /* ── CAPABILITIES (left panel) ─────────────── */
      setPhase("CAPS");
      if (!alive()) return;
      await typeCmd("list_capabilities", alive);
      if (!alive()) return;
      commit("list_capabilities");
      await wait(150);

      for (const s of [
        { barLbl: "Linux",      barFill: 0.93 },
        { barLbl: "Docker",     barFill: 0.80 },
        { barLbl: "AWS",        barFill: 0.78 },
        { barLbl: "Networking", barFill: 0.88 },
        { barLbl: "Python",     barFill: 0.70 },
      ]) {
        if (!alive()) return;
        await wait(80);
        push(L(s.barLbl, { bar: true, ...s }));
      }

      await wait(250);
      if (!alive()) return;

      /* ── READY ─────────────────────────────────── */
      await typeCmd("ready", alive);
      if (!alive()) return;
      commit("ready");
      await wait(80);
      push(L("System Ready.", { cls: "text-accent" }));
      await wait(150);
      push(L("Welcome to my portfolio.", { cls: "text-accent" }));
      setPhase("READY");
      setDone(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    };

    run();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(scrollBot, [lines, showProg, scrollBot]);

  const animating = !done && phase !== "IDLE";

  /* ── Render ─────────────────────────────────────────────── */
  return (
    /* Outer shell — IDENTICAL to original */
    <div className="overflow-hidden rounded-lg border border-iron bg-obsidian font-mono shadow-2xl shadow-black/40">

      {/* Title bar — unchanged */}
      <div className="flex items-center gap-2 border-b border-iron bg-graphite px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="ml-2 text-xs text-muted">~/bhaskar</span>
        {!done && phase !== "IDLE" && (
          <button
            onClick={skip}
            className="ml-auto text-[10px] text-muted/40 hover:text-muted transition-colors select-none"
          >
            skip ↩
          </button>
        )}
      </div>

      {/* ── Split body: LEFT text | RIGHT portrait ─────────── */}
      <div className="flex" style={{ height: "360px" }}>

        {/* LEFT: scrollable command output */}
        <div
          ref={leftEl}
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-[2px] text-[9px]"
          style={{ scrollbarWidth: "none" }}
        >
          {phase === "IDLE" && (
            <div><Prompt /><BlinkCursor /></div>
          )}

          {lines.map(l => <LineEl key={l.id} line={l} animate={!done} />)}

          {showProg && (
            <div className="py-px"><ProgBar pct={pct} /></div>
          )}

          {animating && typing !== "" && (
            <div><Prompt />{typing}<BlinkCursor /></div>
          )}

          {phase === "READY" && (
            <div className="mt-1"><Prompt /><BlinkCursor /></div>
          )}
        </div>

        {/* RIGHT: portrait + identity card (pinned, no scroll) */}
        {showRight && (
          <div
            className="terminal-portrait-container flex-shrink-0 border-l border-iron flex flex-col overflow-hidden w-[240px] md:w-[190px] lg:w-[250px] xl:w-[280px]"
          >
            {/* Portrait — revealed row by row from top */}
            <div
              className="flex-1 overflow-hidden flex flex-col items-center pt-1"
              style={{ lineHeight: 0 }}
            >
              {rightRows.map((row, i) => (
                <div
                  key={i}
                  className="whitespace-pre text-accent select-none"
                  style={{
                    fontSize:      "var(--portrait-fs)",
                    lineHeight:    "var(--portrait-lh)",
                    fontFamily:    '"JetBrains Mono", "Courier New", monospace',
                    letterSpacing: "-0.2px",
                  }}
                >
                  {row}
                </div>
              ))}
            </div>

            {/* Identity card — appears after portrait */}
            {showIdent && <IdentityCard />}
          </div>
        )}
      </div>
    </div>
  );
}
