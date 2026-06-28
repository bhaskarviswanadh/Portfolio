import { motion } from "motion/react";
import Section from "@/components/Section";
import { itemVariants } from "@/components/Section";
import { awards, certifications } from "@/data";

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Certifications() {
  return (
    <Section
      id="certifications"
      name="Certifications"
      command="kubectl get certificates"
      comment="# verified, current"
    >
      <motion.div
        className="overflow-hidden rounded-lg border border-iron bg-obsidian/60"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        {certifications.map((c, i) => (
          <motion.div
            key={c.short}
            variants={rowVariants}
            className={`flex items-center gap-4 px-5 py-4 ${i !== 0 ? "border-t border-iron" : ""}`}
          >
            <span className="font-mono text-accent">✓</span>
            <span className="w-20 shrink-0 font-mono text-sm font-semibold text-bright">
              {c.short}
            </span>
            <span className="flex-1 text-sm text-fg">{c.name}</span>
            <span className="hidden font-mono text-xs text-muted sm:block">
              {c.issuer}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6">
        <motion.div
          className="mb-3 font-mono text-sm text-muted"
          variants={itemVariants}
        >
          ❯ kubectl get events
        </motion.div>
        <div className="grid gap-3 sm:grid-cols-2">
          {awards.map((a) => (
            <motion.div
              key={a.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02, borderColor: "color-mix(in srgb, var(--color-accent) 40%, transparent)" }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border border-iron bg-obsidian/60 px-5 py-4"
            >
              <div className="text-sm font-semibold text-bright">
                {a.title}
              </div>
              <div className="mt-1 font-mono text-xs text-muted">
                {a.org} · {a.year}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}