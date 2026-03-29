export default function InstanceDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded bg-zinc-800" />
        <div className="h-8 w-64 rounded bg-zinc-800" />
        <div className="h-12 w-48 rounded-xl bg-zinc-800" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  );
}
