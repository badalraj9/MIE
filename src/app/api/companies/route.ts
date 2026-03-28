import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sourceUrls: z.array(z.string().url()).optional().default([]),
});

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: { select: { events: true, cases: true } },
        events: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true, teachabilityScore: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const result = companies.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      scrapeUrls: c.scrapeUrls ? JSON.parse(c.scrapeUrls) : [],
      eventCount: c._count.events,
      caseCount: c._count.cases,
      latestEventDate: c.events[0]?.date ?? null,
    }));

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const company = await prisma.company.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        scrapeUrls: JSON.stringify(parsed.data.sourceUrls),
      },
    });
    return NextResponse.json({ success: true, company }, { status: 201 });
  } catch (e) {
    const msg = String(e);
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: `Company "${parsed.data.name}" already exists.` }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
