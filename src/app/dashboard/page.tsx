import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Building2, TrendingUp, FileText, ExternalLink, Scroll, MessageSquarePlus, PenTool, Scale } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [companies, cases] = await Promise.all([
    prisma.company.findMany({
      include: {
        _count: { select: { events: true, cases: true } },
        events: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.caseStudy.findMany({
      include: { company: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalEvents = companies.reduce((sum, c) => sum + c._count.events, 0);
  return { companies, cases, totalEvents };
}

export default async function DashboardPage() {
  const { companies, cases, totalEvents } = await getDashboardData();

  const draftCount = cases.filter((c) => c.status === "DRAFT").length;
  const publishedCount = cases.filter((c) => c.status === "PUBLISHED").length;

  const stats = [
    { label: "Companies Watched", value: companies.length, icon: Building2, color: "bg-primary/10 text-primary" },
    { label: "Events Ingested", value: totalEvents, icon: TrendingUp, color: "bg-chart-2/15 text-chart-2" },
    { label: "Cases (Draft)", value: draftCount, icon: FileText, color: "bg-chart-3/15 text-chart-3" },
    { label: "Cases (Published)", value: publishedCount, icon: BookOpen, color: "bg-chart-4/15 text-chart-4" },
  ];

  return (
    <div className="min-h-screen">
      <header className="relative border-b border-border/60 bg-card/60 backdrop-blur-sm px-6 py-6 md:px-10">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Scroll size={22} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">MIE Platform</p>
              <h1 className="font-serif text-2xl font-bold">Research Library</h1>
            </div>
          </div>
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium transition-all hover:bg-secondary/80 border border-border"
          >
            <BookOpen size={14} />
            <span>Research Hub</span>
            <ExternalLink size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10 space-y-10">
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="floating-tile group relative p-5"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} shadow-sm transition-transform group-hover:scale-105`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold tracking-tight">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              </div>
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </section>

        <section>
          <div className="floating-tile p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg">
                  <MessageSquarePlus size={24} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold">Debate Arena</h2>
                  <p className="text-sm text-muted-foreground">Strategic peer analysis and discourse - instant context, real-time debate</p>
                </div>
              </div>
              <Link
                href="/debate"
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                <PenTool size={18} />
                <span>Start Debate</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="floating-tile p-12 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
              <Scale size={40} className="text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-3">Strategic Debate Chamber</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Enter any topic, company, or scenario for instant strategic analysis. 
              Engage in peer-level discourse with real-time challenge and perspective shifts.
            </p>
            <Link
              href="/debate"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-[1.02]"
            >
              <PenTool size={22} />
              <span>Begin Session</span>
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold">All Case Studies</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage generated cases — edit drafts, publish for students</p>
            </div>
          </div>

          {cases.length === 0 ? (
            <div className="floating-tile flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary shadow-sm">
                <FileText size={28} className="text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold">No Cases Generated Yet</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Add events for a company, then click &quot;Generate Case&quot; to create a Wharton-style case study.
              </p>
            </div>
          ) : (
            <div className="floating-tile overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/60 bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-4 text-left font-medium">Title</th>
                      <th className="px-6 py-4 text-left font-medium">Company</th>
                      <th className="px-6 py-4 text-left font-medium">Status</th>
                      <th className="px-6 py-4 text-left font-medium">Model</th>
                      <th className="px-6 py-4 text-left font-medium">Created</th>
                      <th className="px-6 py-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c, i) => (
                      <tr
                        key={c.id}
                        className={`border-b border-border/40 transition-colors hover:bg-secondary/20 ${i % 2 === 0 ? "bg-card" : "bg-secondary/10"}`}
                      >
                        <td className="px-6 py-4 max-w-xs">
                          <span className="font-medium text-foreground line-clamp-1">{c.title}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{c.company.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                            c.status === "PUBLISHED"
                              ? "bg-green-500/10 text-green-600 ring-green-500/20"
                              : "bg-amber-500/10 text-amber-600 ring-amber-500/20"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{c.model ?? "—"}</td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">
                          {new Date(c.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/cases/${c.id}/edit`}
                              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium transition-all hover:bg-secondary/80 border border-border"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/cases/${c.id}`}
                              target="_blank"
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary transition-all hover:bg-secondary/80 border border-border"
                            >
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
