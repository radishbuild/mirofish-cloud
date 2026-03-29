import Link from "next/link";

export default function InstanceNotFound() {
  return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <h1 className="text-3xl font-bold text-zinc-100 mb-2 font-display">
        Instance not found
      </h1>
      <p className="text-sm text-zinc-400 mb-6">
        This instance may have been destroyed or doesn&apos;t exist.
      </p>
      <Link
        href="/dashboard"
        className="min-h-11 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
