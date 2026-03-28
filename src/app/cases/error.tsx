"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-neutral-50 p-6">
      <div className="max-w-md text-center">
        <h2 className="mb-4 font-serif text-2xl font-bold text-slate-900">
          Failed to load case
        </h2>
        <p className="mb-6 font-sans text-slate-600">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-slate-900 px-6 py-2 font-sans text-white transition-colors hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}