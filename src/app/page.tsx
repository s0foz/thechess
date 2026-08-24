"use client";

import { useEffect, useState } from "react";
import { Header, Footer, type TabId } from "@/components/thechess/Header";
import { HomeSection } from "@/components/thechess/HomeSection";
import { PlaySection } from "@/components/thechess/PlaySection";
import { PuzzlesSection } from "@/components/thechess/PuzzlesSection";
import { LearnSection } from "@/components/thechess/LearnSection";
import { AnalysisSection } from "@/components/thechess/AnalysisSection";
import { StatsSection } from "@/components/thechess/StatsSection";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPreviewUrl(window.location.origin);
    }
  }, []);

  // Scroll to top when tab changes.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <Header activeTab={activeTab} onTabChange={setActiveTab} previewUrl={previewUrl} />

      <main className="flex flex-1 flex-col">
        {activeTab === "home" && <HomeSection onNavigate={setActiveTab} previewUrl={previewUrl} />}
        {activeTab === "play" && <PlaySection />}
        {activeTab === "puzzles" && <PuzzlesSection />}
        {activeTab === "learn" && <LearnSection />}
        {activeTab === "analysis" && <AnalysisSection />}
        {activeTab === "stats" && <StatsSection />}
      </main>

      <Footer />
    </div>
  );
}
