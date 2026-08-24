"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Piece } from "@/lib/chess/pieces";
import type { PieceColor } from "@/lib/chess/engine";
import type { PendingPromotion } from "@/hooks/use-chess-game";

interface PromotionDialogProps {
  pending: PendingPromotion | null;
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
  onCancel: () => void;
}

export function PromotionDialog({ pending, onSelect, onCancel }: PromotionDialogProps) {
  if (!pending) return null;
  const color: PieceColor = pending.color;
  const options: Array<"q" | "r" | "b" | "n"> = ["q", "r", "b", "n"];
  const labels: Record<string, string> = {
    q: "Queen",
    r: "Rook",
    b: "Bishop",
    n: "Knight",
  };

  return (
    <Dialog open={!!pending} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Promote your pawn</DialogTitle>
          <DialogDescription>
            Choose which piece your pawn becomes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2">
          {options.map((p) => (
            <button
              key={p}
              onClick={() => onSelect(p)}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-border bg-card p-3 transition-colors hover:border-emerald-500 hover:bg-emerald-500/10"
              aria-label={`Promote to ${labels[p]}`}
            >
              <div className="text-4xl leading-none">
                <Piece piece={{ type: p, color }} size={40} />
              </div>
              <span className="text-xs font-medium text-foreground">{labels[p]}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
