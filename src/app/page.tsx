"use client";

import { useEffect, useState } from "react";
import { Header, Footer, type TabId } from "@/components/thechess/Header";
import { HomeSection } from "@/components/thechess/HomeSection";
import { PlaySection } from "@/components/thechess/PlaySection";
import { OnlinePlaySection } from "@/components/thechess/OnlinePlaySection";
import { PuzzlesSection } from "@/components/thechess/PuzzlesSection";
import { LearnSection } from "@/components/thechess/LearnSection";
import { AnalysisSection } from "@/components/thechess/AnalysisSection";
import { ProfileSection } from "@/components/thechess/ProfileSection";
import { LeaderboardSection } from "@/components/thechess/LeaderboardSection";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  // Scroll to top when tab changes.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeTab]);

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
        {activeTab === "profile" && <ProfileSection />}
        {activeTab === "leaderboard" && <LeaderboardSection />}
      </main>

      <Footer />
    </div>
  );
}
