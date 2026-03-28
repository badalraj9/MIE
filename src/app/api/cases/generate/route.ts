import { NextResponse } from "next/server";
import { triggerAndBuildCase } from "@/lib/caseBuilder";
import { z } from "zod";

export const maxDuration = 120; // Case generation can take up to 2 min

const requestSchema = z.object({
  companyName: z.string().min(1),
  modelId: z.enum(["gpt-4o", "claude-3-5-sonnet", "llama-3-70b"]).optional().default("gpt-4o"),
  skipThresholdCheck: z.boolean().optional().default(false),
});

function isProfessorAuthorized(req: Request): boolean {
  const secret = process.env.PROFESSOR_SECRET;
  if (!secret) return true; // No secret configured — open access (dev mode)
  const header = req.headers.get("x-professor-secret");
  return header === secret;
}

export async function POST(req: Request) {
  if (!isProfessorAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized. Include x-professor-secret header." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { companyName, modelId, skipThresholdCheck } = parsed.data;

  try {
    const caseStudy = await triggerAndBuildCase(companyName, { modelId, skipThresholdCheck });
    return NextResponse.json({
      success: true,
      caseId: caseStudy.id,
      title: caseStudy.title,
      status: caseStudy.status,
      message: `Case study drafted successfully. Review it at /dashboard/cases/${caseStudy.id}/edit`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Case generation failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
