import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { GENERATION_MODEL, MAX_CONTEXT_ITEMS } from "@/lib/config";

const contextSchema = z.object({
  topic: z.string(),
  companies: z.array(z.object({
    name: z.string(),
    events: z.array(z.object({
      title: z.string(),
      date: z.string(),
      content: z.string(),
    })),
  })).optional(),
  summary: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Search for relevant companies/events in the database
    const searchTerms = topic.toLowerCase().split(/[\s,\-]+/).filter(Boolean);
    
    const companies = await prisma.company.findMany({
      include: {
        events: {
          orderBy: { date: "desc" },
          take: MAX_CONTEXT_ITEMS,
        },
      },
      take: 10,
    });

    // Score and filter companies by relevance to topic
    const relevantCompanies = companies
      .map((company) => {
        const companyName = company.name.toLowerCase();
        const eventMatches = company.events.filter((event) => {
          const searchText = `${companyName} ${event.title} ${event.content}`.toLowerCase();
          return searchTerms.some((term) => searchText.includes(term));
        });
        return { company, eventMatches };
      })
      .filter(({ eventMatches }) => eventMatches.length > 0)
      .slice(0, 5);

    // If no stored data, generate context from AI
    if (relevantCompanies.length === 0) {
      const { object } = await generateObject({
        model: openai(GENERATION_MODEL),
        schema: contextSchema,
        prompt: `Generate a detailed context for debating: "${topic}"

        Provide:
        1. A list of 2-3 example companies that would be relevant to this topic for debate
        2. A comprehensive summary explaining the key aspects, stakeholders, challenges, and strategicdilemmas related to this topic
        3. The context should be suitable for a Wharton-level Socratic debate session`,
        maxTokens: 4000,
      });

      return NextResponse.json({
        companies: object.companies?.map((c) => c.name) || [],
        context: object.summary,
      });
    }

    // Combine stored data into context
    const context = relevantCompanies
      .map(({ company, eventMatches }) => {
        const events = eventMatches.map((e) => 
          `[${e.date ? new Date(e.date).toISOString().split("T")[0] : "Recent"}] ${e.title}: ${e.content.substring(0, 300)}...`
        ).join("\n\n");
        return `## ${company.name}\n\n${events}`;
      })
      .join("\n\n---\n\n");

    return NextResponse.json({
      companies: relevantCompanies.map((c) => c.company.name),
      context: context || "Context generated from your stored data. Use the stored events to build your debate.",
    });
  } catch (error) {
    console.error("Context generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate context", context: "Could not generate context from stored data." },
      { status: 500 }
    );
  }
}