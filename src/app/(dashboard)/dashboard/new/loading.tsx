export default function NewInstanceLoading() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-24 rounded bg-zinc-800" />
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-12 rounded-xl bg-zinc-900" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-900" />
          ))}
        </div>
        <div className="h-12 rounded-xl bg-zinc-900" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  );
}
