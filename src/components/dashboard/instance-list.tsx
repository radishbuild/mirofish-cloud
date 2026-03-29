"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Play, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { Instance } from "@/lib/types/instance";

const providerNames: Record<string, string> = {
  runpod: "RunPod",
  vastai: "Vast.ai",
};

function getAction(
  status: string,
): { label: string; icon: typeof Play } | null {
  switch (status) {
    case "running":
      return { label: "Open simulation", icon: ExternalLink };
    case "stopped":
      return { label: "Start", icon: Play };
    default:
      return null;
  }
}

export function InstanceList({
  initialInstances,
  maxInstances,
}: {
  initialInstances: Instance[];
  maxInstances: number;
}) {
  const [instances, setInstances] = useState<Instance[]>(initialInstances);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/instances/mine");
        if (res.ok) {
          setInstances(await res.json());
          setError("");
        }
      } catch {
        // Silently fail on poll — we already have data
      }
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (instances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        {/* Animated network graph */}
        <div className="relative h-32 w-32 mb-6" aria-hidden="true">
          {/* Connecting lines */}
          <div className="absolute top-6 left-8 w-16 h-px bg-emerald-500/20 rotate-45 origin-left motion-safe:animate-pulse" />
          <div className="absolute top-6 left-8 w-20 h-px bg-emerald-500/20 rotate-12 origin-left motion-safe:animate-pulse [animation-delay:0.5s]" />
          <div className="absolute bottom-10 left-14 w-14 h-px bg-emerald-500/20 -rotate-30 origin-left motion-safe:animate-pulse [animation-delay:1s]" />
          <div className="absolute top-14 right-6 w-12 h-px bg-emerald-500/20 rotate-60 origin-left motion-safe:animate-pulse [animation-delay:0.3s]" />
          {/* Nodes */}
          <div className="absolute top-4 left-6 h-3 w-3 rounded-full bg-emerald-400/60 motion-safe:animate-pulse" />
          <div className="absolute top-12 right-4 h-4 w-4 rounded-full bg-emerald-500/40 motion-safe:animate-pulse [animation-delay:0.7s]" />
          <div className="absolute bottom-8 left-12 h-3.5 w-3.5 rounded-full bg-emerald-400/50 motion-safe:animate-pulse [animation-delay:0.3s]" />
          <div className="absolute top-16 left-4 h-2.5 w-2.5 rounded-full bg-emerald-500/30 motion-safe:animate-pulse [animation-delay:1.2s]" />
          <div className="absolute bottom-4 right-8 h-3 w-3 rounded-full bg-emerald-400/40 motion-safe:animate-pulse [animation-delay:0.9s]" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-100 mb-2 font-display">
          Launch your first simulation
        </h1>
        <p className="text-zinc-400 max-w-md mb-6">
          Deploy a dedicated instance and start running multi-agent social media
          simulations in minutes.
        </p>
        <Link
          href="/dashboard/new"
          className="min-h-11 inline-flex items-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          Create instance
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          className="flex items-center gap-2 text-sm text-red-400 mb-4"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 font-display">
          Instances ({instances.length} of {maxInstances})
        </h1>
        {instances.length < maxInstances && (
          <Link
            href="/dashboard/new"
            className="min-h-11 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New instance
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instances.map((inst) => {
          const action = getAction(inst.status);
          const displayName =
            inst.name || providerNames[inst.provider] || inst.provider;

          return (
            <Link
              key={inst.id}
              href={`/dashboard/${inst.id}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 hover:border-emerald-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-zinc-100 truncate">
                  {displayName}
                </h2>
                <StatusBadge status={inst.status} />
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                {providerNames[inst.provider] || inst.provider}
                {inst.ollamaModel ? ` \u00b7 ${inst.ollamaModel}` : ""}
              </p>
              {action && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 group-hover:underline">
                  <action.icon className="h-4 w-4" aria-hidden="true" />
                  {action.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* + New instance card */}
        {instances.length < maxInstances && (
          <Link
            href="/dashboard/new"
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 p-5 text-zinc-500 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 min-h-36"
          >
            <Plus className="h-8 w-8 mb-2" aria-hidden="true" />
            <span className="text-sm font-medium">New instance</span>
          </Link>
        )}
      </div>
    </>
  );
}
