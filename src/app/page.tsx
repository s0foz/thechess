"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header, Footer, type TabId } from "@/components/thechess/Header";
import { HomeSection } from "@/components/thechess/HomeSection";
import { PlaySection } from "@/components/thechess/PlaySection";
import { OnlinePlaySection } from "@/components/thechess/OnlinePlaySection";
import { PuzzlesSection } from "@/components/thechess/PuzzlesSection";
import { LearnSection } from "@/components/thechess/LearnSection";
import { AnalysisSection } from "@/components/thechess/AnalysisSection";
import { ProfileSection } from "@/components/thechess/ProfileSection";
import { LeaderboardSection } from "@/components/thechess/LeaderboardSection";
import { ShopSection } from "@/components/thechess/ShopSection";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const { update: updateSession } = useSession();

  // Scroll to top when tab changes.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  // After shop purchases, refresh the session so the header + board reflect the new skin/pieces.
  const handleUserUpdate = useCallback(async () => {
    await updateSession();
  }, [updateSession]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex flex-1 flex-col">
        {activeTab === "home" && <HomeSection onNavigate={setActiveTab} />}
        {activeTab === "play-ai" && <PlaySection />}
        {activeTab === "play-online" && <OnlinePlaySection />}
        {activeTab === "puzzles" && <PuzzlesSection />}
        {activeTab === "learn" && <LearnSection />}
        {activeTab === "analysis" && <AnalysisSection />}
        {activeTab === "shop" && <ShopSection onUserUpdate={handleUserUpdate} />}
        {activeTab === "profile" && <ProfileSection />}
        {activeTab === "leaderboard" && <LeaderboardSection />}
      </main>

      <Footer />
    </div>
  );
}
