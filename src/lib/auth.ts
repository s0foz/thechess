import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/?auth=signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { username: credentials.username.toLowerCase() },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.username,
          // stash rating/level for the JWT callback
          email: user.email ?? undefined,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).name;
      }
      // Refresh rating/level + shop data from DB on each token creation/refresh
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            rating: true, level: true, xp: true, wins: true, losses: true, draws: true, puzzlesSolved: true,
            pieces: true, ownedSkins: true, ownedTitles: true,
            activePieceSkin: true, activeBoardSkin: true, activeTitle: true,
          },
        });
        if (dbUser) {
          token.rating = dbUser.rating;
          token.level = dbUser.level;
          token.xp = dbUser.xp;
          token.wins = dbUser.wins;
          token.losses = dbUser.losses;
          token.draws = dbUser.draws;
          token.puzzlesSolved = dbUser.puzzlesSolved;
          token.pieces = dbUser.pieces;
          token.ownedSkins = dbUser.ownedSkins;
          token.ownedTitles = dbUser.ownedTitles;
          token.activePieceSkin = dbUser.activePieceSkin;
          token.activeBoardSkin = dbUser.activeBoardSkin;
          token.activeTitle = dbUser.activeTitle;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).rating = token.rating;
        (session.user as any).level = token.level;
        (session.user as any).xp = token.xp;
        (session.user as any).wins = token.wins;
        (session.user as any).losses = token.losses;
        (session.user as any).draws = token.draws;
        (session.user as any).puzzlesSolved = token.puzzlesSolved;
        (session.user as any).pieces = token.pieces;
        (session.user as any).ownedSkins = token.ownedSkins ? JSON.parse(token.ownedSkins as string) : [];
        (session.user as any).ownedTitles = token.ownedTitles ? JSON.parse(token.ownedTitles as string) : [];
        (session.user as any).activePieceSkin = token.activePieceSkin;
        (session.user as any).activeBoardSkin = token.activeBoardSkin;
        (session.user as any).activeTitle = token.activeTitle;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me-in-production",
};

export type AppUser = {
  id: string;
  username: string;
  rating: number;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  draws: number;
  puzzlesSolved: number;
};
