import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type MouseEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "motion/react";
import Section from "@/components/Section";
import { projects } from "@/data";

/* ─── palette per project ─────────────────────────────────────── */
const PALETTES: Record<string, { a: string; b: string; bg: string }> = {
  "idp-project": { a: "#00d2ff", b: "#3a7bd5", bg: "#020e18" },
  "Network-Monitoring-System": { a: "#f7971e", b: "#ff512f", bg: "#100800" },
  "AI-Lead-Qualification-Bot": { a: "#a855f7", b: "#6366f1", bg: "#07020d" },
  "AI-Customer-Support-Assistant": { a: "#11998e", b: "#38ef7d", bg: "#00100d" },
};
const pal = (name: string) => PALETTES[name] ?? { a: "#2dd4bf", b: "#0ea5e9", bg: "#0d0e11" };

/* ─── tech tag colours ────────────────────────────────────────── */
const TAG_COLORS: Record<string, string> = {
  Go: "#00add8", Docker: "#2496ed", Kubernetes: "#326ce5",
  Minikube: "#326ce5", YAML: "#f5a623", "GitHub Actions": "#2dba4e",
  Python: "#3776ab", Flask: "#cccccc", "Docker Compose": "#2496ed",
  "AWS EC2": "#ff9900", Paramiko: "#a78bfa",
  n8n: "#ea4b71", OpenAI: "#10a37f", "Gemini API": "#4285f4",
  Webhooks: "#f59e0b", "JSON Processing": "#8b5cf6",
  "Google Sheets": "#34a853", "REST APIs": "#06b6d4",
  "Prompt Engineering": "#f472b6", "Workflow Automation": "#a78bfa",
  "AI Agents": "#fb923c", "API Integrations": "#38bdf8",
  "Knowledge Base Retrieval": "#34d399",
};
const tc = (t: string) => TAG_COLORS[t] ?? "#2dd4bf";

/* ─── Icons ───────────────────────────────────────────────────── */
const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const ArrowUpRightIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
  </svg>
);
const ChevLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* ─── Card visual hero area ────────────────────────────────────── */
function CardVisual({ project, isActive }: { project: typeof projects[0]; isActive: boolean }) {
  const { a, b, bg } = pal(project.name);
  const isAI = project.name.startsWith("AI-");

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: bg }}>
      {/* gradient backdrop */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 90% 80% at 20% 20%, ${a}50 0%, transparent 65%),
                     radial-gradient(ellipse 70% 90% at 80% 80%, ${b}35 0%, transparent 60%)`,
      }} />

      {/* animated SVG waves */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="none" style={{ opacity: 0.18 }}>
        {[0, 40, 80].map((off, i) => (
          <motion.path
            key={i}
            d={`M-40,${60 + off} C80,${30 + off} 180,${90 + off} 320,${50 + off} S480,${70 + off} 400,${60 + off}`}
            fill="none" stroke={i % 2 === 0 ? a : b} strokeWidth="1.5"
            initial={{ opacity: 0.3, pathLength: 0.4 }}
            animate={isActive
              ? { pathLength: [0.3, 1, 0.3], opacity: [0.4, 0.9, 0.4] }
              : { pathLength: 0.4, opacity: 0.3 }}
            transition={{ duration: 3.5 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}
      </svg>

      {/* decorative grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(${a}18 1px, transparent 1px), linear-gradient(90deg, ${a}18 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }} />

      {/* pulsing orbs */}
      <motion.div className="absolute rounded-full blur-2xl pointer-events-none"
        style={{ width: 130, height: 130, background: a, top: "5%", left: "10%", opacity: 0.22 }}
        animate={isActive ? { scale: [1, 1.3, 1], opacity: [0.18, 0.38, 0.18] } : { opacity: 0.12 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute rounded-full blur-3xl pointer-events-none"
        style={{ width: 90, height: 90, background: b, bottom: "8%", right: "5%", opacity: 0.18 }}
        animate={isActive ? { scale: [1, 1.4, 1], opacity: [0.12, 0.28, 0.12] } : { opacity: 0.08 }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* floating mock UI panel */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-[72%] rounded-xl overflow-hidden"
        style={{
          translateX: "-50%",
          translateY: "-50%",
          background: "rgba(8,9,14,0.82)",
          border: `1px solid ${a}28`,
          backdropFilter: "blur(18px)",
        }}
        animate={isActive ? { boxShadow: [`0 6px 32px ${a}22`, `0 6px 48px ${a}40`, `0 6px 32px ${a}22`] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.05]">
          <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
          <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
          <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
          <span className="ml-auto font-mono text-[8px] opacity-25 truncate max-w-[80px]">{project.name}</span>
        </div>
        <div className="p-3 font-mono text-[9px] space-y-1">
          <div><span style={{ color: a }}>❯</span> {isAI ? "ai run --agent" : "deploy --env prod"}</div>
          <div className="opacity-35">initializing...</div>
          <div style={{ color: "#34d399" }}>✓ {isAI ? "model connected" : "containers healthy"}</div>
          <div style={{ color: "#34d399" }}>✓ {isAI ? "workflow active" : "pipeline running"}</div>
          <div className="opacity-25">stack: <span style={{ color: a }}>{project.tech.slice(0, 2).join(" · ")}</span></div>
          <div className="flex gap-1 pt-1 flex-wrap">
            {project.tech.slice(0, 3).map(t => (
              <span key={t} style={{ padding: "1px 5px", fontSize: 8, background: `${tc(t)}20`, color: tc(t), borderRadius: 4, border: `1px solid ${tc(t)}30` }}>{t}</span>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  );
}

/* ─── Position math ───────────────────────────────────────────── */
type Pos = "left2" | "left1" | "center" | "right1" | "right2" | "gone";

function getPos(idx: number, active: number, total: number): Pos {
  const rel = ((idx - active) % total + total) % total;
  const rrel = ((active - idx) % total + total) % total;
  if (rel === 0) return "center";
  if (rrel === 1) return "left1";
  if (rel === 1) return "right1";
  if (rrel === 2 && total > 3) return "left2";
  if (rel === 2 && total > 3) return "right2";
  return "gone";
}

interface LayoutProps { translateX: string; scale: number; opacity: number; rotateY: number; z: number; filter: string }

function layout(pos: Pos): LayoutProps {
  switch (pos) {
    case "center": return { translateX: "0px", scale: 1, opacity: 1, rotateY: 0, z: 40, filter: "brightness(1)" };
    case "left1": return { translateX: "-195px", scale: 0.84, opacity: 0.72, rotateY: 24, z: 20, filter: "brightness(0.55)" };
    case "right1": return { translateX: "195px", scale: 0.84, opacity: 0.72, rotateY: -24, z: 20, filter: "brightness(0.55)" };
    case "left2": return { translateX: "-310px", scale: 0.66, opacity: 0.28, rotateY: 42, z: 10, filter: "brightness(0.3)" };
    case "right2": return { translateX: "310px", scale: 0.66, opacity: 0.28, rotateY: -42, z: 10, filter: "brightness(0.3)" };
    default: return { translateX: "0px", scale: 0.5, opacity: 0, rotateY: 0, z: 0, filter: "brightness(0)" };
  }
}

/* ─── Single card ─────────────────────────────────────────────── */
function ProjectCard({ project, pos, onClick }: {
  project: typeof projects[0]; pos: Pos; onClick: () => void;
}) {
  const isActive = pos === "center";
  const { a } = pal(project.name);
  const lyt = layout(pos);

  /* mouse tilt — active card only */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const tiltX = useSpring(useTransform(rawY, [-1, 1], [7, -7]), { stiffness: 180, damping: 22 });
  const tiltY = useSpring(useTransform(rawX, [-1, 1], [-7, 7]), { stiffness: 180, damping: 22 });
  const cardRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!isActive || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }, [isActive, rawX, rawY]);

  const onLeave = useCallback(() => { rawX.set(0); rawY.set(0); }, [rawX, rawY]);

  return (
    <motion.div
      ref={cardRef}
      /* position in the centre of the stage, then translate outward */
      className="absolute cursor-pointer select-none"
      style={{
        width: "clamp(190px, 22vw, 270px)",
        left: "50%",
        top: 0,
        marginLeft: "calc(clamp(190px, 22vw, 270px) / -2)",
        zIndex: lyt.z,
        transformStyle: "preserve-3d",
      }}
      animate={{
        translateX: lyt.translateX,
        scale: lyt.scale,
        opacity: lyt.opacity,
        rotateY: lyt.rotateY,
        filter: lyt.filter,
      }}
      initial={false}
      transition={{ type: "spring", stiffness: 300, damping: 34, mass: 0.85 }}
      onClick={!isActive ? onClick : undefined}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* inner wrapper carries mouse tilt + lift */}
      <motion.div
        style={{
          rotateX: isActive ? tiltX : 0,
          rotateY: isActive ? tiltY : 0,
          transformStyle: "preserve-3d",
        }}
        whileHover={isActive ? { y: -10 } : {}}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {/* glow halo behind card – active only */}
        {isActive && (
          <motion.div
            className="absolute -inset-[4px] rounded-[22px] pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 30%, ${a}60, transparent 70%)`, filter: "blur(24px)" }}
            animate={{ opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* card shell */}
        <div
          className="relative flex flex-col overflow-hidden rounded-[20px]"
          style={{
            height: "390px",
            background: "linear-gradient(165deg, rgba(22,24,32,0.96) 0%, rgba(14,15,20,0.98) 100%)",
            border: `1.5px solid ${isActive ? a + "50" : "rgba(255,255,255,0.055)"}`,
            backdropFilter: "blur(24px)",
            boxShadow: isActive
              ? `0 48px 120px rgba(0,0,0,0.85), 0 0 0 1px ${a}18, inset 0 1px 0 rgba(255,255,255,0.07)`
              : "0 24px 60px rgba(0,0,0,0.65)",
          }}
        >
          {/* ── Visual hero (top portion of card) ── */}
          <div className="relative overflow-hidden flex-shrink-0" style={{ height: "clamp(130px, 14vw, 180px)" }}>
            <CardVisual project={project} isActive={isActive} />
          </div>

          {/* ── Info panel ── */}
          <div className="flex flex-col flex-1 px-5 py-4 justify-between">
            <div>
              <h3
                className="font-mono font-bold tracking-tight leading-snug"
                style={{ fontSize: "clamp(12px, 1.3vw, 15px)", color: isActive ? "#fff" : "rgba(255,255,255,0.55)" }}
              >
                {project.name}
              </h3>

              <p
                className="mt-2 line-clamp-3 leading-relaxed"
                style={{ fontSize: "clamp(9px, 0.9vw, 11px)", color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}
              >
                {project.summary ?? project.description}
              </p>
            </div>

            <div>
              {/* tech tags */}
              <div className="mt-2 flex flex-wrap gap-1">
                {project.tech.slice(0, 3).map(t => (
                  <span key={t}
                    className="font-mono rounded"
                    style={{
                      fontSize: 9, padding: "2px 6px",
                      background: `${tc(t)}16`,
                      color: isActive ? tc(t) : "rgba(255,255,255,0.28)",
                      border: `1px solid ${tc(t)}${isActive ? "38" : "18"}`,
                    }}
                  >{t}</span>
                ))}
              </div>

              {/* GitHub button placeholder area */}
              <div className="mt-3 min-h-[32px] flex items-center">
                <AnimatePresence>
                  {isActive && project.link && (
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <a href={project.link} target="_blank" rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg font-mono font-semibold transition-all hover:scale-[1.02] active:scale-98"
                        style={{
                          fontSize: 11, padding: "6px 12px",
                          background: `linear-gradient(135deg, ${a}, ${a}99)`,
                          color: "#03110f",
                          boxShadow: `0 4px 15px ${a}45`,
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <GithubIcon /> View on GitHub <ArrowUpRightIcon />
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main carousel ───────────────────────────────────────────── */
export default function ProjectCarousel() {
  const [active, setActive] = useState(0);
  const total = projects.length;

  const prev = useCallback(() => setActive(a => (a - 1 + total) % total), [total]);
  const next = useCallback(() => setActive(a => (a + 1) % total), [total]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [prev, next]);

  const ts = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { ts.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (ts.current === null) return;
    const d = e.changedTouches[0].clientX - ts.current;
    if (Math.abs(d) > 40) d < 0 ? next() : prev();
    ts.current = null;
  };

  /* idle float on active card */
  const floatY = useMotionValue(0);
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const animate = (t: number) => {
      if (!start) start = t;
      floatY.set(Math.sin((t - start) / 1800) * 6);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [floatY]);

  return (
    <Section
      id="projects"
      name="Projects"
      command="terraform plan ./projects"
      comment="# open-source projects — infrastructure and platform tooling"
      className="scroll-mt-14 pt-4 pb-10 md:pt-6 md:pb-12"
    >
      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        {/* subtle grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(45,212,191,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.035) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />
        {/* radial spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{
          width: 700, height: 500, background: "rgba(45,212,191,0.04)", filter: "blur(90px)",
        }} />
        {/* floating orbs */}
        <motion.div className="absolute rounded-full"
          style={{ width: 200, height: 200, background: "#2dd4bf", top: "5%", left: "6%", opacity: 0.045, filter: "blur(60px)" }}
          animate={{ y: [0, -28, 0], x: [0, 14, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="absolute rounded-full"
          style={{ width: 160, height: 160, background: "#a855f7", bottom: "8%", right: "8%", opacity: 0.04, filter: "blur(50px)" }}
          animate={{ y: [0, 22, 0], x: [0, -12, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div className="absolute rounded-full"
          style={{ width: 120, height: 120, background: "#f59e0b", top: "55%", left: "3%", opacity: 0.035, filter: "blur(45px)" }}
          animate={{ y: [0, -18, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* ── Carousel stage (perspective container) ── */}
      <div
        className="relative mx-auto"
        style={{
          height: "clamp(340px, 42vw, 415px)",
          maxWidth: "960px",
          perspective: "1800px",
          perspectiveOrigin: "50% 38%",
          overflowX: "clip",
          overflowY: "visible",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {projects.map((p, i) => {
          const pos = getPos(i, active, total);
          return (
            <ProjectCard
              key={p.name}
              project={p}
              pos={pos}
              onClick={() => setActive(i)}
            />
          );
        })}
      </div>

      {/* ── Navigation controls ── */}
      <div className="mt-6 flex items-center justify-center gap-5">
        <motion.button onClick={prev}
          whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-iron bg-obsidian/80 text-muted backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-accent"
          aria-label="Previous project"
        ><ChevLeft /></motion.button>

        <div className="flex items-center gap-2">
          {projects.map((_, i) => (
            <motion.button key={i} onClick={() => setActive(i)}
              animate={{ width: i === active ? 28 : 8, opacity: i === active ? 1 : 0.32 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="h-[7px] rounded-full bg-accent"
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>

        <motion.button onClick={next}
          whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-iron bg-obsidian/80 text-muted backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-accent"
          aria-label="Next project"
        ><ChevRight /></motion.button>
      </div>

      {/* ── Counter ── */}
      <p className="mt-2 text-center font-mono text-[11px] text-muted/50">
        <span className="text-accent">{String(active + 1).padStart(2, "0")}</span>
        {" / "}
        {String(total).padStart(2, "0")}
        <span className="ml-3">← → keys · click side cards · swipe</span>
      </p>
    </Section>
  );
}
