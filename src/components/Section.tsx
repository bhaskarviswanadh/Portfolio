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
      {/* Heading block — reveal with clip-path + accent line draw */}
      <motion.div className="mb-10" variants={itemVariants}>
        <div className="relative inline-block">
          <h2 className="font-mono text-base text-accent md:text-lg">
            <span className="sr-only">{name}</span>
            <span aria-hidden="true">
              {/* Arrow pops in first */}
              <motion.span
                className="text-muted"
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: EXPO, delay: 0.05 }}
              >
                ❯
              </motion.span>{" "}
              {/* Command text reveals char by char with clip-path */}
              <span className="reveal-wrap">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EXPO, delay: 0.12 }}
                >
                  {command}
                </motion.span>
              </span>
            </span>
          </h2>

          {/* Accent underline draws in from left */}
          <motion.div
            className="absolute -bottom-1 left-0 h-px bg-accent/40"
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: EXPO, delay: 0.35 }}
            style={{ width: "100%" }}
          />
        </div>

        {comment && (
          <motion.p
            className="mt-2 font-mono text-xs text-muted"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {comment}
          </motion.p>
        )}
      </motion.div>

      {children}
    </motion.section>
  );
}
