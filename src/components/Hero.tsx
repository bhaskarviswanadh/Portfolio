import { motion, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { profile } from "@/data";
import TechMarquee from "@/components/TechMarquee";
import AnimatedTerminalPanel from "@/components/AnimatedTerminalPanel";
import { useTypewriter } from "@/hooks/useTypewriter";

/** Counts up from 0 to target once in view */
function CountUp({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState("0");

  useEffect(() => {
    if (!inView) return;
    // Try to parse a numeric value; if not numeric keep as-is after delay
    const numeric = parseFloat(value);
    if (isNaN(numeric)) {
      const t = setTimeout(() => setCount(value), 400);
      return () => clearTimeout(t);
    }
    const isFloat = value.includes(".");
    const duration = 900;
    const steps = 40;
    const increment = numeric / steps;
    let current = 0;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(isFloat ? current.toFixed(1) : String(Math.floor(current)));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [inView, value]);

  return (
    <div ref={ref} className="font-mono text-2xl font-bold text-bright">
      {count}{suffix}
    </div>
  );
}

export default function Hero() {
  const role = useTypewriter(profile.role, 48, 700);

  return (
    <section
      id="top"
      className="relative z-10 flex min-h-screen flex-col"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 pt-24 pb-10">
        <div className="grid w-full items-center gap-12 md:grid-cols-2">

          {/* ── Left column ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-iron bg-obsidian px-3 py-1 font-mono text-xs text-muted"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
              </span>
              {profile.availability}
            </motion.div>

            {/* Whoami command */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mb-3 font-mono text-sm text-muted"
            >
              ❯ kubectl auth whoami
            </motion.p>

            {/* Name — letters slide up */}
            <h1 className="text-4xl font-extrabold tracking-tight text-bright sm:text-5xl lg:text-6xl">
              {profile.name.split(" ").map((word, wi) => (
                <motion.span
                  key={wi}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + wi * 0.12, duration: 0.45, ease: "easeOut" }}
                  className="mr-3 inline-block last:mr-0"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Role — typewriter */}
            <p className="mt-3 font-mono text-base text-accent sm:text-lg min-h-[1.75rem]">
              {role}
              {role.length < profile.role.length && (
                <span className="inline-block w-[0.55ch] h-[1em] bg-accent ml-[2px] align-text-bottom animate-pulse" />
              )}
            </p>

            {/* Summary — fade in */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-6 max-w-md text-base leading-relaxed text-muted"
            >
              {profile.summary}
            </motion.p>

            {/* Stats — count up */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="mt-8 flex flex-wrap gap-6"
            >
              {profile.stats.map((s) => (
                <div key={s.label}>
                  <CountUp value={s.value} />
                  <div className="font-mono text-xs text-muted">{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <motion.a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="rounded-md bg-accent px-5 py-2.5 font-mono text-sm font-semibold text-[#04201c]"
              >
                aws s3 cp resume.pdf
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ y: -2, borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="rounded-md border border-iron px-5 py-2.5 font-mono text-sm text-fg transition-colors"
              >
                kubectl get contact
              </motion.a>
            </motion.div>
          </motion.div>

          {/* ── Right column — terminal ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            <AnimatedTerminalPanel />
          </motion.div>

        </div>
      </div>
      <TechMarquee />
    </section>
  );
}
