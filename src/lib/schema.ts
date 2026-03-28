import { z } from "zod";

export const financialExhibitSchema = z.object({
  title: z.string().describe("Title of the financial exhibit — must reference a specific metric from the source data."),
  chartType: z.enum(["BAR", "LINE", "TABLE"]).describe(
    "BAR for comparisons across categories, LINE for trends over time, TABLE for multi-metric snapshots."
  ),
  data: z.string().describe(
    "JSON-stringified array. Each element must be { name: string, value: number }. " +
    "All values must come directly from the source material — no invented figures. " +
    "Example: '[{\"name\":\"FY21\",\"value\":2800},{\"name\":\"FY22\",\"value\":5200}]'"
  ),
});

export const discussionQuestionSchema = z.object({
  question: z
    .string()
    .describe(
      "A specific, open-ended Socratic question that forces students to grapple with the trade-offs in the dilemma. " +
      "Avoid yes/no questions. Target MBA-level analysis."
    ),
});

export const caseStudySchema = z.object({
  title: z.string().describe(
    "Official Wharton case title. Format: '[Company]: [Decisive Verb Phrase], [Year]'. " +
    "Example: 'Byju's: Navigating Governance Crisis and Liquidity Collapse, 2023'"
  ),
  hook: z.string().describe(
    "2–3 sentence opening hook written in second person, placing the reader as the protagonist " +
    "at the exact moment of the strategic decision. Must name a specific date and choice. No backstory."
  ),
  background: z.string().describe(
    "Factual company/sector background (400–600 words). Cover: founding story, business model, " +
    "market position, funding history, and key metrics. Cite only data present in the source events."
  ),
  situation: z.string().describe(
    "The current situation that led to the dilemma (400–600 words). Describe the sequence of " +
    "events, stakeholder pressures, financial indicators, and regulatory context. Must be grounded " +
    "entirely in the source material — no fabricated data."
  ),
  dilemma: z.string().describe(
    "The core strategic dilemma in 3–5 sentences. Must present genuine conflicting pressures " +
    "with no obvious right answer and significant consequences either way. " +
    "Format: 'You are [Name, Title]. It is [Date]. [Situation]. You must decide: [Option A] or [Option B]?'"
  ),
  teachingNote: z.string().describe(
    "Confidential instructor guide (500–700 words). Sections: " +
    "(1) Case Synopsis, (2) Learning Objectives (3 bullet points), " +
    "(3) Theoretical Frameworks to Apply, (4) Suggested Class Roadmap (opening/mid/closing), " +
    "(5) Common Student Mistakes to Correct, (6) Resolution — what actually happened."
  ),
  exhibits: z.array(financialExhibitSchema).min(1).max(5).describe(
    "1–5 financial exhibits extracted from the source data. Each must map to a specific event " +
    "or metric mentioned in the events. Do not invent data."
  ),
  questions: z.array(discussionQuestionSchema).min(4).max(6).describe(
    "4–6 Socratic discussion questions. Progress from situational awareness → analytical → evaluative → prescriptive."
  ),
});

export type CaseStudyGen = z.infer<typeof caseStudySchema>;
