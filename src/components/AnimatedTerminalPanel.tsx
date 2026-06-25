/**
 * AnimatedTerminalPanel — v3 (definitive)
 *
 * StrictMode fix: use runId counter (NOT cancelledRef).
 * In React 18 StrictMode, effects run twice. The second ++runId
 * invalidates the first run's alive() checks — no state races.
 *
 * Portrait fix: trim common leading blank Braille (⠀ U+2800)
 * from all rows so the art is centered/left-aligned and fits
 * the container at a readable font size.
 */

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Config ────────────────────────────────────────────── */
const SESSION_KEY   = "terminal_intro_v3";   /* bump version = always replays once */
const BAR_W         = 16;
const B_FILLED      = "█";
const B_EMPTY       = "░";
const BLANK_BRAILLE = "\u2800";             /* ⠀ */

/* ─── Types ─────────────────────────────────────────────── */
type Phase = "IDLE" | "BOOT" | "INIT" | "VERIFY" | "PORTRAIT" | "CAPS" | "READY";

interface TermLine {
  id:       number;
  text:     string;
  cls?:     string;   /* tailwind text-* class */
  portrait?:boolean;
  bar?:     boolean;
  barFill?: number;
  barLbl?:  string;
}

let _uid = 0;
const L = (text: string, rest: Partial<TermLine> = {}): TermLine =>
  ({ id: _uid++, text, ...rest });

/* ─── Helpers ───────────────────────────────────────────── */
const wait   = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const jitter = ()            => Math.floor(Math.random() * 75 + 40); /* ms */

/* Trim common leading blank Braille from all rows */
function processPortrait(raw: string): string[] {
  const BLANK = BLANK_BRAILLE;
  const lines = raw.split("\n");

  /* rows that have real content */
  const contentLines = lines.filter(l =>
    [...l].some(c => c !== BLANK && c.trim() !== "")
  );
  if (contentLines.length === 0) return lines;

  /* minimum leading blanks across content rows */
  const minLead = Math.min(
    ...contentLines.map(l => {
      let i = 0;
      while (i < l.length && l[i] === BLANK) i++;
      return i;
    })
  );

  /* slice off the common indent; right-trim trailing blanks */
  const trimmed = lines.map(l => {
    const s = l.slice(minLead);
    let end = s.length;
    while (end > 0 && s[end - 1] === BLANK) end--;
    return s.slice(0, end);
  });

  /* drop leading/trailing fully-empty rows */
  let s = 0, e = trimmed.length;
  while (s < e && trimmed[s] === "") s++;
  while (e > s && trimmed[e - 1] === "") e--;

  return trimmed.slice(s, e);
}

/* ─── READY snapshot (repeat visits, no portrait) ───────── */
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
  L("✓ Identity Confirmed",                  { cls: "text-ok" }),
  L("Bhaskar Viswanadh Devisetti",           { cls: "text-bright" }),
  L("Cloud • DevOps • Networking Engineer",  { cls: "text-accent" }),
  L("bhaskar@portfolio:~$ list_capabilities"),
  L("OS     Ubuntu 24.04 LTS",       { cls: "text-muted" }),
  L("Role   Cloud & DevOps Engineer",{ cls: "text-muted" }),
  L("Status Open To Work",           { cls: "text-ok" }),
  L("Linux",      { bar: true, barFill: 0.93, barLbl: "Linux" }),
  L("Docker",     { bar: true, barFill: 0.80, barLbl: "Docker" }),
  L("AWS",        { bar: true, barFill: 0.78, barLbl: "AWS" }),
  L("Networking", { bar: true, barFill: 0.88, barLbl: "Networking" }),
  L("Python",     { bar: true, barFill: 0.70, barLbl: "Python" }),
  L("bhaskar@portfolio:~$ ready"),
  L("System Ready. Welcome to my portfolio.", { cls: "text-accent" }),
];

/* ─── Sub-components ────────────────────────────────────── */
function BlinkCursor() { return <span className="cursor-blink" />; }

function PromptLabel() {
  return (
    <>
      <span className="text-accent select-none">bhaskar@portfolio</span>
      <span className="text-muted select-none">:~$ </span>
    </>
  );
}

function BarLine({ lbl, fill }: { lbl: string; fill: number }) {
  const f = Math.round(fill * BAR_W);
  return (
    <div className="leading-snug font-mono text-[11px]">
      <span className="text-muted">{lbl.padEnd(13)}</span>
      <span className="text-accent">{B_FILLED.repeat(f)}</span>
      <span className="text-iron">{B_EMPTY.repeat(BAR_W - f)}</span>
    </div>
  );
}

function ProgBar({ pct }: { pct: number }) {
  const f = Math.round((pct / 100) * BAR_W);
  return (
    <div className="font-mono text-[11px]">
      <span className="text-muted">[</span>
      <span className="text-accent">{B_FILLED.repeat(f)}</span>
      <span className="text-iron">{B_EMPTY.repeat(BAR_W - f)}</span>
      <span className="text-muted">] </span>
      <span className="text-accent">{pct}%</span>
    </div>
  );
}

function TermLineEl({ line }: { line: TermLine }) {
  if (line.bar) return <BarLine lbl={line.barLbl ?? ""} fill={line.barFill ?? 0} />;
  if (line.portrait) {
    return (
      <div
        className="whitespace-pre text-accent leading-none select-none"
        style={{ fontSize: "9px", lineHeight: "10px" }}
      >
        {line.text}
      </div>
    );
  }
  return (
    <div className={`leading-snug whitespace-pre-wrap ${line.cls ?? "text-fg"}`}>
      {line.text}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * AnimatedTerminalPanel
 * ═══════════════════════════════════════════════════════════ */
export default function AnimatedTerminalPanel() {
  const done0 =
    typeof window !== "undefined" &&
    sessionStorage.getItem(SESSION_KEY) === "true";

  const [phase,    setPhase]   = useState<Phase>(done0 ? "READY" : "IDLE");
  const [lines,    setLines]   = useState<TermLine[]>(done0 ? SNAP : []);
  const [typing,   setTyping]  = useState("");
  const [pct,      setPct]     = useState(0);
  const [showProg, setShowProg]= useState(false);
  const [done,     setDone]    = useState(done0);

  const portraitRef = useRef<string[]>([]);
  const runId       = useRef(0);         /* StrictMode guard */
  const bodyEl      = useRef<HTMLDivElement>(null);

  /* ── Scroll to bottom ─────────────────────────────────── */
  const scrollBot = useCallback(() => {
    requestAnimationFrame(() => {
      if (bodyEl.current)
        bodyEl.current.scrollTop = bodyEl.current.scrollHeight;
    });
  }, []);

  /* ── Append a line ────────────────────────────────────── */
  const push = useCallback((l: TermLine) => {
    setLines(p => [...p, l]);
    scrollBot();
  }, [scrollBot]);

  /* ── Type a command char-by-char ──────────────────────── */
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

  /* ── Commit typed command to output ───────────────────── */
  const commit = useCallback((cmd: string) => {
    setTyping("");
    push(L(`bhaskar@portfolio:~$ ${cmd}`));
  }, [push]);

  /* ── Fetch & process portrait ─────────────────────────── */
  useEffect(() => {
    fetch("/CONVERTED_ASCII.txt")
      .then(r => r.text())
      .then(txt => { portraitRef.current = processPortrait(txt); })
      .catch(() => { portraitRef.current = []; });
  }, []);

  /* ── Skip intro ───────────────────────────────────────── */
  const skip = useCallback(() => {
    runId.current += 100;            /* invalidate running sequence */
    setDone(true);
    setPhase("READY");
    setLines(SNAP);
    setTyping("");
    setShowProg(false);
    sessionStorage.setItem(SESSION_KEY, "true");
  }, []);

  /* ══════════════════════════════════════════════════════
   * MAIN SEQUENCE
   * ══════════════════════════════════════════════════════ */
  useEffect(() => {
    if (done0) return;

    /*
     * StrictMode fix: each effect run gets a unique runId.
     * The second (real) run increments it, making the first
     * run's alive() checks false → first run exits cleanly.
     * Unlike cancelled-ref approach, this does NOT un-cancel
     * a stale run when the second run starts.
     */
    const myRun = ++runId.current;
    const alive = () => runId.current === myRun;

    /* Clear any stale state from the first StrictMode run */
    setLines([]);
    setTyping("");
    setPct(0);
    setShowProg(false);
    setPhase("IDLE");

    const run = async () => {
      await wait(800);
      if (!alive()) return;

      /* ── BOOT ─────────────────────────────────── */
      setPhase("BOOT");
      await typeCmd("initialize-profile --user bhaskar", alive);
      if (!alive()) return;
      commit("initialize-profile --user bhaskar");

      /* ── INIT ─────────────────────────────────── */
      setPhase("INIT");
      await wait(200);

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
        await wait(160);
        push(l);
      }

      /* ── VERIFY ───────────────────────────────── */
      await wait(320);
      if (!alive()) return;
      await typeCmd("verify_identity", alive);
      if (!alive()) return;
      commit("verify_identity");
      setPhase("VERIFY");

      for (const l of [
        L("Scanning profile…",          { cls: "text-muted" }),
        L("Analyzing identity…",        { cls: "text-muted" }),
        L("Matching visual signature…", { cls: "text-muted" }),
        L("Verification in progress…",  { cls: "text-muted" }),
      ]) {
        if (!alive()) return;
        await wait(220);
        push(l);
      }

      /* progress bar */
      await wait(180);
      if (!alive()) return;
      setShowProg(true);

      await new Promise<void>(res => {
        let p = 0;
        const tick = () => {
          if (!alive()) { res(); return; }
          p = Math.min(100, p + Math.floor(Math.random() * 5) + 2);
          setPct(p);
          if (p < 100) setTimeout(tick, 22);
          else         res();
        };
        tick();
      });

      if (!alive()) return;
      setShowProg(false);
      await wait(200);

      /* ── PORTRAIT ─────────────────────────────── */
      setPhase("PORTRAIT");
      push(L("Rendering Developer Portrait…", { cls: "text-muted" }));
      await wait(200);
      if (!alive()) return;

      const rows = portraitRef.current;
      for (let i = 0; i < rows.length; i++) {
        if (!alive()) return;
        push(L(rows[i], { portrait: true }));
        await wait(16);
      }

      if (!alive()) return;
      await wait(280);
      push(L("✓ Identity Confirmed",                  { cls: "text-ok" }));
      await wait(130);
      push(L("Bhaskar Viswanadh Devisetti",           { cls: "text-bright" }));
      await wait(100);
      push(L("Cloud • DevOps • Networking Engineer",  { cls: "text-accent" }));
      await wait(480);
      if (!alive()) return;

      /* ── CAPABILITIES ─────────────────────────── */
      setPhase("CAPS");
      await typeCmd("list_capabilities", alive);
      if (!alive()) return;
      commit("list_capabilities");

      for (const l of [
        L("OS     Ubuntu 24.04 LTS",       { cls: "text-muted" }),
        L("Role   Cloud & DevOps Engineer",{ cls: "text-muted" }),
        L("Status Open To Work",           { cls: "text-ok" }),
      ]) {
        if (!alive()) return;
        await wait(180);
        push(l);
      }

      for (const s of [
        { barLbl: "Linux",      barFill: 0.93 },
        { barLbl: "Docker",     barFill: 0.80 },
        { barLbl: "AWS",        barFill: 0.78 },
        { barLbl: "Networking", barFill: 0.88 },
        { barLbl: "Python",     barFill: 0.70 },
      ]) {
        if (!alive()) return;
        await wait(150);
        push(L(s.barLbl, { bar: true, ...s }));
      }

      await wait(480);
      if (!alive()) return;

      /* ── READY ────────────────────────────────── */
      await typeCmd("ready", alive);
      if (!alive()) return;
      commit("ready");
      await wait(160);
      push(L("System Ready. Welcome to my portfolio.", { cls: "text-accent" }));
      setPhase("READY");
      setDone(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    };

    run();
    /* cleanup: next effect run increments runId, making alive() false */
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* auto-scroll on content change */
  useEffect(scrollBot, [lines, showProg, scrollBot]);

  const animating = !done && phase !== "IDLE";

  /* ── Render ─────────────────────────────────────────────── */
  return (
    /* outer wrapper: IDENTICAL to original TerminalPanel */
    <div className="overflow-hidden rounded-lg border border-iron bg-obsidian font-mono text-[11px] leading-relaxed shadow-2xl shadow-black/40">

      {/* title bar */}
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

      {/* terminal body */}
      <div
        ref={bodyEl}
        className="h-[340px] overflow-y-auto overflow-x-hidden px-4 py-3 space-y-[1px]"
        style={{ scrollbarWidth: "none" }}
      >
        {/* IDLE: just a prompt + cursor */}
        {phase === "IDLE" && (
          <div><PromptLabel /><BlinkCursor /></div>
        )}

        {/* committed lines */}
        {lines.map(l => <TermLineEl key={l.id} line={l} />)}

        {/* live progress bar */}
        {showProg && <div className="py-px"><ProgBar pct={pct} /></div>}

        {/* live typing */}
        {animating && typing !== "" && (
          <div><PromptLabel />{typing}<BlinkCursor /></div>
        )}

        {/* idle cursor after completion */}
        {phase === "READY" && (
          <div className="mt-1"><PromptLabel /><BlinkCursor /></div>
        )}
      </div>
    </div>
  );
}
