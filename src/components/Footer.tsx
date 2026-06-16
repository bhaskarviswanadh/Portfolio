import { profile } from "@/data";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-iron/70 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 font-mono text-xs text-muted sm:flex-row">
        <span>
          <span className="text-accent">❯</span> built with react, vite &amp;
          tailwind
        </span>
        <span>
          {profile.name} · {profile.location}
        </span>
      </div>
    </footer>
  );
}
