import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { prisma } from "../lib/prisma";
import { caseStudySchema } from "../lib/schema";

export async function triggerAndBuildCase(companyName: string) {
  console.log(`\nEvaluating teachability for ${companyName}...`);

  // 1. Fetch Company & Events (The "Vector DB" Search Simulation)
  const company = await prisma.company.findUnique({
    where: { name: companyName },
    include: {
      events: {
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!company || company.events.length === 0) {
    console.log("Not enough data to trigger a case.");
    return;
  }

  // 2. Trigger Logic ("Recognizing Teachability")
  // For the MVP, we assume a simple rule: If the sum of teachability scores over a
  // 3-year period crosses 25, we trigger the case builder.
  const cumulativeScore = company.events.reduce((sum, e) => sum + (e.teachabilityScore || 0), 0);

  if (cumulativeScore < 25) {
    console.log(`Cumulative Score (${cumulativeScore}) is below threshold (25). No case triggered.`);
    return;
  }

  console.log(`TRIGGERED! Teachability threshold crossed (${cumulativeScore}). Generating Wharton Case Study...`);

  // 3. Multi-Agent Case Builder ("Structuring the Output")
  // We feed the structured events to the Writer Agent (LLM).
  const contextData = company.events.map(e =>
    `[${e.date.toISOString().split('T')[0]} - ${e.type}] ${e.title}\nSource: ${e.sourceUrl}\nContent: ${e.content}`
  ).join("\n\n");

  const systemPrompt = `
You are a world-class Wharton business school professor. Your task is to write a highly rigorous, 7-part pedagogical case study based ONLY on the provided events and data.

**STRICT RULES:**
1. You must not hallucinate any financial figures. Use only the data provided in the text.
2. Every claim must have a direct connection to the underlying events.
3. The 'dilemma' must be a specific, difficult decision faced by the leadership with conflicting pressures and no obvious right answer.
4. The 'teachingNote' must remain private and explain to another professor how to guide the class debate using the exhibits.
5. Extract relevant financial or growth metrics from the text into the 'exhibits' array. Use standard JSON formatting for the 'data' field.

**DATA CONTEXT:**
${contextData}
`;

  try {
    const { object: generatedCase } = await generateObject({
      model: openai("gpt-4o"), // Requires OPENAI_API_KEY in .env
      schema: caseStudySchema,
      prompt: "Based on the provided context, build the 7-part Wharton case study.",
      system: systemPrompt,
    });

    console.log("\nCase Generated Successfully! Saving to Database...");

    // 4. Save to Database
    const savedCase = await prisma.caseStudy.create({
      data: {
        companyId: company.id,
        title: generatedCase.title,
        hook: generatedCase.hook,
        background: generatedCase.background,
        situation: generatedCase.situation,
        dilemma: generatedCase.dilemma,
        teachingNote: generatedCase.teachingNote,
        exhibits: {
          create: generatedCase.exhibits.map(ex => ({
            title: ex.title,
            chartType: ex.chartType,
            data: ex.data,
          }))
        },
        questions: {
          create: generatedCase.questions.map(q => ({
            question: q.question
          }))
        }
      }
    });

    console.log(`Case Study Saved: ID ${savedCase.id}`);
    return savedCase;

  } catch (error) {
    console.error("Failed to build case:", error);
    throw error;
  }
}
