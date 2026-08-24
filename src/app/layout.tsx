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
  title: "thechess — Play, Learn, Analyze Chess",
  description:
    "A complete chess platform: play against an AI with three difficulty levels or a friend, solve tactical puzzles, study openings and lessons, analyze positions, and track your stats. No signup required. Link your own custom domain.",
  keywords: [
    "chess",
    "play chess",
    "chess puzzles",
    "chess lessons",
    "chess openings",
    "chess analysis",
    "chess AI",
    "free chess",
    "custom domain chess",
  ],
  authors: [{ name: "thechess" }],
  openGraph: {
    title: "thechess — Play, Learn, Analyze Chess",
    description:
      "Play chess, solve puzzles, study openings, analyze positions, and track your stats. Bring your own custom domain.",
    siteName: "thechess",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "thechess — Play, Learn, Analyze Chess",
    description:
      "Play chess, solve puzzles, study openings, analyze positions, and track your stats.",
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
