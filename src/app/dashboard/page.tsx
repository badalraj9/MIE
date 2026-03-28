import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, BookOpen, Building2, TrendingUp, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GenerateCaseButton from "./generate-case-button";

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

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Header */}
      <header className="border-b bg-slate-900 text-white px-8 py-5 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">MIE Platform</p>
            <h1 className="text-2xl font-bold font-serif">Professor Dashboard</h1>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 hover:bg-slate-800 hover:text-white">
              <BookOpen size={14} className="mr-1.5" /> View Published Cases
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-10 space-y-10">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Companies Watched", value: companies.length, icon: Building2 },
            { label: "Events Ingested", value: totalEvents, icon: TrendingUp },
            { label: "Cases (Draft)", value: draftCount, icon: FileText },
            { label: "Cases (Published)", value: publishedCount, icon: BookOpen },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-slate-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Icon size={18} className="text-slate-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Companies Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-serif text-slate-900">Monitored Companies</h2>
            <Link href="/dashboard/companies/new">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5">
                <Plus size={14} /> Add Company
              </Button>
            </Link>
          </div>

          {companies.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
              <Building2 size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No companies being monitored.</p>
              <p className="text-slate-400 text-sm mt-1">Add a company and run the scraper to start collecting events.</p>
              <Link href="/dashboard/companies/new" className="mt-4 inline-block">
                <Button size="sm" className="bg-slate-900 text-white mt-4">Add First Company</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Company</th>
                    <th className="px-6 py-3 text-left">Events</th>
                    <th className="px-6 py-3 text-left">Cases</th>
                    <th className="px-6 py-3 text-left">Last Event</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company, i) => (
                    <tr
                      key={company.id}
                      className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">{company.name}</td>
                      <td className="px-6 py-4 text-slate-600">{company._count.events}</td>
                      <td className="px-6 py-4 text-slate-600">{company._count.cases}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {company.events[0]?.date
                          ? new Date(company.events[0].date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <GenerateCaseButton companyName={company.name} hasEvents={company._count.events > 0} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Cases Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-serif text-slate-900">All Case Studies</h2>
          </div>

          {cases.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
              <FileText size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No cases generated yet.</p>
              <p className="text-slate-400 text-sm mt-1">
                Add events for a company, then click "Generate Case" above.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Title</th>
                    <th className="px-6 py-3 text-left">Company</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Model</th>
                    <th className="px-6 py-3 text-left">Created</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c, i) => (
                    <tr
                      key={c.id}
                      className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800 max-w-xs">
                        <span className="line-clamp-1">{c.title}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.company.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          c.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700 ring-green-600/20"
                            : "bg-amber-50 text-amber-700 ring-amber-600/20"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono">{c.model ?? "—"}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <Link href={`/dashboard/cases/${c.id}/edit`}>
                          <Button variant="outline" size="sm" className="text-xs">Edit</Button>
                        </Link>
                        <Link href={`/cases/${c.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="text-xs text-slate-500">
                            <ExternalLink size={12} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
