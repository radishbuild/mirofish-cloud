export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-xl bg-zinc-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  );
}
