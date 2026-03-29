"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/login");
      }}
      className="min-h-10 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-all duration-200 hover:border-zinc-500 hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      Log out
    </button>
  );
}
