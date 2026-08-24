"use client";

import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Plus,
  FlipHorizontal,
  Copy,
  Download,
} from "lucide-react";

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onFlip: () => void;
  onCopyFen: () => void;
  onCopyPgn: () => void;
  canUndo: boolean;
  isGameOver: boolean;
}

export function GameControls({
  onNewGame,
  onUndo,
  onFlip,
  onCopyFen,
  onCopyPgn,
  canUndo,
  isGameOver,
}: GameControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <Button onClick={onNewGame} variant="default" className="gap-2">
        <Plus className="h-4 w-4" />
        New Game
      </Button>
      <Button
        onClick={onUndo}
        variant="secondary"
        className="gap-2"
        disabled={!canUndo}
      >
        <RotateCcw className="h-4 w-4" />
        Undo
      </Button>
      <Button onClick={onFlip} variant="secondary" className="gap-2">
        <FlipHorizontal className="h-4 w-4" />
        Flip
      </Button>
      <Button onClick={onCopyFen} variant="outline" className="gap-2">
        <Copy className="h-4 w-4" />
        Copy FEN
      </Button>
      <Button onClick={onCopyPgn} variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Copy PGN
      </Button>
    </div>
  );
}
