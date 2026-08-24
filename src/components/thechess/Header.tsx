"use client";

import { Crown, Globe2, Github } from "lucide-react";

export type TabId = "home" | "play" | "puzzles" | "learn" | "analysis" | "stats";

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  previewUrl: string;
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "home", label: "Home" },
  { id: "play", label: "Play" },
  { id: "puzzles", label: "Puzzles" },
  { id: "learn", label: "Learn" },
  { id: "analysis", label: "Analysis" },
  { id: "stats", label: "Stats" },
];

export function Header({ activeTab, onTabChange, previewUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-2 sm:px-4">
        <button
          onClick={() => onTabChange("home")}
          className="flex flex-shrink-0 items-center gap-2"
          aria-label="thechess home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-zinc-900 to-zinc-700 text-lg text-white shadow">
            ♞
          </div>
          <span className="text-base font-bold lowercase tracking-tight text-foreground">
            thechess
          </span>
        </button>

        {/* Desktop tabs */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Mobile select */}
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as TabId)}
          className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm md:hidden"
          aria-label="Navigate"
        >
          {TABS.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>

        <a
          href={previewUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 hidden flex-shrink-0 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:inline-block"
        >
          Open Site
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <div className="text-xs text-muted-foreground">
          <div className="font-semibold text-foreground">thechess</div>
          <div>Built with Next.js, chess.js, and Tailwind CSS.</div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <a
            href="https://github.com/jhlywa/chess.js"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <Github className="h-3 w-3" />
            chess.js
          </a>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Globe2 className="h-3 w-3" />
            Custom domain ready
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Crown className="h-3 w-3" />
            No signup required
          </span>
        </div>
      </div>
    </footer>
  );
}
