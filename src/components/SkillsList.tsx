import Section from "@/components/Section";
import { skills } from "@/data";

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
          <div
            key={group.label}
            className="rounded-lg border border-iron bg-obsidian/60 p-5"
          >
            <div className="font-mono text-sm text-accent">
              {group.label}:
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded border border-iron bg-graphite px-2.5 py-1 font-mono text-xs text-fg"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
