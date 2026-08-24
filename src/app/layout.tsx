import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chess Royale — Play Chess Online & Bring Your Own Domain",
  description:
    "Play chess online against an AI opponent or a friend. Full move validation, check/checkmate detection, pawn promotion, and a step-by-step guide for linking your own custom domain.",
  keywords: [
    "chess",
    "play chess online",
    "chess game",
    "chess AI",
    "custom domain chess",
    "next.js chess",
    "free chess",
  ],
  authors: [{ name: "Chess Royale" }],
  openGraph: {
    title: "Chess Royale — Play Chess Online",
    description:
      "Play chess against an AI opponent or a friend. Bring your own custom domain.",
    siteName: "Chess Royale",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chess Royale — Play Chess Online",
    description:
      "Play chess against an AI opponent or a friend. Bring your own custom domain.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
