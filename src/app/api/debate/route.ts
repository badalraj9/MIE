import { NextRequest } from "next/server";
import { GROQ_MODEL, DEBATE_MAX_TOKENS } from "@/lib/config";

const AI_ROLE_PROMPTS: Record<string, string> = {
  CHALLENGER: "Question assumptions, point out flaws, challenge to defend stance",
  DEFENDER: "Argue in favor, strengthen argument, anticipate counterarguments", 
  REGULATOR: "Focus on legal risks, compliance hurdles, regulatory concerns",
  INVESTOR: "Analyze ROI, financial viability, valuation concerns",
  BOARD_MEMBER: "Governance, shareholder interests, fiduciary duties",
  COMPETITOR: "Highlight competitive weaknesses, how to beat them",
};

export async function POST(request: NextRequest) {
  try {
    const { messages, topic, contextData, currentRole } = await request.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response("GROQ_API_KEY not configured", { status: 500 });
    }

    const roleDesc = AI_ROLE_PROMPTS[currentRole] || AI_ROLE_PROMPTS.CHALLENGER;

    const systemMsg = `You are a strategic advisor debating with an expert. Role: ${roleDesc}. Topic: ${topic}. Context: ${contextData || 'general discussion'}. Be concise, provocative, stay in character.`;

    const chatMessages = [
      { role: "system", content: systemMsg },
      ...messages.slice(-4).map((m: { role: string; content: string }) => ({
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
        max_tokens: DEBATE_MAX_TOKENS,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response("Groq error: " + err, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response";

    return new Response(reply, { headers: { "Content-Type": "text/plain" } });
  } catch (error) {
    console.error("Debate error:", error);
    return new Response("Error: " + String(error), { status: 500 });
  }
}