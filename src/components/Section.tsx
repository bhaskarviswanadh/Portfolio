import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  id: string;
  name: string;
  command: string;
  comment?: string;
  children: ReactNode;
  className?: string;
};

/** Shared variants so child components can opt-in to the stagger cascade */
export const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.45, ease: "easeOut" } },
};

export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export default function Section({ id, name, command, comment, children, className }: Props) {
  return (
    <motion.section
      id={id}
      aria-label={name}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
      className={`relative z-10 mx-auto w-full max-w-5xl px-6 ${className || "scroll-mt-24 py-16 md:py-24"}`}
    >
      {/* Section heading animates in first */}
      <motion.div className="mb-10" variants={itemVariants}>
        <h2 className="font-mono text-base text-accent md:text-lg">
          <span className="sr-only">{name}</span>
          <span aria-hidden="true">
            <span className="text-muted">❯</span> {command}
          </span>
        </h2>
        {comment && (
          <p className="mt-2 font-mono text-xs text-muted" aria-hidden="true">
            {comment}
          </p>
        )}
      </motion.div>
      {children}
    </motion.section>
  );
}
