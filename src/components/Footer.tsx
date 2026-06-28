import { motion } from "motion/react";
import { profile } from "@/data";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 border-t border-iron/70 px-6 py-8"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 font-mono text-xs text-muted sm:flex-row">
        <span>
          <span className="text-accent">❯</span> built with react, vite &amp;
          tailwind
        </span>
        <span>
          {profile.name} · {profile.location}
        </span>
      </div>
    </motion.footer>
  );
}
