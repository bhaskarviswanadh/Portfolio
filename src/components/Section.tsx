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

const EXPO = [0.16, 1, 0.3, 1] as const;

export const itemVariants = {
  hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)",
            transition: { duration: 0.55, ease: EXPO } },
};

export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
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
      {/* Heading block — uses section stagger variant so it always appears */}
      <motion.div className="mb-10" variants={itemVariants}>
        <div className="relative inline-block">
          <h2 className="font-mono text-base text-accent md:text-lg">
            <span className="sr-only">{name}</span>
            <span aria-hidden="true">
              {/* Arrow slides in slightly from left */}
              <motion.span
                className="text-muted"
                variants={{
                  hidden: { opacity: 0, x: -8 },
                  show:   { opacity: 1, x: 0, transition: { duration: 0.4, ease: EXPO } },
                }}
              >
                ❯
              </motion.span>
              {" "}
              {/* Command text: simple opacity + slight upward slide — no clip-path so it never hides */}
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EXPO, delay: 0.08 } },
                }}
              >
                {command}
              </motion.span>
            </span>
          </h2>

          {/* Accent underline draws in from left */}
          <motion.div
            className="absolute -bottom-1 left-0 h-px bg-accent/40"
            style={{ width: "100%", transformOrigin: "left" }}
            variants={{
              hidden: { scaleX: 0 },
              show:   { scaleX: 1, transition: { duration: 0.7, ease: EXPO, delay: 0.3 } },
            }}
          />
        </div>

        {comment && (
          <motion.p
            className="mt-2 font-mono text-xs text-muted"
            aria-hidden="true"
            variants={{
              hidden: { opacity: 0 },
              show:   { opacity: 1, transition: { duration: 0.5, delay: 0.45 } },
            }}
          >
            {comment}
          </motion.p>
        )}
      </motion.div>

      {children}
    </motion.section>
  );
}
