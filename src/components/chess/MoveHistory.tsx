"use client";

import { useEffect, useRef } from "react";
import type { MoveRecord } from "@/lib/chess/engine";

export function MoveHistory({ moves }: { moves: MoveRecord[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  // Group moves into pairs (white, black).
  const pairs: Array<{ number: number; white?: MoveRecord; black?: MoveRecord }> = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card/50">
      <div className="border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold text-foreground">Move History</h3>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-1 text-sm"
        style={{ maxHeight: "320px", scrollbarWidth: "thin" }}
      >
        {pairs.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No moves yet. Make your first move!
          </div>
        ) : (
          <table className="w-full">
            <tbody>
              {pairs.map((pair) => (
                <tr key={pair.number} className="hover:bg-muted/40">
                  <td className="w-8 px-2 py-1 text-right text-xs text-muted-foreground">
                    {pair.number}.
                  </td>
                  <td className="px-2 py-1 font-mono text-xs text-foreground">
                    {pair.white?.san ?? ""}
                  </td>
                  <td className="px-2 py-1 font-mono text-xs text-foreground">
                    {pair.black?.san ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
