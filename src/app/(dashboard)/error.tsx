"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <AlertCircle
        className="h-10 w-10 text-red-400 mx-auto mb-4"
        aria-hidden="true"
      />
      <h1 className="text-2xl font-bold text-zinc-100 mb-2 font-display">
        Something went wrong
      </h1>
      <p className="text-sm text-zinc-400 mb-6">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={reset}
          className="min-h-11 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="min-h-11 inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm text-zinc-100 transition-all duration-200 hover:border-zinc-600 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
