"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, AlertCircle } from "lucide-react";

interface ProviderConfig {
  id: string;
  name: string;
}

const providers: ProviderConfig[] = [
  { id: "runpod", name: "RunPod" },
  { id: "vastai", name: "Vast.ai" },
];

export function SettingsPanel({
  initialStatuses,
}: {
  initialStatuses: Record<string, boolean>;
}) {
  const [statuses, setStatuses] =
    useState<Record<string, boolean>>(initialStatuses);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<
    Record<string, { type: "success" | "error"; text: string }>
  >({});

  async function deleteCredentials(providerId: string) {
    setDeleting((prev) => ({ ...prev, [providerId]: true }));

    try {
      const res = await fetch(`/api/credentials/${providerId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to disconnect");
      }
      setStatuses((prev) => ({ ...prev, [providerId]: false }));
      setMessages((prev) => ({
        ...prev,
        [providerId]: { type: "success", text: "Disconnected." },
      }));
    } catch (e: unknown) {
      setMessages((prev) => ({
        ...prev,
        [providerId]: {
          type: "error",
          text: e instanceof Error ? e.message : "Failed to disconnect",
        },
      }));
    } finally {
      setDeleting((prev) => ({ ...prev, [providerId]: false }));
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 font-display">
          Settings
        </h1>
        <Link
          href="/dashboard"
          className="min-h-11 inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 transition-all duration-200 hover:border-zinc-600 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          Back to dashboard
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-zinc-100 mb-2">
        Provider credentials
      </h2>
      <p className="text-sm text-zinc-400 mb-6">
        Your GPU provider API keys. AES-256 encrypted and only decrypted
        server-side to provision and manage your instances. Connect providers
        when creating a new instance.
      </p>

      <div className="space-y-2">
        {providers.map((p) => {
          const connected = statuses[p.id] ?? false;
          const isDeleting = deleting[p.id] ?? false;
          const message = messages[p.id];

          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-sm text-zinc-100">
                  {p.name}
                </h3>
                {connected ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Connected
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                    Not connected
                  </span>
                )}
                {message && (
                  <span
                    className={`flex items-center gap-1 text-xs ${
                      message.type === "success"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                    role={message.type === "error" ? "alert" : undefined}
                  >
                    {message.type === "error" ? (
                      <AlertCircle
                        className="h-3 w-3 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                    )}
                    {message.text}
                  </span>
                )}
              </div>
              {connected && (
                <button
                  onClick={() => deleteCredentials(p.id)}
                  disabled={isDeleting}
                  className="min-h-9 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 transition-all duration-200 hover:bg-red-500/10 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                >
                  {isDeleting ? "Disconnecting..." : "Disconnect"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
