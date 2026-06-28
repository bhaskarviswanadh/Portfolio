import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { profile } from "@/data";
import TechMarquee from "@/components/TechMarquee";
import AnimatedTerminalPanel from "@/components/AnimatedTerminalPanel";
import { useTypewriter } from "@/hooks/useTypewriter";

/* ─── Custom easing (matches Linear / Vercel's feel) ────── */
const EXPO = [0.16, 1, 0.3, 1] as const;

/* ─── Clip-path text reveal (the "cinema curtain" effect) ── */
function RevealWord({ word, delay = 0 }: { word: string; delay?: number }) {
  return (
    <span className="reveal-wrap mr-[0.25em] last:mr-0">
      <motion.span
        className="inline-block"
        initial={{ y: "110%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 0.75, ease: EXPO, delay }}
      >
        {word}
      </motion.span>
    </span>
  );
}

/* ─── Premium count-up with ticker-flip effect ─────────── */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");
  const [ticking, setTicking] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(value);
    if (isNaN(num)) {
      setTimeout(() => { setDisplay(value); setTicking(true); }, 300);
      return;
    }
    const isFloat = value.includes(".");
    const DURATION = 1100;
    const STEPS = 50;
    let step = 0;
    // Ease-out curve: progress is slow at end
    const interval = setInterval(() => {
      step++;
      const t = step / STEPS;
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const curr = num * eased;
      if (step >= STEPS) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(isFloat ? curr.toFixed(1) : String(Math.floor(curr)));
      }
      setTicking(true);
    }, DURATION / STEPS);
    return () => clearInterval(interval);
  }, [inView, value]);

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        key={display}
        initial={{ y: ticking ? 14 : 0, opacity: ticking ? 0 : 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.18, ease: EXPO }}
        className="font-mono text-2xl font-bold text-bright tabular-nums"
      >
        {display}
      </motion.div>
    </div>
  );
}

/* ─── Magnetic button (follows cursor within bounds) ──────── */
function MagneticButton({
  children,
  className,
  href,
  target,
  rel,
}: {
  children: React.ReactNode;
  className: string;
  href: string;
  target?: string;
  rel?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 20 });
  const sy = useSpring(y, { stiffness: 280, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

export default function Hero() {
  const role = useTypewriter(profile.role, 44, 900);
  const isDone = role.length >= profile.role.length;

  return (
    <section id="top" className="relative z-10 flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 pt-24 pb-10">
        <div className="grid w-full items-center gap-12 md:grid-cols-2">

          {/* ── LEFT ── */}
          <div>
            {/* Availability badge — slides in from left */}
            <motion.div
              initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0,   filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: EXPO, delay: 0.1 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-iron bg-obsidian px-3 py-1 font-mono text-xs text-muted glow-idle"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
              </span>
              {profile.availability}
            </motion.div>

            {/* Whoami — blur-to-sharp */}
            <motion.p
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.55, ease: EXPO, delay: 0.25 }}
              className="mb-4 font-mono text-sm text-muted"
            >
              ❯ kubectl auth whoami
            </motion.p>

            {/* Name — clip-path cinema reveal, word by word */}
            <h1 className="text-4xl font-extrabold tracking-tight text-bright sm:text-5xl lg:text-6xl leading-tight">
              {profile.name.split(" ").map((w, i) => (
                <RevealWord key={i} word={w} delay={0.3 + i * 0.1} />
              ))}
            </h1>

            {/* Role — typewriter with shimmer when done */}
            <div className="mt-4 font-mono text-base sm:text-lg min-h-[1.75rem]">
              {isDone ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-shimmer"
                >
                  {profile.role}
                </motion.span>
              ) : (
                <span className="text-accent">
                  {role}
                  <span className="inline-block w-[0.5ch] h-[1.05em] bg-accent ml-[2px] align-text-bottom animate-pulse" />
                </span>
              )}
            </div>

            {/* Summary — blur + fade with slight y */}
            <motion.p
              initial={{ opacity: 0, y: 12, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: EXPO, delay: 1.15 }}
              className="mt-6 max-w-md text-base leading-relaxed text-muted"
            >
              {profile.summary}
            </motion.p>

            {/* Stats — stagger count-up */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 1.35 } } }}
              className="mt-8 flex flex-wrap gap-8"
            >
              {profile.stats.map((s) => (
                <motion.div
                  key={s.label}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EXPO } },
                  }}
                >
                  <CountUp value={s.value} />
                  <div className="mt-0.5 font-mono text-xs text-muted">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs — magnetic + shine sweep */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EXPO, delay: 1.65 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <MagneticButton
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine rounded-md bg-accent px-5 py-2.5 font-mono text-sm font-semibold text-[#04201c] select-none"
              >
                aws s3 cp resume.pdf
              </MagneticButton>

              <MagneticButton
                href="#contact"
                className="rounded-md border border-iron px-5 py-2.5 font-mono text-sm text-fg hover:border-accent hover:text-accent transition-colors duration-300 select-none"
              >
                kubectl get contact
              </MagneticButton>
            </motion.div>
          </div>

          {/* ── RIGHT — terminal panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: EXPO, delay: 0.2 }}
          >
            <AnimatedTerminalPanel />
          </motion.div>

        </div>
      </div>
      <TechMarquee />
    </section>
  );
}
