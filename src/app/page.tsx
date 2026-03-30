"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Loader2,
  Scale,
  Scroll,
  Send,
  TrendingUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = { id: string; role: "user" | "assistant"; content: string };

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/research/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })), topic: query })
      });
      const reply = await res.text();
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "Error: " + String(err) }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="relative px-6 py-6 md:px-12 md:py-8 border-b border-border/40 bg-card/50">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Scale size={22} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold tracking-tight">Strategic Intelligence</h1>
              <p className="text-xs text-muted-foreground">Research & Analysis Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/library" className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm border border-border hover:bg-secondary/80">
              <FileText size={14} />
              <span>Library</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 md:px-12 py-8">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl font-bold mb-3">What would you like to research?</h2>
          <p className="text-muted-foreground">Generate case studies, analysis papers, research briefs - any topic, instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="floating-tile p-2 mb-10 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Tesla's vertical integration strategy, Byju's governance crisis, LBO structuring..."
            className="flex-1 h-12 bg-transparent px-4 text-lg outline-none"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>

        {messages.length > 0 && (
          <div className="space-y-8">
            {messages.map(m => (
              <div key={m.id} className={`${m.role === "user" ? "flex justify-end" : ""}`}>
                <div className={`max-w-[85%] p-6 rounded-2xl floating-tile ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border/60"}`}>
                  <p className="text-xs font-semibold mb-3 opacity-60">{m.role === "user" ? "You" : "Strategic Analysis"}</p>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                  {m.role === "assistant" && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
                      <button 
                        onClick={async () => {
                          const lastUserMsg = messages.filter(x => x.role === "user").slice(-1)[0]?.content || "Research";
                          await fetch("/api/library", {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({ topic: lastUserMsg, content: m.content, type: "Analysis" })
                          });
                        }}
                        className="flex items-center gap-1.5 text-xs bg-secondary px-3 py-1.5 rounded-full hover:bg-secondary/80"
                      >
                        Save to Library
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {messages.length === 0 && (
          <div className="grid gap-6 md:grid-cols-3 mt-12">
            <div className="floating-tile p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <BookOpen size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Case Studies</h3>
              <p className="text-sm text-muted-foreground">Generate MBA-level case studies with dilemma, background, and discussion questions.</p>
            </div>
            <div className="floating-tile p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <Scroll size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Research Briefs</h3>
              <p className="text-sm text-muted-foreground">Executive summaries on strategic topics with key insights and recommendations.</p>
            </div>
            <div className="floating-tile p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Analysis Papers</h3>
              <p className="text-sm text-muted-foreground">In-depth strategic analysis with data, frameworks, and actionable insights.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
