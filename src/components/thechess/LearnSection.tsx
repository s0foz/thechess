"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LESSONS, LESSON_CATEGORIES, type Lesson } from "@/lib/thechess/lessons";
import { OPENINGS, type Opening } from "@/lib/thechess/openings";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { ChessEngine } from "@/lib/chess/engine";
import {
  BookOpen,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Target,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

type View = "lessons" | "openings";

export function LearnSection() {
  const [view, setView] = useState<View>("lessons");

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 fade-in-up">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Learn Chess
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Original lessons covering the rules, opening principles, tactical motifs, and endgame
            technique. Plus an opening explorer with classic openings.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 fade-in-up">
          <button
            onClick={() => setView("lessons")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "lessons"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Lessons ({LESSONS.length})
          </button>
          <button
            onClick={() => setView("openings")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "openings"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Target className="h-4 w-4" />
            Opening Explorer ({OPENINGS.length})
          </button>
        </div>

        {view === "lessons" ? <LessonsView /> : <OpeningsView />}
      </div>
    </section>
  );
}

function LessonsView() {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredLessons = useMemo(() => {
    if (categoryFilter === "all") return LESSONS;
    return LESSONS.filter((l) => l.category === categoryFilter);
  }, [categoryFilter]);

  if (activeLesson) {
    return <LessonReader lesson={activeLesson} onBack={() => setActiveLesson(null)} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-4 sm:grid-cols-2 fade-in-up">
        {filteredLessons.map((lesson) => (
          <Card
            key={lesson.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setActiveLesson(lesson)}
          >
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {lesson.category}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {lesson.difficulty}
                </span>
              </div>
              <CardTitle className="text-base">{lesson.title}</CardTitle>
              <CardDescription>{lesson.duration}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">{lesson.intro}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <aside className="fade-in-up">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                  categoryFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <span>All lessons</span>
                <span className="text-xs opacity-75">{LESSONS.length}</span>
              </button>
              {LESSON_CATEGORIES.map((cat) => {
                const count = LESSONS.filter((l) => l.category === cat.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                      categoryFilter === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-xs opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function LessonReader({ lesson, onBack }: { lesson: Lesson; onBack: () => void }) {
  return (
    <article className="mx-auto max-w-3xl fade-in-up">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1">
        <ChevronLeft className="h-4 w-4" />
        All lessons
      </Button>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {lesson.category}
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs uppercase tracking-wider text-muted-foreground">
          {lesson.difficulty}
        </span>
        <span className="text-xs text-muted-foreground">{lesson.duration}</span>
      </div>

      <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">{lesson.title}</h1>
      <p className="mb-6 text-lg text-muted-foreground">{lesson.intro}</p>

      <div className="space-y-6">
        {lesson.sections.map((section, i) => (
          <section key={i}>
            <h2 className="mb-2 text-xl font-semibold text-foreground">{section.heading}</h2>
            <div className="space-y-3 text-sm leading-relaxed text-foreground sm:text-base">
              {section.body.map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card className="mt-8 bg-emerald-50 dark:bg-emerald-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-emerald-600" />
            Key takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {lesson.keyTakeaways.map((kt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                <span>{kt}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          All lessons
        </Button>
      </div>
    </article>
  );
}

function OpeningsView() {
  const [activeOpening, setActiveOpening] = useState<Opening>(OPENINGS[0]);

  const snapshot = useMemo(
    () => new ChessEngine(activeOpening.fenAfter).snapshot(),
    [activeOpening.fenAfter],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="fade-in-up">
        <Card className="mb-4">
          <CardHeader>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                ECO {activeOpening.eco}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                {activeOpening.difficulty}
              </span>
            </div>
            <CardTitle className="text-xl">{activeOpening.name}</CardTitle>
            <CardDescription className="font-mono text-sm">{activeOpening.pgnMoves}</CardDescription>
          </CardHeader>
        </Card>

        <div className="w-full max-w-[560px]">
          <ChessBoard
            snapshot={snapshot}
            orientation="w"
            interactive={false}
            onMove={() => {}}
          />
        </div>

        <div className="mt-4 max-w-[560px] rounded-md bg-card p-3 text-sm text-foreground">
          {activeOpening.description}
        </div>

        <div className="mt-4 grid max-w-[560px] gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">White&apos;s plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {activeOpening.whiteIdeas.map((idea, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500" />
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Black&apos;s plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {activeOpening.blackIdeas.map((idea, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500" />
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-3 max-w-[560px]">
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(activeOpening.fenAfter);
                toast.success("Opening FEN copied");
              } catch {
                toast.error("Failed to copy");
              }
            }}
          >
            Copy position FEN
          </Button>
        </div>
      </div>

      <aside className="fade-in-up">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Openings</CardTitle>
            <CardDescription>{OPENINGS.length} classic openings</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[640px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              {OPENINGS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setActiveOpening(o)}
                  className={`flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-muted/50 ${
                    o.id === activeOpening.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{o.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{o.pgnMoves}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
