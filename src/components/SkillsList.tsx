import { motion } from "motion/react";
import Section from "@/components/Section";
import { itemVariants } from "@/components/Section";
import { skills } from "@/data";

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  show:   { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 350, damping: 22 } },
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
        {skills.map((group) => (
          <motion.div
            key={group.label}
            variants={itemVariants}
            className="rounded-lg border border-iron bg-obsidian/60 p-5"
          >
            <div className="font-mono text-sm text-accent">
              {group.label}:
            </div>
            <motion.div
              className="mt-3 flex flex-wrap gap-2"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            >
              {group.items.map((item) => (
                <motion.span
                  key={item}
                  variants={badgeVariants}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "var(--color-accent)",
                    color: "var(--color-accent)",
                  }}
                  transition={{ duration: 0.15 }}
                  className="rounded border border-iron bg-graphite px-2.5 py-1 font-mono text-xs text-fg"
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
