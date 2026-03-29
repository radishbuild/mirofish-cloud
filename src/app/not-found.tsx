import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-zinc-100 mb-2 font-display">
          404
        </h1>
        <p className="text-lg text-zinc-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="min-h-11 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
