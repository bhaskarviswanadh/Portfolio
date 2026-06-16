import Section from "@/components/Section";
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
      <div className="overflow-hidden rounded-lg border border-iron bg-obsidian font-mono text-sm">
        <div className="flex items-center gap-2 border-b border-iron bg-graphite px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 text-xs text-muted">~/bhaskar</span>
        </div>
        <div className="px-5 py-4 leading-relaxed">
          <div className="text-muted">{"{"}</div>
          {rows.map((r, i) => (
            <div key={r.key} className="pl-4">
              <span className="text-accent">"{r.key}"</span>
              <span className="text-muted">: </span>
              <a
                href={r.href}
                target={r.href.startsWith("mailto") ? undefined : "_blank"}
                rel={
                  r.href.startsWith("mailto")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="text-fg underline decoration-iron underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                "{r.value}"
              </a>
              <span className="text-muted">
                {i < rows.length - 1 ? "," : ""}
              </span>
            </div>
          ))}
          <div className="text-muted">{"}"}</div>
        </div>
      </div>
    </Section>
  );
}
