"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  Square,
  RotateCw,
  Play,
  AlertCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmModal } from "@/components/confirm-modal";
import type { Instance } from "@/lib/types/instance";

const providerNames: Record<string, string> = {
  runpod: "RunPod",
  vastai: "Vast.ai",
};

function relativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function InstanceDetail({
  initialInstance,
}: {
  initialInstance: Instance;
}) {
  const router = useRouter();
  const [inst, setInst] = useState<Instance>(initialInstance);
  const [showDestroy, setShowDestroy] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/instances/${inst.id}/status`);
      if (res.ok) {
        setInst(await res.json());
      }
    } catch {
      // Silently fail on poll — we already have data
    }
  }, [inst.id]);

  useEffect(() => {
    // Immediately fetch fresh status (server-rendered data may be stale)
    load();
    // Poll more often during provisioning (every 10s), slower when running (every 30s)
    const timer = setInterval(
      () => {
        if (!document.hidden) load();
      },
      inst.status === "provisioning" ? 10000 : 30000,
    );
    return () => clearInterval(timer);
  }, [load, inst.status]);

  async function doAction(action: string) {
    setActionError("");
    try {
      const res = await fetch(`/api/instances/${inst.id}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to ${action}`);
      }
      if (action === "destroy") {
        router.push("/dashboard");
        return;
      }
      load();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : `Failed to ${action}`);
    }
  }

  const displayName =
    inst.name || providerNames[inst.provider] || inst.provider;

  const consoleUrl = inst.providerInstanceId
    ? inst.provider === "runpod"
      ? `https://www.runpod.io/console/pods?podId=${inst.providerInstanceId}`
      : inst.provider === "vastai"
        ? `https://cloud.vast.ai/instances`
        : null
    : null;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 hover:text-zinc-100 transition-all duration-200 mb-6 inline-block focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded"
      >
        &larr; Instances
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-zinc-100 font-display">
            {displayName}
          </h1>
          <StatusBadge status={inst.status} />
        </div>
      </div>

      {/* Provider console link — prominent during provisioning */}
      {inst.status === "provisioning" && consoleUrl && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400 mb-2">
            Your instance is starting up. This typically takes 8–10 minutes
            (pulling models, starting Neo4j and Ollama). Check the logs for
            progress:
          </p>
          <a
            href={consoleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 transition-all duration-200 hover:border-zinc-500 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View logs on {providerNames[inst.provider] || inst.provider}
          </a>
        </div>
      )}

      {/* Primary action: Open simulation */}
      {inst.status === "running" && inst.instanceUrl && (
        <div className="mb-8">
          <a
            href={inst.instanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
            Open simulation
          </a>
          <p className="font-mono text-sm text-zinc-500 mt-2">
            {inst.instanceUrl}
          </p>
        </div>
      )}

      {/* Contextual action for non-running */}
      {inst.status === "stopped" && (
        <div className="mb-8">
          <button
            onClick={() => doAction("start")}
            className="min-h-11 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Start instance
          </button>
        </div>
      )}

      {actionError && (
        <div
          className="flex items-center gap-1.5 text-sm text-red-400 mb-6"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {actionError}
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {[
          { label: "Model", value: inst.ollamaModel || "-" },
          { label: "GPU", value: inst.gpuType || "-" },
          {
            label: "Created",
            value: new Date(inst.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          },
          inst.lastActiveAt
            ? { label: "Last active", value: relativeTime(inst.lastActiveAt) }
            : null,
        ]
          .filter(Boolean)
          .map((item) => (
            <div
              key={item!.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors duration-200"
            >
              <span className="block text-xs text-zinc-500 mb-1">
                {item!.label}
              </span>
              <span className="font-medium text-sm text-zinc-100">
                {item!.value}
              </span>
            </div>
          ))}
      </div>

      {/* Provider console link — always visible */}
      {consoleUrl && (
        <div className="mb-8">
          <a
            href={consoleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            View on {providerNames[inst.provider] || inst.provider} console
          </a>
        </div>
      )}

      {/* Actions */}
      {inst.status === "running" && (
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => doAction("stop")}
            className="min-h-11 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm text-zinc-100 transition-all duration-200 hover:border-zinc-600 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
            Stop
          </button>
          <button
            onClick={() => doAction("restart")}
            className="min-h-11 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm text-zinc-100 transition-all duration-200 hover:border-zinc-600 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Restart
          </button>
        </div>
      )}

      {/* Danger zone */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger zone</h2>
        <p className="text-sm text-red-400/80 mb-4">
          Permanently destroy this instance and all its data. This action cannot
          be undone.
        </p>
        <button
          onClick={() => setShowDestroy(true)}
          className="min-h-11 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/20 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          Destroy instance
        </button>
      </div>

      <ConfirmModal
        open={showDestroy}
        onClose={() => setShowDestroy(false)}
        onConfirm={() => doAction("destroy")}
        title="Destroy instance"
        description={`This will permanently destroy "${displayName}" and delete all simulation data. This cannot be undone.`}
        confirmText={displayName}
      />
    </div>
  );
}
