import { useEffect, useState } from "react";
import { navItems, profile } from "@/data";

export default function Nav() {
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll-spy: highlight the section currently in view
  useEffect(() => {
    const ids = navItems.map((n) => n.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const openPalette = () =>
    window.dispatchEvent(new Event("open-command-palette"));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-iron/70 bg-void/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <a
          href="#top"
          className="font-mono text-sm font-medium text-bright transition-colors hover:text-accent"
        >
          <span className="text-accent">❯</span> bhaskar.dev
        </a>

        {/* desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`font-mono text-sm transition-colors hover:text-accent ${
                active === item.id ? "text-accent" : "text-muted"
              }`}
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={openPalette}
            className="flex items-center gap-1.5 rounded-md border border-iron px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            aria-label="Open command palette"
          >
            <span>⌘</span>K
          </button>
          <a
            href={profile.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-accent/40 px-3 py-1.5 font-mono text-sm text-accent transition-colors hover:bg-accent/10"
          >
            resume
          </a>
        </div>

        {/* mobile controls */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={openPalette}
            className="rounded-md border border-iron px-2 py-1 font-mono text-xs text-muted"
            aria-label="Open command palette"
          >
            ⌘K
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`h-0.5 w-5 bg-fg transition-transform ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-fg transition-opacity ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-fg transition-transform ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-iron bg-void px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className={`font-mono text-sm transition-colors hover:text-accent ${
                  active === item.id ? "text-accent" : "text-muted"
                }`}
              >
                ❯ {item.label}
              </a>
            ))}
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="mt-1 w-fit rounded-md border border-accent/40 px-3 py-1.5 font-mono text-sm text-accent"
            >
              resume
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
