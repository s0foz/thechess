"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user as
    | {
        id: string;
        username: string;
        rating: number;
        level: number;
        xp: number;
        wins: number;
        losses: number;
        draws: number;
        puzzlesSolved: number;
      }
    | undefined;
  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
