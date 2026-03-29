"use client";

import { useState } from "react";
import { PROVIDER_CREDENTIAL_FIELDS } from "@/lib/providers/types";
import { ExternalLink, AlertCircle, Loader2 } from "lucide-react";

interface InlineCredentialFormProps {
  provider: string;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onConnected?: () => void;
  compact?: boolean;
}

const providerNames: Record<string, string> = {
  runpod: "RunPod",
  vastai: "Vast.ai",
};

export function InlineCredentialForm({
  provider,
  values,
  onChange,
  onConnected,
  compact,
}: InlineCredentialFormProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const config = PROVIDER_CREDENTIAL_FIELDS[provider];
  if (!config) return null;

  const allFilled = config.fields.every((f) => values[f.key]?.trim());

  async function handleConnect() {
    setConnecting(true);
    setError("");
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, credentials: values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect. Check your API key.");
      }
      onConnected?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div
      className={
        compact
          ? "space-y-3"
          : "space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
      }
    >
      {!compact && (
        <p className="text-sm font-medium text-zinc-100">
          Connect {providerNames[provider] || provider}
        </p>
      )}

      {config.fields.map((f) => (
        <div key={f.key}>
          <label
            htmlFor={`cred-${provider}-${f.key}`}
            className="block text-sm text-zinc-400 mb-1"
          >
            {f.label}
          </label>
          <input
            id={`cred-${provider}-${f.key}`}
            type="password"
            value={values[f.key] || ""}
            onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      ))}

      <div className="flex items-center justify-between">
        <a
          href={config.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors rounded"
        >
          Get key <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>

        <button
          onClick={handleConnect}
          disabled={!allFilled || connecting}
          className="min-h-10 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          {connecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Connecting...
            </>
          ) : (
            "Connect"
          )}
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-1.5 text-sm text-red-400"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}
