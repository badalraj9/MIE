import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ANALYTICS_ENABLED } from "@/lib/config";

const patchSchema = z.object({
  title: z.string().optional(),
  hook: z.string().optional(),
  background: z.string().optional(),
  situation: z.string().optional(),
  dilemma: z.string().optional(),
  teachingNote: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id },
      include: { company: true, exhibits: true, questions: true },
    });
    
    if (!caseStudy) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.caseStudy.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Track analytics event if enabled
    if (ANALYTICS_ENABLED) {
      const userId = request.headers.get("x-user-id") ?? undefined;
      await prisma.analytics.create({
        data: {
          eventType: "CASE_VIEW",
          caseStudyId: id,
          userId,
          metadata: JSON.stringify({
            userAgent: request.headers.get("user-agent"),
            referrer: request.headers.get("referer"),
          }),
        },
      }).catch(() => {});
    }

    return NextResponse.json(caseStudy);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid fields", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await prisma.caseStudy.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ success: true, caseStudy: updated });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.caseStudy.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}