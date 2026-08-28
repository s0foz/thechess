"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "./Logo";
import { AuthModal } from "./AuthModal";
import { tierForRating, xpProgress } from "@/lib/thechess/tiers";
import { getTitle } from "@/lib/thechess/shop";
import type { TabId } from "./Header";
import {
  LogOut,
  User as UserIcon,
  Trophy,
  ChevronDown,
  Crown,
  Coins,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "home", label: "Home" },
  { id: "play-ai", label: "Play AI" },
  { id: "play-online", label: "Play Online" },
  { id: "puzzles", label: "Puzzles" },
  { id: "learn", label: "Learn" },
  { id: "analysis", label: "Analysis" },
  { id: "shop", label: "Shop" },
  { id: "leaderboard", label: "Leaderboard" },
];

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    toast.success("Signed out");
    onTabChange("home");
  };

  const tier = user ? tierForRating(user.rating) : null;
  const xp = user ? xpProgress(user.xp) : null;
  const title = user ? getTitle(user.activeTitle) : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-2 sm:px-4">
          <button
            onClick={() => onTabChange("home")}
            className="flex flex-shrink-0 items-center gap-2"
            aria-label="thechess home"
          >
            <Logo size={32} />
          </button>

          {/* Desktop tabs */}
          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
            className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm lg:hidden"
            aria-label="Navigate"
          >
            {TABS.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>

          {/* Auth area */}
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
            ) : isAuthenticated && user ? (
              <>
                {/* Pieces currency display */}
                <button
                  onClick={() => onTabChange("shop")}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 transition-colors hover:bg-muted"
                  title="Your pieces balance — click to visit shop"
                >
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-foreground">{user.pieces}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:bg-muted">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white tier-${tier?.id}`}
                      >
                        {user.username.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="hidden text-left sm:block">
                        <div className="text-xs font-semibold leading-tight text-foreground">
                          {user.username}
                        </div>
                        {title ? (
                          <div className={`text-[10px] font-semibold leading-tight ${title.color}`}>
                            {title.name}
                          </div>
                        ) : (
                          <div className="text-[10px] leading-tight text-muted-foreground">
                            <span style={{ color: tier?.color }}>{user.rating}</span> · L{user.level}
                          </div>
                        )}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">{user.username}</span>
                        {title && (
                          <span className={`text-xs font-semibold ${title.color}`}>
                            {title.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white tier-${tier?.id}`}
                          >
                            {tier?.emoji} {tier?.label}
                          </span>
                          <span>{user.rating} rating</span>
                          <span className="ml-1 inline-flex items-center gap-0.5 text-amber-400">
                            <Coins className="h-3 w-3" /> {user.pieces}
                          </span>
                        </div>
                        {xp && (
                          <div className="mt-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>Level {xp.level}</span>
                              <span>
                                {xp.current} / {xp.needed} XP
                              </span>
                            </div>
                            <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted">
                              <div className="xp-bar h-full" style={{ width: `${xp.pct}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onTabChange("profile")}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTabChange("shop")}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Shop
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTabChange("leaderboard")}>
                      <Trophy className="mr-2 h-4 w-4" />
                      Leaderboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openAuth("signin")}
                  className="text-xs"
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={() => openAuth("signup")}
                  className="gap-1.5 text-xs"
                >
                  <Crown className="h-3.5 w-3.5" />
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode={authMode}
      />
    </>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background/50 px-4 py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <Logo size={24} />
        <span className="text-xs text-muted-foreground">thechess · play, learn, climb</span>
      </div>
    </footer>
  );
}
