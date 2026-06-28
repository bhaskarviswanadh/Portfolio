import { motion } from "motion/react";
import Section from "@/components/Section";
import { itemVariants } from "@/components/Section";
import { profile } from "@/data";

export default function Contact() {
  const rows: { key: string; value: string; href: string }[] = [
    { key: "email", value: profile.email, href: `mailto:${profile.email}` },
    {
      key: "linkedin",
      value: profile.linkedin,
      href: profile.linkedinUrl,
    },
    { key: "github", value: profile.github, href: profile.githubUrl },
    { key: "resume", value: "Bhaskar Viswanadh Devisetti.pdf", href: profile.resume },
  ];

  return (
    <Section
      id="contact"
      name="Contact"
      command="kubectl get contact -o json"
      comment="# open to Cloud & DevOps opportunities"
    >
      <motion.div
        variants={itemVariants}
        className="overflow-hidden rounded-lg border border-iron bg-obsidian font-mono text-sm"
      >
        <div className="flex items-center gap-2 border-b border-iron bg-graphite px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 text-xs text-muted">~/bhaskar</span>
        </div>
        <motion.div
          className="px-5 py-4 leading-relaxed"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
        >
          <motion.div className="text-muted" variants={itemVariants}>{"{"}</motion.div>
          {rows.map((r, i) => (
            <motion.div
              key={r.key}
              variants={{
                hidden: { opacity: 0, x: -10 },
                show:   { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
              }}
              className="pl-4"
            >
              <span className="text-accent">"{r.key}"</span>
              <span className="text-muted">: </span>
              <motion.a
                href={r.href}
                target={r.href.startsWith("mailto") ? undefined : "_blank"}
                rel={r.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                whileHover={{ color: "var(--color-accent)" }}
                transition={{ duration: 0.15 }}
                className="text-fg underline decoration-iron underline-offset-4 transition-colors"
              >
                "{r.value}"
              </motion.a>
              <span className="text-muted">
                {i < rows.length - 1 ? "," : ""}
              </span>
            </motion.div>
          ))}
          <motion.div className="text-muted" variants={itemVariants}>{"}"}</motion.div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
