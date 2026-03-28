"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CaseStudy {
  id: string;
  title: string;
  hook: string;
  background: string;
  situation: string;
  dilemma: string;
  teachingNote: string;
  status: string; // "DRAFT" | "PUBLISHED"
  model: string | null;
  company: { name: string };
}

function Field({
  label,
  hint,
  value,
  onChange,
  rows = 6,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 font-serif leading-relaxed
          focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-y"
      />
    </div>
  );
}

export default function CaseEditClient({ initialCase }: { initialCase: CaseStudy }) {
  const [draft, setDraft] = useState(initialCase);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function update(field: keyof CaseStudy, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave(newStatus?: "DRAFT" | "PUBLISHED") {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          hook: draft.hook,
          background: draft.background,
          situation: draft.situation,
          dilemma: draft.dilemma,
          teachingNote: draft.teachingNote,
          status: newStatus ?? draft.status,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Save failed");
      }
      if (newStatus) setDraft((prev) => ({ ...prev, status: newStatus }));
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Permanently delete "${draft.title}"?`)) return;
    await fetch(`/api/cases/${draft.id}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  // Auto-save indicator: reset after 3s
  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans flex flex-col">
      {/* Top Bar */}
      <header className="border-b bg-slate-900 text-white px-8 py-4 shrink-0">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white -ml-2 shrink-0">
                <ArrowLeft size={13} className="mr-1" /> Dashboard
              </Button>
            </Link>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">{draft.company.name}{draft.model ? ` — ${draft.model}` : ""}</p>
              <h1 className="text-base font-bold font-serif truncate">{draft.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle2 size={12} /> Saved
              </span>
            )}
            {error && <span className="text-xs text-red-400">{error}</span>}

            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              draft.status === "PUBLISHED" ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"
            }`}>
              {draft.status}
            </span>

            <Link href={`/cases/${draft.id}`} target="_blank">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800 gap-1">
                <Eye size={13} /> Preview
              </Button>
            </Link>

            <Button
              size="sm"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="bg-white text-slate-900 hover:bg-slate-100 gap-1"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Draft
            </Button>

            {draft.status === "DRAFT" ? (
              <Button
                size="sm"
                onClick={() => handleSave("PUBLISHED")}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white gap-1"
              >
                Publish
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSave("DRAFT")}
                disabled={isSaving}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Unpublish
              </Button>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              title="Delete case"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </header>

      {/* Editor Body */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-8 py-10 space-y-8">
          <Field
            label="Title"
            hint='Format: "Company: Decisive Verb Phrase, Year"'
            value={draft.title}
            onChange={(v) => update("title", v)}
            rows={2}
          />
          <Field
            label="Opening Hook"
            hint="2–3 sentences in second person. Place the reader as the protagonist at the exact moment of decision."
            value={draft.hook}
            onChange={(v) => update("hook", v)}
            rows={4}
          />
          <Field
            label="Background"
            hint="400–600 words. Company history, business model, market position, key metrics."
            value={draft.background}
            onChange={(v) => update("background", v)}
            rows={12}
          />
          <Field
            label="The Situation"
            hint="400–600 words. Sequence of events, stakeholder pressures, financial indicators, regulatory context."
            value={draft.situation}
            onChange={(v) => update("situation", v)}
            rows={12}
          />
          <Field
            label="The Dilemma"
            hint="3–5 sentences. Genuine conflict with no obvious right answer."
            value={draft.dilemma}
            onChange={(v) => update("dilemma", v)}
            rows={5}
          />
          <Field
            label="Teaching Note (Confidential)"
            hint="Professor-only. Synopsis, learning objectives, class roadmap, resolution."
            value={draft.teachingNote}
            onChange={(v) => update("teachingNote", v)}
            rows={14}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button onClick={() => handleSave()} disabled={isSaving} className="bg-slate-900 text-white hover:bg-slate-800 gap-1.5">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
