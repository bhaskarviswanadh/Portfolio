import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { useRef } from "react";
import Section from "@/components/Section";
import { itemVariants } from "@/components/Section";
import { experience } from "@/data";

const EXPO = [0.16, 1, 0.3, 1] as const;

/** 3D-tilt card that follows the cursor */
function TiltCard({ children, className }: { children: React.ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 24 });
  const sy = useSpring(y, { stiffness: 200, damping: 24 });
  const rotateX = useTransform(sy, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(sx, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ExperienceList() {
  return (
    <Section
      id="experience"
      name="Experience"
      command="kubectl get experience"
      comment="# internship experience in network operations & infrastructure"
    >
      <div className="space-y-5">
        {experience.map((job, idx) => (
          <motion.div
            key={job.id}
            variants={itemVariants}
            style={{ perspective: "1000px" }}
          >
            <TiltCard className="group relative overflow-hidden rounded-lg border border-iron bg-obsidian/60 p-5 transition-colors duration-300 hover:border-accent/40">

              {/* Gradient shine sweep on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(45,212,191,0.04), transparent 60%)"
                }}
              />

              <div className="grid gap-2 md:grid-cols-12 md:gap-4">
                <div className="col-span-3 font-mono text-sm text-accent font-semibold">
                  {job.role}
                </div>
                <div className="col-span-5 font-mono text-base font-semibold text-bright">
                  {job.company}
                </div>
                <div className="col-span-2 font-mono text-xs text-muted">
                  {job.location}
                </div>
                <div className="col-span-2 font-mono text-xs text-muted">
                  {job.duration}
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {job.bullets.map((b, i) => (
                  <motion.li
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed text-fg"
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: EXPO, delay: 0.05 + i * 0.06 + idx * 0.04 }}
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{b}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.tech.map((t, i) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, ease: EXPO, delay: 0.1 + i * 0.04 + idx * 0.03 }}
                    whileHover={{ scale: 1.1, color: "var(--color-accent)", borderColor: "var(--color-accent)" }}
                    className="rounded border border-iron bg-graphite px-2 py-0.5 font-mono text-xs text-muted transition-colors"
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
