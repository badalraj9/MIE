import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, BarChart3, MessageSquarePlus, Share2, Download, Scroll } from "lucide-react";
import ChatInterface from "./chat-interface";
import FinancialCharts from "./financial-charts";
import TeachingNoteToggle from "./teaching-note-toggle";

export const dynamic = "force-dynamic";

async function getCaseStudy(id: string) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    return await prisma.caseStudy.findUnique({
      where: { id },
      include: {
        company: true,
        exhibits: true,
        questions: { orderBy: { createdAt: "asc" } },
      },
    });
  } catch {
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const caseStudy = await getCaseStudy(resolvedParams.id);

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-md px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary transition-all hover:bg-secondary/80 border border-border"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {caseStudy.company.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {caseStudy.exhibits.length} exhibits · {caseStudy.questions.length} questions
              </span>
            </div>
            <h1 className="font-serif text-lg font-semibold leading-tight">{caseStudy.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-all hover:bg-secondary/80 border border-border">
            <Share2 size={14} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-all hover:bg-secondary/80 border border-border">
            <Download size={14} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex h-full w-full flex-col md:w-1/3 border-r border-border/60 bg-surface">
          <div className="shrink-0 border-b border-border/40 bg-card/50 px-6 py-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <FileText size={14} />
              <span>Case Narrative</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <article className="prose prose-slate prose-lg max-w-none 
              prose-headings:font-serif prose-headings:font-semibold 
              prose-p:font-serif prose-p:leading-relaxed prose-p:text-foreground/90
              prose-strong:text-primary prose-a:text-primary">
              <section className="mb-10 relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 to-transparent rounded-full" />
                <h2 className="text-xl font-bold text-foreground mb-4 pl-2">1. Opening Hook</h2>
                <p className="leading-relaxed text-foreground/85">{caseStudy.hook}</p>
              </section>

              <section className="mb-10 relative">
                <h2 className="text-xl font-bold text-foreground mb-4">2. Background</h2>
                <p className="whitespace-pre-line leading-relaxed text-foreground/85">{caseStudy.background}</p>
              </section>

              <section className="mb-10 relative">
                <h2 className="text-xl font-bold text-foreground mb-4">3. The Situation</h2>
                <p className="whitespace-pre-line leading-relaxed text-foreground/85">{caseStudy.situation}</p>
              </section>

              <section className="mb-10 relative">
                <h2 className="text-xl font-bold text-foreground mb-4">4. The Dilemma</h2>
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 my-4">
                  <p className="font-serif text-lg leading-snug text-foreground">{caseStudy.dilemma}</p>
                </div>
              </section>

              {caseStudy.questions.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <MessageSquarePlus size={20} />
                    Discussion Questions
                  </h2>
                  <ol className="space-y-4 list-none pl-0">
                    {caseStudy.questions.map((q, i) => (
                      <li key={q.id} className="flex gap-4 p-4 rounded-xl bg-card border border-border/40 shadow-sm">
                        <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {i + 1}
                        </span>
                        <p className="text-foreground/85 leading-relaxed">{q.question}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <TeachingNoteToggle teachingNote={caseStudy.teachingNote} />
            </article>
          </div>
        </div>

        <div className="flex h-full w-full flex-col md:w-1/3 border-r border-border/60 bg-surface">
          <div className="shrink-0 border-b border-border/40 bg-card/50 px-6 py-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <BarChart3 size={14} />
              <span>Financial Exhibits</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {caseStudy.exhibits.length > 0 ? (
              <FinancialCharts exhibits={caseStudy.exhibits} />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-card/50 p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 size={24} className="text-muted-foreground/50" />
                  <p className="text-muted-foreground">No financial exhibits available.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex h-full w-full flex-col md:w-1/3 bg-surface">
          <div className="shrink-0 border-b border-border/40 bg-card/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Scroll size={14} />
                <span>Socratic Discourse</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-chart-1/10 px-2.5 py-1 text-xs font-medium text-chart-1 ring-1 ring-chart-1/20">
                Peer Analyst
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatInterface caseContext={caseStudy} />
          </div>
        </div>
      </div>
    </div>
  );
}