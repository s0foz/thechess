"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GameSettings } from "@/hooks/use-chess-game";
import type { Difficulty } from "@/lib/chess/ai";

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onApply: () => void;
}

export function SettingsPanel({ settings, onChange, onApply }: SettingsPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-3">
      <div className="text-sm font-semibold text-foreground">Game Settings</div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mode-select" className="text-xs text-muted-foreground">
            Opponent
          </Label>
          <Select
            value={settings.mode}
            onValueChange={(v) =>
              onChange({ ...settings, mode: v as "ai" | "human" })
            }
          >
            <SelectTrigger id="mode-select" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai">Computer (AI)</SelectItem>
              <SelectItem value="human">Two Players</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="color-select" className="text-xs text-muted-foreground">
            Play as
          </Label>
          <Select
            value={settings.playerColor}
            onValueChange={(v) =>
              onChange({ ...settings, playerColor: v as "w" | "b" })
            }
            disabled={settings.mode === "human"}
          >
            <SelectTrigger id="color-select" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="w">White</SelectItem>
              <SelectItem value="b">Black</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {settings.mode === "ai" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="diff-select" className="text-xs text-muted-foreground">
            Difficulty
          </Label>
          <Select
            value={settings.difficulty}
            onValueChange={(v) =>
              onChange({ ...settings, difficulty: v as Difficulty })
            }
          >
            <SelectTrigger id="diff-select" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy (random + shallow)</SelectItem>
              <SelectItem value="medium">Medium (depth 3)</SelectItem>
              <SelectItem value="hard">Hard (depth 3, no randomness)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <button
        onClick={onApply}
        className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Apply &amp; Start New Game
      </button>
    </div>
  );
}
