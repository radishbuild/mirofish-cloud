export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 rounded-xl bg-zinc-800" />
          <div className="h-11 w-40 rounded-xl bg-zinc-800" />
        </div>
        <div className="h-5 w-48 rounded bg-zinc-800" />
        <div className="h-4 w-72 rounded bg-zinc-800" />
        <div className="space-y-3 mt-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  );
}
