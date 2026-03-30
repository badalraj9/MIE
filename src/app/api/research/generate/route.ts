import { NextRequest } from "next/server";
import { GROQ_MODEL, MAX_GENERATION_TOKENS } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const { messages, topic } = await request.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response("GROQ_API_KEY not configured", { status: 500 });
    }

    const systemPrompt = `You are a Wharton/HBS level business case strategist. Generate publication-ready academic content.

    Can generate: Case Studies, Research Briefs, Analysis Papers.
    
    Focus on this topic: ${topic || "general strategic analysis"}.
    For case studies include: Opening hook (2nd person), Background, Situation, Dilemma, Discussion questions.
    Use professional business terminology. Publication ready quality.`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).slice(-2).map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      }))
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: chatMessages,
        max_tokens: MAX_GENERATION_TOKENS,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response("Error: " + err, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No content generated";

    return new Response(reply, { headers: { "Content-Type": "text/plain" } });
  } catch (error) {
    console.error("Research error:", error);
    return new Response("Error: " + String(error), { status: 500 });
  }
}
