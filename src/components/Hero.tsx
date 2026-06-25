import { motion } from "motion/react";
import { profile } from "@/data";
import TechMarquee from "@/components/TechMarquee";
import AnimatedTerminalPanel from "@/components/AnimatedTerminalPanel";


export default function Hero() {
  return (
    <section
      id="top"
      className="relative z-10 flex min-h-screen flex-col"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 pt-24 pb-10">
        <div className="grid w-full items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-iron bg-obsidian px-3 py-1 font-mono text-xs text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
            </span>
            {profile.availability}
          </div>

          <p className="mb-3 font-mono text-sm text-muted">
            ❯ kubectl auth whoami
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-bright sm:text-5xl lg:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-3 font-mono text-base text-accent sm:text-lg">
            {profile.role}
          </p>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            {profile.summary}
          </p>

          <div className="mt-8 flex flex-wrap gap-6">
            {profile.stats.map((s) => (
              <div key={s.label}>
                <div className="font-mono text-2xl font-bold text-bright">
                  {s.value}
                </div>
                <div className="font-mono text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-accent px-5 py-2.5 font-mono text-sm font-semibold text-[#04201c] transition-transform hover:-translate-y-0.5"
            >
              aws s3 cp resume.pdf
            </a>
            <a
              href="#contact"
              className="rounded-md border border-iron px-5 py-2.5 font-mono text-sm text-fg transition-colors hover:border-accent hover:text-accent"
            >
              kubectl get contact
            </a>
          </div>
        </motion.div>

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
