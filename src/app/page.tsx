import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getCases() {
  try {
    return await prisma.caseStudy.findMany({
      where: { status: "PUBLISHED" },
      include: { company: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const cases = await getCases();

  return (
    <div className="min-h-screen bg-neutral-50 font-serif text-slate-900">
      <header className="border-b bg-white p-6 shadow-sm">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Case Studies</h1>
            <p className="mt-1 text-slate-500 font-sans">
              AI-generated Wharton-style business cases for academic analysis
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="font-sans gap-1.5 text-slate-600">
              <LayoutDashboard size={14} />
              Professor Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 py-12">
        {cases.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-medium text-slate-700">No published cases yet</h2>
            <p className="mt-2 text-slate-500 font-sans">
              Generate a case in the{" "}
              <Link href="/dashboard" className="text-slate-900 underline hover:no-underline">
                Professor Dashboard
              </Link>
              , then publish it to see it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((caseStudy) => (
              <Card key={caseStudy.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="bg-slate-900 text-white p-5">
                  <div className="text-xs font-sans font-medium uppercase tracking-wider text-slate-300 mb-2">
                    {caseStudy.company.name}
                  </div>
                  <CardTitle className="text-xl font-serif leading-tight">
                    {caseStudy.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-5 font-sans">
                  <p className="text-sm text-slate-600 line-clamp-4">{caseStudy.hook}</p>
                </CardContent>
                <CardFooter className="p-5 pt-0 mt-auto border-t border-slate-100 bg-slate-50">
                  <Link href={`/cases/${caseStudy.id}`} className="w-full mt-4">
                    <Button variant="outline" className="w-full font-sans">
                      Read Case Study
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
