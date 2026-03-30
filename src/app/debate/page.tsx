"use client";

import { useState, useEffect, useRef } from "react";
import { Scale, PenTool, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = { id: string; role: "user" | "assistant"; content: string };

const AI_ROLES = [
  { id: "CHALLENGER", name: "Challenger" },
  { id: "DEFENDER", name: "Defender" },
  { id: "REGULATOR", name: "Regulator" },
  { id: "INVESTOR", name: "Investor" },
  { id: "BOARD_MEMBER", name: "Board Member" },
  { id: "COMPETITOR", name: "Competitor" },
];

export default function DebatePage() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [context, setContext] = useState<{topic: string; contextData: string} | null>(null);
  const [currentRole, setCurrentRole] = useState("CHALLENGER");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function startDebate(t: string) {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/debate/generate-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t })
      });
      const data = await res.json();
      setContext({ topic: t, contextData: data.context || "Strategic context for discussion." });
    } catch {
      setContext({ topic: t, contextData: "General strategic context." });
    } finally {
      setIsGenerating(false);
      setInitialized(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({ role: m.role, content: m.content })),
          topic: context?.topic,
          contextData: context?.contextData,
          currentRole
        })
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

  if (!initialized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <div className="max-w-xl w-full">
          <div className="text-center mb-10">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
              <Scale size={40} className="text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold mb-4">Strategic Debate Chamber</h1>
            <p className="text-lg text-muted-foreground">Peer-level strategic analysis and discourse</p>
          </div>
          <div className="floating-tile p-8">
            <label className="block text-sm font-medium mb-3">What would you like to analyze?</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Tesla EV strategy crisis"
              className="w-full h-32 rounded-2xl border border-border bg-background p-4 text-sm mb-4"
            />
            <button
              onClick={() => startDebate(topic)}
              disabled={!topic.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg hover:scale-[1.02]"
            >
              <PenTool size={18} />
              <span>{isGenerating ? "Analyzing..." : "Begin Session"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface">
      <div className="w-1/3 border-r border-border p-6 overflow-y-auto">
        <div className="floating-tile p-4">
          <h3 className="font-semibold">{context?.topic}</h3>
          <p className="text-sm text-muted-foreground mt-2">{context?.contextData}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <select 
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="bg-background border border-border rounded-full px-4 py-2 text-sm"
          >
            {AI_ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button onClick={() => setInitialized(false)} className="text-sm text-muted-foreground hover:text-foreground">New Session</button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground p-8">Present your position to begin</p>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex mb-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl floating-tile ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border/60"}`}>
                <p className="text-xs mb-1 opacity-70">{m.role === "user" ? "You" : currentRole}</p>
                {m.role === "assistant" ? <ReactMarkdown>{m.content}</ReactMarkdown> : <p>{m.content}</p>}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground p-4">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span>Thinking...</span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your argument..."
            className="flex-1 h-10 rounded-full border border-border bg-background px-4 text-sm"
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="h-10 px-4 rounded-full bg-primary text-primary-foreground">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
