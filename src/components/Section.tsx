import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  id: string;
  name: string;
  command: string;
  comment?: string;
  children: ReactNode;
};

export default function Section({ id, name, command, comment, children }: Props) {
  return (
    <motion.section
      id={id}
      aria-label={name}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 mx-auto w-full max-w-5xl scroll-mt-24 px-6 py-16 md:py-24"
    >
      <div className="mb-10">
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
      </div>
      {children}
    </motion.section>
  );
}
