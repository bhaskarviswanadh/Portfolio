import { motion } from "motion/react";
import Section from "@/components/Section";
import { itemVariants } from "@/components/Section";
import { awards, certifications } from "@/data";

const EXPO = [0.16, 1, 0.3, 1] as const;

export default function Certifications() {
  return (
    <Section
      id="certifications"
      name="Certifications"
      command="kubectl get certificates"
      comment="# verified, current"
    >
      {/* Cert rows */}
      <motion.div
        className="overflow-hidden rounded-lg border border-iron bg-obsidian/60"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
        }}
      >
        {certifications.map((c, i) => (
          <motion.div
            key={c.short}
            variants={{
              hidden: { opacity: 0, x: -24 },
              show: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.55, ease: EXPO },
              },
            }}
            className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-graphite/50 ${
              i !== 0 ? "border-t border-iron" : ""
            }`}
          >
            {/* Checkmark scales in with spring */}
            <motion.span
              className="font-mono text-accent"
              initial={{ scale: 0, rotate: -45 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: EXPO, delay: 0.1 + i * 0.07, type: "spring", stiffness: 350, damping: 18 }}
            >
              ✓
            </motion.span>

            {/* Short name clip-path reveal */}
            <div className="reveal-wrap w-20 shrink-0">
              <motion.span
                className="inline-block font-mono text-sm font-semibold text-bright"
                initial={{ y: "100%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EXPO, delay: 0.15 + i * 0.07 }}
              >
                {c.short}
              </motion.span>
            </div>

            <span className="flex-1 text-sm text-fg">{c.name}</span>

            <motion.span
              className="hidden font-mono text-xs text-muted sm:block"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
            >
              {c.issuer}
            </motion.span>
          </motion.div>
        ))}
      </motion.div>

      {/* Awards */}
      <div className="mt-8">
        <motion.div
          className="mb-4 font-mono text-sm text-muted"
          variants={itemVariants}
        >
          ❯ kubectl get events
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {awards.map((a, i) => (
            <motion.div
              key={a.title}
              variants={itemVariants}
              whileHover={{
                y: -3,
                borderColor: "rgba(45,212,191,0.35)",
                boxShadow: "0 8px 30px rgba(45,212,191,0.07)",
              }}
              transition={{ duration: 0.22, ease: EXPO }}
              className="relative overflow-hidden rounded-lg border border-iron bg-obsidian/60 px-5 py-4"
            >
              {/* Top-left accent glow on hover */}
              <div className="pointer-events-none absolute -top-6 -left-6 h-16 w-16 rounded-full bg-accent/0 group-hover:bg-accent/10 transition-all duration-500 blur-xl" />

              <div className="reveal-wrap">
                <motion.div
                  className="inline-block text-sm font-semibold text-bright"
                  initial={{ y: "110%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: EXPO, delay: 0.1 + i * 0.08 }}
                >
                  {a.title}
                </motion.div>
              </div>
              <motion.div
                className="mt-1 font-mono text-xs text-muted"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
              >
                {a.org} · {a.year}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}