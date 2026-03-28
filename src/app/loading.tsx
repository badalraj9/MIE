export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
        <p className="font-serif text-slate-600">Loading case study...</p>
      </div>
    </div>
  );
}