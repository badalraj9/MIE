"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateCaseButtonProps {
  companyName: string;
  hasEvents: boolean;
}

export default function GenerateCaseButton({ companyName, hasEvents }: GenerateCaseButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/cases/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-professor-secret": process.env.NEXT_PUBLIC_PROFESSOR_SECRET ?? "",
        },
        body: JSON.stringify({ companyName, skipThresholdCheck: false }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      router.push(`/dashboard/cases/${data.caseId}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        disabled={isGenerating || !hasEvents}
        onClick={handleGenerate}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs disabled:opacity-50"
        title={!hasEvents ? "Scrape events first before generating a case" : undefined}
      >
        {isGenerating ? (
          <><Loader2 size={12} className="animate-spin" /> Generating…</>
        ) : (
          <><Wand2 size={12} /> Generate Case</>
        )}
      </Button>
      {error && <p className="text-xs text-red-600 max-w-[200px] text-right">{error}</p>}
    </div>
  );
}
