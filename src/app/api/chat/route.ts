import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, caseContext } = await req.json();

    // System prompt sets the persona of a Wharton professor leading a Socratic case discussion
    const systemPrompt = `You are a distinguished Wharton Business School professor leading a case method discussion.
    Your goal is to guide the student through the business dilemma presented in the case study via Socratic questioning.
    Do not give direct answers immediately. Instead, ask probing questions that force the student to consider trade-offs, financial implications, strategic alignment, and competitive dynamics.

    Case Context:
    Title: ${caseContext?.title}
    Company: ${caseContext?.company?.name}
    Dilemma: ${caseContext?.dilemma}
    Situation: ${caseContext?.situation}

    Maintain a rigorous, academic, yet encouraging tone. Challenge assumptions gently.`;

    if (!process.env.OPENAI_API_KEY) {
      // Mock response if no API key is present for MVP testing
      const stream = new ReadableStream({
        start(controller) {
           controller.enqueue(new TextEncoder().encode('0:"[MOCK MODE - Socratic Debate] That is an interesting perspective, but have you considered the cash flow implications of that decision in Q3? How might the competitors respond?"\n'));
           controller.close();
        }
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
