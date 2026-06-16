import { useEffect, useMemo, useRef, useState } from "react";
import { navItems, profile } from "@/data";

type Command = {
  id: string;
  label: string;
  hint: string;
  run: () => void;
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(() => {
    const go = (id: string) => () => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };
    return [
      ...navItems.map((n) => ({
        id: `goto-${n.id}`,
        label: `goto ${n.label}`,
        hint: "section",
        run: go(n.id),
      })),
      {
        id: "resume",
        label: "open resume.pdf",
        hint: "file",
        run: () => window.open(profile.resume, "_blank", "noopener"),
      },
      {
        id: "email",
        label: "copy email",
        hint: "action",
        run: () => navigator.clipboard?.writeText(profile.email),
      },
      {
        id: "github",
        label: "open github",
        hint: "link",
        run: () => window.open(profile.githubUrl, "_blank", "noopener"),
      },
      {
        id: "linkedin",
        label: "open linkedin",
        hint: "link",
        run: () => window.open(profile.linkedinUrl, "_blank", "noopener"),
      },
    ];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  // Global hotkey + reset on open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // focus after paint
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  const runIndex = (i: number) => {
    const cmd = results[i];
    if (!cmd) return;
    setOpen(false);
    cmd.run();
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runIndex(active);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        aria-label="Close command palette"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-iron bg-obsidian shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 border-b border-iron px-4">
          <span className="font-mono text-sm text-accent">❯</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onListKey}
            placeholder="type a command..."
            className="w-full bg-transparent py-3.5 font-mono text-sm text-fg outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-iron px-1.5 py-0.5 font-mono text-[10px] text-muted">
            esc
          </kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-4 py-3 font-mono text-sm text-muted">
              no matching commands
            </li>
          )}
          {results.map((c, i) => (
            <li key={c.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => runIndex(i)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left font-mono text-sm transition-colors ${
                  i === active ? "bg-graphite text-accent" : "text-fg"
                }`}
              >
                <span>
                  <span className="text-muted">❯</span> {c.label}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted">
                  {c.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
