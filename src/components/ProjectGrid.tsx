import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { useRef } from "react";
import Section from "@/components/Section";
import { itemVariants } from "@/components/Section";
import { projects } from "@/data";

const EXPO = [0.16, 1, 0.3, 1] as const;

function ProjectCard({ p, delay }: { p: (typeof projects)[number]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 22 });
  const rotateX = useTransform(springY, [0, 1], ["5deg", "-5deg"]);
  const rotateY = useTransform(springX, [0, 1], ["-5deg", "5deg"]);
  const glowX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(springY, [0, 1], ["0%", "100%"]);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => { mouseX.set(0.5); mouseY.set(0.5); };

  return (
    <motion.div
      variants={itemVariants}
      style={{ perspective: "800px" }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ borderColor: "rgba(45,212,191,0.35)" }}
        transition={{ borderColor: { duration: 0.25 } }}
        className="group relative flex flex-col overflow-hidden rounded-lg border border-iron bg-obsidian/60 p-5 h-full"
      >
        {/* Dynamic cursor-tracked radial glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(320px circle at ${glowX} ${glowY}, rgba(45,212,191,0.07), transparent 70%)`,
          } as React.CSSProperties}
        />

        {/* Top row: name + github link */}
        <div className="relative flex items-baseline justify-between gap-2 font-mono text-sm">
          <div className="flex items-baseline gap-2">
            <motion.span
              className="text-accent"
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 90, scale: 1.3 }}
              transition={{ duration: 0.25, ease: EXPO }}
            >
              +
            </motion.span>
            <span className="font-semibold text-bright">{p.name}</span>
          </div>
          {p.link && (
            <motion.a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 2, y: -2, color: "var(--color-accent)" }}
              transition={{ duration: 0.18 }}
              className="underline-draw text-xs text-muted"
              aria-label={`View ${p.name} on GitHub`}
            >
              github ↗
            </motion.a>
          )}
        </div>

        <div className="mt-1 font-mono text-xs text-muted">
          @ {p.context}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-fg flex-1">
          {p.description}
        </p>

        {/* Tech badges */}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {p.tech.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, ease: EXPO, delay: delay + i * 0.04 }}
              whileHover={{
                scale: 1.08,
                borderColor: "var(--color-accent)",
                color: "var(--color-accent)",
              }}
              className="rounded border border-iron bg-graphite px-2 py-0.5 font-mono text-xs text-muted"
            >
              {t}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectGrid() {
  return (
    <Section
      id="projects"
      name="Projects"
      command="terraform plan ./projects"
      comment="# open-source projects — infrastructure and platform tooling"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p.name} p={p} delay={0.05 + i * 0.06} />
        ))}
      </div>
    </Section>
  );
}
