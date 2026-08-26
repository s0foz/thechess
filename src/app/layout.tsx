import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "thechess — Play Chess Online",
  description:
    "thechess — a gamified chess platform. Play real-time games against opponents worldwide, climb the rating ladder, earn XP, solve puzzles, and analyze your games.",
  keywords: [
    "chess",
    "play chess online",
    "chess multiplayer",
    "chess rating",
    "chess puzzles",
    "chess lessons",
    "chess AI",
    "free chess",
  ],
  authors: [{ name: "thechess" }],
  openGraph: {
    title: "thechess — Play Chess Online",
    description:
      "Real-time chess multiplayer. Climb the rating ladder, earn XP, solve puzzles.",
    siteName: "thechess",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "thechess — Play Chess Online",
    description:
      "Real-time chess multiplayer. Climb the rating ladder, earn XP, solve puzzles.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SonnerToaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
