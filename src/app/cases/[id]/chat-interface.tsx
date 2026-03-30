"use client";

import { useChat } from "@ai-sdk/react";
import { CaseStudy, Company } from "@prisma/client";
import { Send, User, GraduationCap } from "lucide-react";
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
        content: `Welcome to today's class discussion. We're analyzing the **${caseContext.company.name}** case. We're examining the critical strategic decision regarding *${caseContext.dilemma.substring(0, 120)}...*\n\nAs the protagonist facing this dilemma, what is your **primary strategic imperative** at this moment?`,
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
    <div className="flex flex-col h-full bg-card/30">
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="flex flex-col gap-4 pb-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[85%] gap-3 rounded-2xl px-4 py-3 floating-tile ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "bg-card text-foreground border border-border/60"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <GraduationCap size={14} />
                  </div>
                )}

                <div className="flex flex-col gap-1 flex-1">
                  <span className={`text-xs font-semibold ${m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {m.role === "user" ? "You (Student)" : "Analyst"}
                  </span>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-slate max-w-none leading-relaxed
                      prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-foreground
                      prose-headings:text-foreground prose-headings:font-semibold prose-a:text-primary">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </div>
                  )}
                </div>

                {m.role === "user" && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground">
                    <User size={14} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[85%] gap-3 rounded-2xl px-4 py-3 floating-tile bg-card text-foreground border border-border/60">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
                  <GraduationCap size={14} />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border/40 bg-card/80 backdrop-blur-md p-4">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Present your argument..."
            className="flex-1 h-10 rounded-full border border-border bg-background px-4 text-sm shadow-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-2.5">
          The Analyst will challenge your assumptions based on the case data.
        </p>
      </div>
    </div>
  );
}
