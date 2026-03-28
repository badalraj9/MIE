import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="flex h-screen w-full flex-col bg-neutral-50 md:flex-row overflow-hidden font-serif">
      {/* Column 1: Case Text */}
      <div className="flex h-full w-full flex-col border-r border-slate-200 bg-white md:w-1/3">
        <header className="border-b bg-slate-900 px-6 py-4 text-white shadow-sm shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-sans text-slate-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft size={12} />
            Back to Cases
          </Link>
          <div className="text-xs font-sans font-medium uppercase tracking-wider text-slate-300 mb-1">
            {caseStudy.company.name} Case Study
          </div>
          <h1 className="text-xl font-bold leading-tight">{caseStudy.title}</h1>
        </header>

        <ScrollArea className="flex-1 p-6 md:p-8">
          <article className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-p:font-serif prose-p:leading-relaxed prose-p:text-slate-800">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 border-b pb-2 mb-4">1. Opening Hook</h2>
              <p>{caseStudy.hook}</p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 border-b pb-2 mb-4">2. Background</h2>
              <p className="whitespace-pre-line">{caseStudy.background}</p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 border-b pb-2 mb-4">3. The Situation</h2>
              <p className="whitespace-pre-line">{caseStudy.situation}</p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 border-b pb-2 mb-4">4. The Dilemma</h2>
              <div className="bg-slate-50 p-6 border-l-4 border-slate-900 my-6">
                <p className="font-medium text-xl leading-snug">{caseStudy.dilemma}</p>
              </div>
            </section>

            {/* Discussion Questions */}
            {caseStudy.questions.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-slate-900 border-b pb-2 mb-4">Discussion Questions</h2>
                <ol className="space-y-3 list-none pl-0">
                  {caseStudy.questions.map((q, i) => (
                    <li key={q.id} className="flex gap-3">
                      <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold font-sans">
                        {i + 1}
                      </span>
                      <p className="text-slate-800 leading-relaxed">{q.question}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Teaching Note — hidden by default, toggled by client component */}
            <TeachingNoteToggle teachingNote={caseStudy.teachingNote} />
          </article>
        </ScrollArea>
      </div>

      {/* Column 2: Financial Charts */}
      <div className="flex h-full w-full flex-col border-r border-slate-200 bg-slate-50 md:w-1/3">
        <header className="border-b bg-white px-6 py-4 shadow-sm shrink-0">
          <h2 className="text-lg font-bold font-sans text-slate-800">Financial Exhibits</h2>
          {caseStudy.exhibits.length > 0 && (
            <p className="text-xs text-slate-500 font-sans mt-0.5">{caseStudy.exhibits.length} exhibit{caseStudy.exhibits.length > 1 ? "s" : ""}</p>
          )}
        </header>
        <ScrollArea className="flex-1 p-6 font-sans">
          {caseStudy.exhibits.length > 0 ? (
            <FinancialCharts exhibits={caseStudy.exhibits} />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white p-6 text-center">
              <p className="text-slate-500">No financial exhibits available.</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Column 3: Socratic Debate Chat */}
      <div className="flex h-full w-full flex-col bg-white md:w-1/3">
        <header className="border-b bg-white px-6 py-4 shadow-sm shrink-0 flex items-center justify-between">
          <h2 className="text-lg font-bold font-sans text-slate-800">Socratic Debate</h2>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            AI Professor
          </span>
        </header>
        <div className="flex-1 overflow-hidden font-sans flex flex-col">
          <ChatInterface caseContext={caseStudy} />
        </div>
      </div>
    </div>
  );
}
