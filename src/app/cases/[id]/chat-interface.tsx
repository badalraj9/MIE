"use client";

import { useChat } from "@ai-sdk/react";
import { CaseStudy, Company } from "@prisma/client";
import { Send, User, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

type CaseStudyWithCompany = CaseStudy & {
  company: Company;
};

interface ChatInterfaceProps {
  caseContext: CaseStudyWithCompany;
}

export default function ChatInterface({ caseContext }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      caseContext: {
        title: caseContext.title,
        company: caseContext.company,
        dilemma: caseContext.dilemma,
        situation: caseContext.situation,
      },
    },
    initialMessages: [
      {
        id: "welcome-msg",
        role: "assistant",
        content: `Welcome to the class. We are analyzing the **${caseContext.company.name}** case today. You've read about their dilemma regarding *${caseContext.dilemma.substring(0, 100)}...*\n\nAs the protagonist, what is your **primary strategic imperative** right now?`,
      },
    ],
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="flex flex-col gap-6 pb-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[85%] gap-3 rounded-2xl px-4 py-3 ${
                  m.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-800 border border-slate-200"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <BrainCircuit size={14} />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${m.role === "user" ? "text-slate-300" : "text-slate-500"}`}>
                    {m.role === "user" ? "You" : "Professor"}
                  </span>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-slate max-w-none font-sans leading-relaxed
                      prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-slate-800
                      prose-headings:text-slate-800 prose-headings:font-semibold">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-sm font-sans leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </div>
                  )}
                </div>

                {m.role === "user" && (
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                    <User size={14} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[85%] gap-3 rounded-2xl px-4 py-3 bg-slate-100 text-slate-800 border border-slate-200">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 animate-pulse">
                  <BrainCircuit size={14} />
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white p-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Present your argument..."
            className="flex-1 rounded-full border-slate-300 focus-visible:ring-slate-900 font-sans shadow-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-colors"
          >
            <Send size={16} />
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-2 font-sans">
          The Professor will challenge your assumptions based on the case data.
        </p>
      </div>
    </div>
  );
}
