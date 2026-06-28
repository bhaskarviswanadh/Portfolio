import { motion } from "motion/react";
import Section from "@/components/Section";
import { itemVariants } from "@/components/Section";
import { skills } from "@/data";

const EXPO = [0.16, 1, 0.3, 1] as const;

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.65, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 420, damping: 18 },
  },
};

export default function SkillsList() {
  return (
    <Section
      id="skills"
      name="Skills"
      command="gcloud components list"
      comment="# the tools I reach for"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {skills.map((group, gi) => (
          /*
           * FIX: NO whileHover on the card — Framer Motion propagates
           * whileHover from parent to all motion children, triggering every
           * badge at once. Use plain CSS transition classes instead.
           */
          <motion.div
            key={group.label}
            variants={itemVariants}
            className="group relative overflow-hidden rounded-lg border border-iron bg-obsidian/60 p-5
                       transition-all duration-300
                       hover:border-accent/30 hover:shadow-[0_0_24px_0px_rgba(45,212,191,0.08)]"
          >
            {/* label — simple fade+slide, no clip-path wrapper */}
            <motion.div
              className="font-mono text-sm text-accent"
              variants={{
                hidden: { opacity: 0, y: 6 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EXPO, delay: gi * 0.06 } },
              }}
            >
              {group.label}:
            </motion.div>

            {/* badges — stagger in with spring pop */}
            <motion.div
              className="mt-3 flex flex-wrap gap-2"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 + gi * 0.06 } },
              }}
            >
              {group.items.map((item) => (
                /*
                 * FIX: whileHover ONLY on each individual badge — because the
                 * parent no longer has whileHover, Framer Motion won't cascade
                 * hover state down to children.
                 */
                <motion.span
                  key={item}
                  variants={badgeVariants}
                  whileHover={{
                    scale: 1.12,
                    y: -2,
                    borderColor: "var(--color-accent)",
                    color: "var(--color-accent)",
                    backgroundColor: "rgba(45,212,191,0.08)",
                    boxShadow: "0 0 10px rgba(45,212,191,0.22)",
                  }}
                  transition={{ duration: 0.15 }}
                  className="rounded border border-iron bg-graphite px-2.5 py-1 font-mono text-xs text-fg"
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>

            {/* corner accent dot — CSS group-hover opacity, not motion */}
            <motion.div
              className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-accent/40"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 + gi * 0.1, type: "spring", stiffness: 400 }}
            />
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
