import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { prisma } from "./prisma";
import { caseStudySchema, type CaseStudyGen } from "./schema";
import {
  SCORING_MODEL,
  GENERATION_MODEL,
  ANTHROPIC_MODEL,
  GROQ_MODEL,
  TEACHABILITY_THRESHOLD,
  MAX_GENERATION_TOKENS,
} from "./config";

// ─── Types ────────────────────────────────────────────────────────────────────

type SupportedModel = "gpt-4o" | "claude-3-5-sonnet" | "llama-3-70b";

// ─── Pre-generation Validation ───────────────────────────────────────────────

const readinessSchema = z.object({
  isReady: z.boolean(),
  score: z.number().min(0).max(10),
  gaps: z.array(z.string()),
  recommendation: z.string(),
});

async function validateCaseReadiness(
  companyName: string,
  eventSummary: string
): Promise<z.infer<typeof readinessSchema>> {
  try {
    const { object } = await generateObject({
      model: openai(SCORING_MODEL),
      schema: readinessSchema,
      prompt: `You are a Wharton case development editor. Assess whether the following events provide sufficient material to write a rigorous Wharton MBA case study about ${companyName}.

A strong Wharton case requires:
1. A clear protagonist facing a high-stakes decision
2. Quantitative financial data (revenue, costs, funding rounds, debt, etc.)
3. Stakeholder conflict or ethical tension
4. Regulatory or governance context
5. Strategic options with genuine trade-offs

Events collected so far:
${eventSummary}

Rate readiness 0–10. Is this ready to be a Wharton case?`,
    });
    return object;
  } catch {
    return { isReady: true, score: 5, gaps: [], recommendation: "Validation skipped." };
  }
}

// ─── Wharton System Prompt ────────────────────────────────────────────────────

function buildSystemPrompt(contextData: string): string {
  return `You are a distinguished Wharton Business School case study author with 20 years of experience writing cases for HBS, Wharton, and INSEAD.

## YOUR TASK
Write a rigorous, publication-ready Wharton MBA case study based ONLY on the provided source events.

## STRICT AUTHORSHIP RULES
1. **No hallucination**: Every financial figure, date, and factual claim must trace directly to the source events.
2. **Protagonist framing**: Written in second person for the hook, placing the reader at the moment of crisis.
3. **Genuine dilemma**: No obvious right answer. Both options must have compelling arguments and significant risks.
4. **Academic rigour**: Background and situation must read like Economist-quality journalism — precise, evidence-based.
5. **Teaching note is confidential**: Written for a professor colleague, explaining how to orchestrate the debate.
6. **Financial exhibits**: Extract real metrics from the text — every number must map to a specific event.

## SOURCE EVENTS
${contextData}`;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export async function triggerAndBuildCase(
  companyName: string,
  options: { modelId?: SupportedModel; skipThresholdCheck?: boolean } = {}
) {
  const { modelId = (GENERATION_MODEL as SupportedModel) ?? "gpt-4o", skipThresholdCheck = false } = options;

  console.log(`\n🔍 Evaluating case readiness for ${companyName}...`);

  const company = await prisma.company.findUnique({
    where: { name: companyName },
    include: { events: { orderBy: { date: "asc" } } },
  });

  if (!company || company.events.length === 0) {
    throw new Error(`No events found for "${companyName}". Run the scraper first.`);
  }

  const cumulativeScore = company.events.reduce((sum, e) => sum + (e.teachabilityScore || 0), 0);
  console.log(`  Cumulative teachability score: ${cumulativeScore} (threshold: ${TEACHABILITY_THRESHOLD})`);

  if (!skipThresholdCheck && cumulativeScore < TEACHABILITY_THRESHOLD) {
    throw new Error(
      `Teachability threshold not met (score: ${cumulativeScore}/${TEACHABILITY_THRESHOLD}). ` +
      `Use skipThresholdCheck=true to override.`
    );
  }

  const contextData = company.events
    .map((e) => {
      const reason = (e as Record<string, unknown>).teachabilityReason as string | undefined;
      return (
        `[${e.date.toISOString().split("T")[0]} — ${e.type}] ${e.title}\n` +
        `Source: ${e.sourceUrl || "N/A"}\n` +
        `Teachability: ${e.teachabilityScore}/10${reason ? ` — ${reason}` : ""}\n` +
        `Content: ${e.content}`
      );
    })
    .join("\n\n---\n\n");

  const eventSummary = company.events
    .map((e) => `• [${e.type}] ${e.title} (score: ${e.teachabilityScore}/10)`)
    .join("\n");

  const readiness = await validateCaseReadiness(companyName, eventSummary);
  console.log(`  Readiness: ${readiness.score}/10 — ${readiness.recommendation}`);
  if (readiness.gaps.length > 0) readiness.gaps.forEach((g) => console.log(`    - ${g}`));

  if (!readiness.isReady && !skipThresholdCheck) {
    throw new Error(`Insufficient data. Gaps: ${readiness.gaps.join(", ")}. Use skipThresholdCheck=true to override.`);
  }

  console.log(`\n🏫 Generating via ${modelId}...`);
  const prompt = `Write the complete, publication-ready Wharton case study for ${companyName}. Follow the schema precisely.`;
  const system = buildSystemPrompt(contextData);
  let generatedCase: CaseStudyGen;

  if (modelId === "claude-3-5-sonnet" && process.env.ANTHROPIC_API_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await generateObject({ model: anthropic(ANTHROPIC_MODEL) as any, schema: caseStudySchema, system, prompt, maxTokens: MAX_GENERATION_TOKENS });
    generatedCase = r.object as CaseStudyGen;
  } else if (modelId === "llama-3-70b" && process.env.GROQ_API_KEY) {
    const groqClient = createGroq({ apiKey: process.env.GROQ_API_KEY });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await generateObject({ model: groqClient(GROQ_MODEL) as any, schema: caseStudySchema, system, prompt, maxTokens: MAX_GENERATION_TOKENS });
    generatedCase = r.object as CaseStudyGen;
  } else {
    const r = await generateObject({ model: openai(GENERATION_MODEL), schema: caseStudySchema, system, prompt, maxTokens: MAX_GENERATION_TOKENS });
    generatedCase = r.object;
  }

  console.log(`  ✅ Generated: "${generatedCase.title}"`);

  const caseData: Parameters<typeof prisma.caseStudy.create>[0]["data"] = {
    companyId: company.id,
    title: generatedCase.title,
    hook: generatedCase.hook,
    background: generatedCase.background,
    situation: generatedCase.situation,
    dilemma: generatedCase.dilemma,
    teachingNote: generatedCase.teachingNote,
    exhibits: { create: generatedCase.exhibits.map((ex) => ({ title: ex.title, chartType: ex.chartType, data: ex.data })) },
    questions: { create: generatedCase.questions.map((q) => ({ question: q.question })) },
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (caseData as any).status = "DRAFT";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (caseData as any).model = modelId;
  } catch { /* skip if schema hasn't migrated yet */ }

  const savedCase = await prisma.caseStudy.create({ data: caseData, include: { company: true } });
  console.log(`  💾 Saved as DRAFT: ${savedCase.id}\n`);
  return savedCase;
}
