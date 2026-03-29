import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="flex items-center justify-between border-b border-zinc-800/50 px-6 py-4 md:px-12">
        <Link
          href="/"
          className="text-lg font-bold tracking-widest text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
        >
          MIROFISH
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard/settings"
            className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 rounded px-1"
          >
            Settings
          </Link>
          <span className="text-sm text-zinc-600">{session.user.email}</span>
          <SignOutButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
