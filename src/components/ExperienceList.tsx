import Section from "@/components/Section";
import { experience } from "@/data";

export default function ExperienceList() {
  return (
    <Section
      id="experience"
      name="Experience"
      command="kubectl get experience"
      comment="# internship experience in network operations & infrastructure"
    >
      <div className="space-y-4">
        {/* column header, kubectl-style */}
        <div className="hidden grid-cols-12 gap-4 px-4 font-mono text-xs uppercase tracking-wider text-muted md:grid">
          <span className="col-span-5">name</span>
          <span className="col-span-3">role</span>
          <span className="col-span-2">duration</span>
          <span className="col-span-2">status</span>
        </div>

        {experience.map((job) => (
          <div
            key={job.id}
            className="group rounded-lg border border-iron bg-obsidian/60 p-5 transition-colors hover:border-accent/40"
          >
            <div className="grid gap-2 md:grid-cols-12 md:gap-4">
              <div className="col-span-5 font-mono text-base font-semibold text-bright">
                {job.company}
              </div>
              <div className="col-span-3 font-mono text-sm text-accent">
                {job.role}
              </div>
              <div className="col-span-2 font-mono text-xs text-muted">
                {job.duration}
              </div>
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-xs ${
                    job.status === "Running" ? "text-ok" : "text-muted"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      job.status === "Running" ? "bg-ok" : "bg-muted"
                    }`}
                  />
                  {job.status}
                </span>
              </div>
            </div>

            <div className="mt-1 font-mono text-xs text-muted md:hidden">
              {job.location}
            </div>
            <p className="mt-1 hidden font-mono text-xs text-muted md:block">
              {job.location}
            </p>

            <ul className="mt-4 space-y-2">
              {job.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm leading-relaxed text-fg"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              {job.tech.map((t) => (
                <span
                  key={t}
                  className="rounded border border-iron bg-graphite px-2 py-0.5 font-mono text-xs text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
