import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInterface from "./chat-interface";
import FinancialCharts from "./financial-charts";

const prisma = new PrismaClient();

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const caseStudy = await prisma.caseStudy.findUnique({
    where: { id: resolvedParams.id },
    include: {
      company: true,
      exhibits: true,
      questions: true,
    },
  });

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="flex h-screen w-full flex-col bg-neutral-50 md:flex-row overflow-hidden font-serif">
      {/* Column 1: Case Text (Read-Only Academic Style) */}
      <div className="flex h-full w-full flex-col border-r border-slate-200 bg-white md:w-1/3">
        <header className="border-b bg-slate-900 px-6 py-4 text-white shadow-sm shrink-0">
          <div className="text-xs font-sans font-medium uppercase tracking-wider text-slate-300 mb-1">
            {caseStudy.company.name} Case Study
          </div>
          <h1 className="text-xl font-bold leading-tight">
            {caseStudy.title}
          </h1>
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

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 border-b pb-2 mb-4">Teaching Note</h2>
              <div className="bg-amber-50 p-6 border border-amber-200 rounded-sm italic text-amber-900">
                <p className="whitespace-pre-line">{caseStudy.teachingNote}</p>
              </div>
            </section>
          </article>
        </ScrollArea>
      </div>

      {/* Column 2: Financial Charts (Interactive Exhibits) */}
      <div className="flex h-full w-full flex-col border-r border-slate-200 bg-slate-50 md:w-1/3">
        <header className="border-b bg-white px-6 py-4 shadow-sm shrink-0">
          <h2 className="text-lg font-bold font-sans text-slate-800">Financial Exhibits</h2>
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
