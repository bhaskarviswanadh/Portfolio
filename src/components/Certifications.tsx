import Section from "@/components/Section";
import { awards, certifications } from "@/data";

export default function Certifications() {
  return (
    <Section
      id="certifications"
      name="Certifications"
      command="kubectl get certificates"
      comment="# verified, current"
    >
      <div className="overflow-hidden rounded-lg border border-iron bg-obsidian/60">
        {certifications.map((c, i) => (
          <div
            key={c.short}
            className={`flex items-center gap-4 px-5 py-4 ${
              i !== 0 ? "border-t border-iron" : ""
            }`}
          >
            <span className="font-mono text-accent">✓</span>
            <span className="w-20 shrink-0 font-mono text-sm font-semibold text-bright">
              {c.short}
            </span>
            <span className="flex-1 text-sm text-fg">{c.name}</span>
            <span className="hidden font-mono text-xs text-muted sm:block">
              {c.issuer}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-3 font-mono text-sm text-muted">
          ❯ kubectl get events
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {awards.map((a) => (
            <div
              key={a.title}
              className="rounded-lg border border-iron bg-obsidian/60 px-5 py-4"
            >
              <div className="text-sm font-semibold text-bright">
                {a.title}
              </div>
              <div className="mt-1 font-mono text-xs text-muted">
                {a.org} · {a.year}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
