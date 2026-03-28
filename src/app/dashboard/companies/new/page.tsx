"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Loader2, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCompanyPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed); // validate
      if (!urls.includes(trimmed)) setUrls((prev) => [...prev, trimmed]);
      setUrlInput("");
    } catch {
      setError("Please enter a valid URL (starting with https://)");
    }
  }

  function removeUrl(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Company name is required."); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, sourceUrls: urls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create company");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <header className="border-b bg-slate-900 text-white px-8 py-5">
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white -ml-2">
              <ArrowLeft size={14} className="mr-1" /> Dashboard
            </Button>
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">MIE Platform</p>
            <h1 className="text-xl font-bold font-serif">Add Company to Watch List</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-8 py-10">
        <Card className="border-slate-200">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Building2 size={18} className="text-slate-600" />
              </div>
              <CardTitle className="text-lg font-serif">Company Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Company Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Byju's, Adani Group, Zomato"
                  className="border-slate-300"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the company (optional)"
                  className="border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Source URLs to Monitor</label>
                <p className="text-xs text-slate-500">
                  Add article/section URLs from SEBI, Economic Times, MoneyControl, NSE, etc.
                  The scraper will fetch and AI-score each URL for teachability.
                </p>

                <div className="flex gap-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
                    placeholder="https://economictimes.indiatimes.com/topic/..."
                    className="border-slate-300 flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addUrl} className="shrink-0">
                    <Plus size={14} />
                  </Button>
                </div>

                {urls.length > 0 && (
                  <ul className="space-y-1.5 mt-2">
                    {urls.map((url) => (
                      <li key={url} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                        <span className="text-xs text-slate-600 truncate font-mono">{url}</span>
                        <button type="button" onClick={() => removeUrl(url)} className="shrink-0 text-slate-400 hover:text-slate-700">
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Link href="/dashboard">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 text-white hover:bg-slate-800 gap-1.5"
                >
                  {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Add Company"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
