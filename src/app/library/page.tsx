"use client";

import { useState, useEffect } from "react";
import { FileText, Search, ExternalLink, Scroll } from "lucide-react";
import Link from "next/link";

type ResearchItem = {
  id: string;
  topic: string;
  content: string;
  type: string;
  createdAt: string;
};

export default function LibraryPage() {
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/library")
      .then(res => res.json())
      .then(data => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => 
    i.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <header className="relative px-6 py-6 md:px-12 md:py-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold tracking-tight">Research Library</h1>
              <p className="text-xs text-muted-foreground">Your saved analyses, papers & cases</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Scroll size={14} />
            <span>New Research</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 md:px-12">
        <div className="floating-tile p-4 mb-8 flex items-center gap-4">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your research..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none"
          />
          <span className="text-sm text-muted-foreground">{filtered.length} items</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading library...</div>
        ) : filtered.length === 0 ? (
          <div className="floating-tile p-12 text-center">
            <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-xl font-semibold mb-2">No Research Yet</h3>
            <p className="text-muted-foreground mb-6">Generate your first case study or analysis to see it here.</p>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">
              Start Researching
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(item => (
              <div key={item.id} className="floating-tile p-6 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {item.type || "Analysis"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("en-US", { 
                          month: "short", day: "numeric", year: "numeric" 
                        })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.topic}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.content.substring(0, 250)}...</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={`/library/${item.id}`}
                      className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80"
                    >
                      <ExternalLink size={12} /> View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
