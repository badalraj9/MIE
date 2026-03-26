import { z } from "zod";

export const financialExhibitSchema = z.object({
  title: z.string().describe("The title of the financial exhibit."),
  chartType: z.enum(["BAR", "LINE", "TABLE"]).describe("The visual representation type."),
  data: z.string().describe("JSON stringified array of data points. e.g. '[{\"year\": 2021, \"revenue\": 100}]'"),
});

export const discussionQuestionSchema = z.object({
  question: z.string().describe("A socratic discussion question based on the case dilemma."),
});

export const caseStudySchema = z.object({
  title: z.string().describe("The official title of the Wharton-style case study."),
  hook: z.string().describe("The opening hook placing the reader in the shoes of the decision maker at the exact moment of choice."),
  background: z.string().describe("Company and sector background, historical context."),
  situation: z.string().describe("The current situation leading up to the dilemma, supported by data."),
  dilemma: z.string().describe("The conflicting pressures and the difficult decision that must be made with no obvious right answer."),
  teachingNote: z.string().describe("The professor's hidden guide. Contains the 'lesson', the underlying theory, and how to guide the class debate."),
  exhibits: z.array(financialExhibitSchema).describe("Financial charts and tables extracted from the data."),
  questions: z.array(discussionQuestionSchema).describe("3-5 discussion questions for the students."),
});

export type CaseStudyGen = z.infer<typeof caseStudySchema>;
