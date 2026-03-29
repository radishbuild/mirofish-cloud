"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-zinc-400 mb-6">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-950 hover:bg-emerald-400"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
