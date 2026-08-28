"use client";

import { useSession } from "next-auth/react";

export interface ProfileData {
  id: string;
  username: string;
  rating: number;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  draws: number;
  puzzlesSolved: number;
  pieces: number;
  ownedSkins: string[];
  ownedTitles: string[];
  activePieceSkin: string;
  activeBoardSkin: string;
  activeTitle: string | null;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user as ProfileData | undefined;
  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
