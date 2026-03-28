"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeachingNoteToggleProps {
  teachingNote: string;
}

export default function TeachingNoteToggle({ teachingNote }: TeachingNoteToggleProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Teaching Note</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible((v) => !v)}
          className="font-sans text-xs gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50"
        >
          <BookOpen size={13} />
          {isVisible ? "Hide" : "Show for Professor"}
          {isVisible ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </Button>
      </div>
      {isVisible ? (
        <div className="bg-amber-50 p-6 border border-amber-200 rounded-sm italic text-amber-900">
          <p className="whitespace-pre-line">{teachingNote}</p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-16 rounded-md border-2 border-dashed border-amber-200 bg-amber-50/50">
          <p className="text-sm text-amber-600 font-sans font-medium">
            🔒 Teaching note — visible to instructors only
          </p>
        </div>
      )}
    </section>
  );
}
