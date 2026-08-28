"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogoMark } from "./Logo";
import { AuthModal } from "./AuthModal";
import {
  PIECE_SKINS,
  BOARD_SKINS,
  TITLES,
  type PieceSkin,
  type BoardSkin,
  type Title,
  getPieceSkin,
  getBoardSkin,
  getTitle,
} from "@/lib/thechess/shop";
import { Piece } from "@/lib/chess/pieces";
import { tierForRating } from "@/lib/thechess/tiers";
import { toast } from "sonner";
import {
  Coins,
  Check,
  Lock,
  Sparkles,
  Crown,
  Palette,
  Shield,
  Loader2,
  Eye,
} from "lucide-react";

type Tab = "pieces" | "boards" | "titles";

interface ShopSectionProps {
  /** Called after a buy/equip to refresh the user's session. */
  onUserUpdate?: () => void;
}

export function ShopSection({ onUserUpdate }: ShopSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>("pieces");
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null); // item id being bought/equipped

  if (!isAuthenticated || !user) {
    return (
      <>
        <section className="px-4 py-16">
          <div className="mx-auto max-w-md text-center fade-in-up">
            <LogoMark size={48} className="mx-auto mb-3 float" />
            <h2 className="text-xl font-bold text-foreground">Sign in to visit the shop</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Earn pieces by capturing in games. Spend them on chess piece skins, board skins, and titles.
            </p>
            <Button className="mt-4" onClick={() => setAuthOpen(true)}>Sign in / Sign up</Button>
          </div>
        </section>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} initialMode="signup" />
      </>
    );
  }

  const ownedSkins = new Set(user.ownedSkins);
  const ownedTitles = new Set(user.ownedTitles);

  const buy = async (type: "piece-skin" | "board-skin" | "title", id: string) => {
    setBusy(`${type}:${id}:buy`);
    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Purchase failed");
        return;
      }
      toast.success("Item purchased!", {
        description: `−${PIECE_SKINS.find((s) => s.id === id)?.cost ?? BOARD_SKINS.find((s) => s.id === id)?.cost ?? TITLES.find((t) => t.id === id)?.cost} pieces`,
      });
      // Auto-equip the newly purchased item.
      await equip(type, id, false);
      onUserUpdate?.();
    } finally {
      setBusy(null);
    }
  };

  const equip = async (type: "piece-skin" | "board-skin" | "title", id: string, showToast = true) => {
    setBusy(`${type}:${id}:equip`);
    try {
      const res = await fetch("/api/shop/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Equip failed");
        return;
      }
      if (showToast) toast.success("Equipped!");
      onUserUpdate?.();
    } finally {
      setBusy(null);
    }
  };

  const unequipTitle = async () => {
    setBusy("title:unequip");
    try {
      await fetch("/api/shop/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "title", id: null }),
      });
      toast.success("Title unequipped");
      onUserUpdate?.();
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 fade-in-up">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <Sparkles className="h-6 w-6 text-amber-400" />
              Shop
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Spend pieces on skins & titles. Earn more by capturing pieces in games.
            </p>
          </div>
          <div className="neo-raised flex items-center gap-2 px-4 py-2">
            <Coins className="h-5 w-5 text-amber-400" />
            <span className="text-xl font-bold text-foreground">{user.pieces}</span>
            <span className="text-xs text-muted-foreground">pieces</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 inline-flex neo-inset gap-1 rounded-2xl p-1.5 fade-in-up">
          <TabButton active={tab === "pieces"} onClick={() => setTab("pieces")} icon={<Palette className="h-4 w-4" />}>
            Piece Skins ({PIECE_SKINS.length})
          </TabButton>
          <TabButton active={tab === "boards"} onClick={() => setTab("boards")} icon={<Shield className="h-4 w-4" />}>
            Board Skins ({BOARD_SKINS.length})
          </TabButton>
          <TabButton active={tab === "titles"} onClick={() => setTab("titles")} icon={<Crown className="h-4 w-4" />}>
            Titles ({TITLES.length})
          </TabButton>
        </div>

        {/* Content */}
        {tab === "pieces" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 fade-in-up">
            {PIECE_SKINS.map((skin) => (
              <PieceSkinCard
                key={skin.id}
                skin={skin}
                owned={ownedSkins.has(skin.id)}
                active={user.activePieceSkin === skin.id}
                pieces={user.pieces}
                busy={busy === `piece-skin:${skin.id}:buy` || busy === `piece-skin:${skin.id}:equip`}
                onBuy={() => buy("piece-skin", skin.id)}
                onEquip={() => equip("piece-skin", skin.id)}
              />
            ))}
          </div>
        )}
        {tab === "boards" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 fade-in-up">
            {BOARD_SKINS.map((skin) => (
              <BoardSkinCard
                key={skin.id}
                skin={skin}
                owned={ownedSkins.has(skin.id)}
                active={user.activeBoardSkin === skin.id}
                pieces={user.pieces}
                busy={busy === `board-skin:${skin.id}:buy` || busy === `board-skin:${skin.id}:equip`}
                onBuy={() => buy("board-skin", skin.id)}
                onEquip={() => equip("board-skin", skin.id)}
              />
            ))}
          </div>
        )}
        {tab === "titles" && (
          <div className="grid gap-4 sm:grid-cols-2 fade-in-up">
            {TITLES.map((title) => (
              <TitleCard
                key={title.id}
                title={title}
                owned={ownedTitles.has(title.id)}
                active={user.activeTitle === title.id}
                pieces={user.pieces}
                userRating={user.rating}
                busy={busy === `title:${title.id}:buy` || busy === `title:${title.id}:equip` || busy === "title:unequip"}
                onBuy={() => buy("title", title.id)}
                onEquip={() => equip("title", title.id)}
                onUnequip={unequipTitle}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
        active ? "neo-tab-active" : "neo-tab-inactive"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}

function PieceSkinCard({
  skin, owned, active, pieces, busy, onBuy, onEquip,
}: {
  skin: PieceSkin; owned: boolean; active: boolean; pieces: number; busy: boolean;
  onBuy: () => void; onEquip: () => void;
}) {
  const canAfford = pieces >= skin.cost;
  return (
    <div className="neo-surface flex flex-col gap-3 p-4">
      {/* Preview — render a king with this skin */}
      <div className={`relative aspect-[16/9] overflow-hidden rounded-xl bg-gradient-to-br ${skin.cardGradient}`}>
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          <div className="h-20 w-20 drop-shadow-lg">
            <Piece piece={{ type: "k", color: "w" }} skinId={skin.id} />
          </div>
          <div className="h-20 w-20 drop-shadow-lg">
            <Piece piece={{ type: "k", color: "b" }} skinId={skin.id} />
          </div>
        </div>
        {active && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
            <Check className="h-3 w-3" /> Active
          </div>
        )}
      </div>

      <div>
        <div className="text-sm font-bold text-foreground">{skin.name}</div>
        <div className="text-xs text-muted-foreground">{skin.description}</div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm">
          <Coins className="h-4 w-4 text-amber-400" />
          <span className="font-semibold text-foreground">{skin.cost}</span>
        </div>
        {owned ? (
          <Button
            size="sm"
            variant={active ? "secondary" : "default"}
            onClick={onEquip}
            disabled={busy || active}
            className="gap-1 text-xs"
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            {active ? "Equipped" : "Equip"}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onBuy}
            disabled={busy || !canAfford}
            className="gap-1 text-xs"
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            {!canAfford ? <Lock className="h-3 w-3" /> : null}
            Buy
          </Button>
        )}
      </div>
    </div>
  );
}

function BoardSkinCard({
  skin, owned, active, pieces, busy, onBuy, onEquip,
}: {
  skin: BoardSkin; owned: boolean; active: boolean; pieces: number; busy: boolean;
  onBuy: () => void; onEquip: () => void;
}) {
  const canAfford = pieces >= skin.cost;
  return (
    <div className="neo-surface flex flex-col gap-3 p-4">
      {/* Preview — render a 4x4 mini board with this skin */}
      <div className={`relative aspect-[16/9] overflow-hidden rounded-xl bg-gradient-to-br ${skin.cardGradient}`}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="grid h-full grid-cols-4 grid-rows-4 overflow-hidden rounded-lg shadow-lg">
            {Array.from({ length: 16 }).map((_, i) => {
              const row = Math.floor(i / 4);
              const col = i % 4;
              const isLight = (row + col) % 2 === 0;
              return (
                <div key={i} style={{ backgroundColor: isLight ? skin.light : skin.dark }} />
              );
            })}
          </div>
        </div>
        {active && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
            <Check className="h-3 w-3" /> Active
          </div>
        )}
      </div>

      <div>
        <div className="text-sm font-bold text-foreground">{skin.name}</div>
        <div className="text-xs text-muted-foreground">{skin.description}</div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm">
          <Coins className="h-4 w-4 text-amber-400" />
          <span className="font-semibold text-foreground">{skin.cost}</span>
        </div>
        {owned ? (
          <Button
            size="sm"
            variant={active ? "secondary" : "default"}
            onClick={onEquip}
            disabled={busy || active}
            className="gap-1 text-xs"
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            {active ? "Equipped" : "Equip"}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onBuy}
            disabled={busy || !canAfford}
            className="gap-1 text-xs"
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            {!canAfford ? <Lock className="h-3 w-3" /> : null}
            Buy
          </Button>
        )}
      </div>
    </div>
  );
}

function TitleCard({
  title, owned, active, pieces, userRating, busy, onBuy, onEquip, onUnequip,
}: {
  title: Title; owned: boolean; active: boolean; pieces: number; userRating: number; busy: boolean;
  onBuy: () => void; onEquip: () => void; onUnequip: () => void;
}) {
  const canAfford = pieces >= title.cost;
  const ratingLocked = title.minRating !== undefined && userRating < title.minRating;
  return (
    <div className="neo-surface flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15">
          <Crown className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className={`text-base font-bold ${title.color}`}>{title.name}</div>
          <div className="text-xs text-muted-foreground">{title.description}</div>
        </div>
        {active && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
            <Check className="h-3 w-3" /> Active
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm">
          <Coins className="h-4 w-4 text-amber-400" />
          <span className="font-semibold text-foreground">{title.cost}</span>
          {ratingLocked && (
            <span className="ml-2 text-xs text-red-400">
              <Lock className="mr-1 inline h-3 w-3" />
              Requires {title.minRating} rating
            </span>
          )}
        </div>
        {owned ? (
          active ? (
            <Button size="sm" variant="outline" onClick={onUnequip} disabled={busy} className="text-xs">
              Unequip
            </Button>
          ) : (
            <Button size="sm" variant="default" onClick={onEquip} disabled={busy} className="gap-1 text-xs">
              {busy && <Loader2 className="h-3 w-3 animate-spin" />}
              Equip
            </Button>
          )
        ) : (
          <Button
            size="sm"
            onClick={onBuy}
            disabled={busy || !canAfford || ratingLocked}
            className="gap-1 text-xs"
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            {!canAfford && !ratingLocked ? <Lock className="h-3 w-3" /> : null}
            {ratingLocked ? "Locked" : "Buy"}
          </Button>
        )}
      </div>
    </div>
  );
}
