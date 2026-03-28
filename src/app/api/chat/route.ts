import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  CHAT_MODEL,
  MAX_CHAT_TOKENS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from '@/lib/config';

export const maxDuration = 30;

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return true;
  entry.count++;
  return false;
}

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before continuing the discussion." },
      { status: 429 }
    );
  }

  try {
    const { messages, caseContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI not configured. Add OPENAI_API_KEY to .env" }, { status: 503 });
    }

    const systemPrompt = `You are a distinguished Wharton Business School professor leading a case method discussion.
Your role is to guide the student through the business dilemma using the Socratic method.

## YOUR RULES
1. Never give the answer directly. Ask one probing question at a time.
2. Challenge assumptions with data from the case. Reference specific exhibits or events when possible.
3. When a student makes a strong point, acknowledge it briefly, then push deeper: "Interesting — but have you considered...?"
4. When a student makes a weak argument, expose the gap gently: "Walk me through the financial reasoning there."
5. After 5–6 exchanges, begin steering toward a structured framework (Porter's Five Forces, BCG Matrix, etc.) relevant to the case.
6. Use markdown formatting: **bold** for key terms, bullet points for trade-offs, > blockquotes for student quotes you're challenging.
7. Keep responses under 150 words unless explicitly asked to elaborate.

## CASE CONTEXT
Title: ${caseContext?.title ?? "Unknown Case"}
Company: ${caseContext?.company?.name ?? "Unknown Company"}
Dilemma: ${caseContext?.dilemma ?? ""}
Situation: ${caseContext?.situation ?? ""}

Maintain an academically rigorous, encouraging, and intellectually demanding tone.`;

    const result = await streamText({
      model: openai(CHAT_MODEL),
      system: systemPrompt,
      messages,
      maxTokens: MAX_CHAT_TOKENS,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
