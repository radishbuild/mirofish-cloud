export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-24 rounded bg-zinc-800" />
        <div className="h-2 w-2 rounded-full bg-zinc-800" />
        <div className="h-4 w-16 rounded bg-zinc-800" />
      </div>
      <div className="h-5 w-32 rounded bg-zinc-800 mb-2" />
      <div className="h-4 w-48 rounded bg-zinc-800/60" />
    </div>
  );
}
