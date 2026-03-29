"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Rocket, Check, AlertCircle, Loader2 } from "lucide-react";
import { InlineCredentialForm } from "@/components/inline-credential-form";
import type { GpuType } from "@/lib/providers/types";
import { CostEstimate } from "@/components/cost-estimate";
import { DeployProgress } from "@/components/deploy-progress";

const providers = [
  { id: "runpod", name: "RunPod", desc: "Cheapest GPUs from ~$0.35/hr." },
  { id: "vastai", name: "Vast.ai", desc: "Cheapest GPUs. Marketplace model." },
];
const ollamaModels = [
  { id: "qwen2.5:7b", name: "Qwen 2.5 7B", vram: "6 GB" },
  { id: "qwen2.5:14b", name: "Qwen 2.5 14B", vram: "10 GB" },
  { id: "qwen2.5:32b", name: "Qwen 2.5 32B", vram: "24 GB" },
  { id: "llama3.3:70b", name: "Llama 3.3 70B", vram: "48 GB" },
];

const providerTimingHints: Record<string, string> = {
  runpod: "RunPod GPU allocation typically takes 1-3 minutes.",
  vastai: "Vast.ai GPU allocation typically takes 1-3 minutes.",
};

export function CreateInstanceForm({
  initialConnectedProviders,
}: {
  initialConnectedProviders: Set<string>;
}) {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("runpod");
  const [ollamaModel, setOllamaModel] = useState("qwen2.5:14b");
  const [gpuType, setGpuType] = useState("");

  // GPU types fetched from provider
  const [gpuTypes, setGpuTypes] = useState<GpuType[]>([]);
  const [gpuLoading, setGpuLoading] = useState(false);
  const [gpuError, setGpuError] = useState("");

  // Credential values (for unconnected providers)
  const [credentialValues, setCredentialValues] = useState<
    Record<string, string>
  >({});

  // UI state
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(
    initialConnectedProviders,
  );
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState("");
  const [error, setError] = useState("");
  const [credError, setCredError] = useState("");

  function loadCredentials() {
    setCredError("");
    fetch("/api/credentials")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to check provider status.");
        return res.json();
      })
      .then((data: { provider: string; connected: boolean }[]) => {
        setConnectedProviders(
          new Set(data.filter((d) => d.connected).map((d) => d.provider)),
        );
      })
      .catch(() => {
        setCredError("Failed to check provider status.");
      });
  }

  const fetchGpuTypes = useCallback(async (providerName: string) => {
    setGpuLoading(true);
    setGpuError("");
    setGpuTypes([]);
    setGpuType("");
    try {
      const res = await fetch(`/api/providers/${providerName}/gpu-types`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch GPU types");
      }
      const types: GpuType[] = await res.json();
      setGpuTypes(types);
      const firstAvailable = types.find((g) => g.available);
      if (firstAvailable) setGpuType(firstAvailable.id);
    } catch (e: unknown) {
      setGpuError(e instanceof Error ? e.message : "Failed to fetch GPU types");
    } finally {
      setGpuLoading(false);
    }
  }, []);

  useEffect(() => {
    if (provider && connectedProviders.has(provider)) {
      fetchGpuTypes(provider);
    } else {
      setGpuTypes([]);
      setGpuType("");
      setGpuError("");
    }
  }, [provider, connectedProviders, fetchGpuTypes]);

  const selectedGpu = gpuTypes.find((g) => g.id === gpuType);

  async function deploy() {
    setDeploying(true);
    setDeployStatus("provisioning");
    setError("");

    try {
      const res = await fetch("/api/instances/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          provider,
          ollamaModel,
          gpuType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deployment failed");
      router.push(`/dashboard/${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Deployment failed");
      setDeployStatus("failed");
    } finally {
      setDeploying(false);
    }
  }

  if (deployStatus === "provisioning" || deployStatus === "failed") {
    return (
      <div className="max-w-lg mx-auto px-5 py-16 text-center">
        {deployStatus === "provisioning" && (
          <div className="mb-6">
            <Rocket
              className="h-10 w-10 text-emerald-400 mx-auto motion-safe:animate-pulse"
              aria-hidden="true"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-zinc-100 mb-2 font-display">
          {deployStatus === "failed" ? "Deployment failed" : "Deploying..."}
        </h1>

        {deployStatus === "provisioning" && (
          <p className="text-zinc-400 mb-8">
            Setting up your instance. You&apos;ll be redirected when ready.
          </p>
        )}

        <div className="text-left max-w-xs mx-auto mb-8">
          <DeployProgress
            status={deployStatus}
            providerHint={providerTimingHints[provider]}
          />
        </div>

        {error && (
          <div
            className="flex items-center gap-1.5 text-sm text-red-400 justify-center mb-4"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {deployStatus === "failed" && (
            <button
              onClick={() => {
                setDeployStatus("");
                setError("");
              }}
              className="min-h-11 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 hover:text-zinc-100 transition-all duration-200 mb-6 inline-block focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded"
      >
        &larr; Instances
      </Link>

      <h1 className="text-3xl font-bold text-zinc-100 mb-8 font-display">
        Create instance
      </h1>

      <div className="space-y-8">
        {/* Instance name */}
        <div>
          <label
            htmlFor="instance-name"
            className="block text-sm font-medium text-zinc-100 mb-1"
          >
            Instance name
          </label>
          <input
            id="instance-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Simulation"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Deploy provider */}
        <div>
          <p className="text-sm font-medium text-zinc-100 mb-2">GPU provider</p>
          {credError && (
            <div
              className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-3"
              role="alert"
            >
              <div className="flex items-center gap-2 text-red-400 mb-3">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="text-sm">{credError}</span>
              </div>
              <button
                onClick={loadCredentials}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-all duration-200 hover:border-zinc-500"
              >
                Retry
              </button>
            </div>
          )}
          <div className="space-y-2">
            {providers.map((p) => {
              const connected = connectedProviders.has(p.id);
              return (
                <div key={p.id}>
                  <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 cursor-pointer transition-all duration-200 hover:border-zinc-600 hover:-translate-y-0.5 has-[:checked]:translate-y-0 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-500/10">
                    <input
                      type="radio"
                      name="provider"
                      value={p.id}
                      checked={provider === p.id}
                      onChange={() => {
                        setProvider(p.id);
                        setCredentialValues({});
                      }}
                      className="accent-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-zinc-100">
                        {p.name}
                      </span>
                      <span className="text-xs text-zinc-500 ml-2">
                        {p.desc}
                      </span>
                    </div>
                    {connected ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <Check className="h-3 w-3" aria-hidden="true" />{" "}
                        Connected
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        Not connected
                      </span>
                    )}
                  </label>
                  {provider === p.id && !connected && (
                    <div className="mt-2 ml-6">
                      <InlineCredentialForm
                        provider={p.id}
                        values={credentialValues}
                        onChange={setCredentialValues}
                        onConnected={loadCredentials}
                        compact
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ollama model */}
        <div>
          <label
            htmlFor="model-select"
            className="block text-sm font-medium text-zinc-100 mb-1"
          >
            Ollama model
          </label>
          <select
            id="model-select"
            value={ollamaModel}
            onChange={(e) => setOllamaModel(e.target.value)}
            className="w-full min-h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            {ollamaModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.vram})
              </option>
            ))}
          </select>
        </div>

        {/* GPU selection */}
        <div>
          <p className="text-sm font-medium text-zinc-100 mb-2">
            Available GPUs{" "}
            <span className="text-zinc-500 font-normal">· live</span>
          </p>

          {!connectedProviders.has(provider) && (
            <p className="text-sm text-zinc-500">
              Connect your {provider === "runpod" ? "RunPod" : "Vast.ai"}{" "}
              account above to see available GPUs.
            </p>
          )}

          {connectedProviders.has(provider) && gpuLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded bg-zinc-800" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-32 rounded bg-zinc-800" />
                      <div className="h-3 w-48 rounded bg-zinc-800" />
                    </div>
                    <div className="h-4 w-16 rounded bg-zinc-800" />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                <Loader2
                  className="h-3.5 w-3.5 animate-spin"
                  aria-hidden="true"
                />
                Loading available GPUs...
              </div>
            </div>
          )}

          {connectedProviders.has(provider) && gpuError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center gap-2 text-red-400 mb-3">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="text-sm">{gpuError}</span>
              </div>
              <button
                onClick={() => fetchGpuTypes(provider)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-all duration-200 hover:border-zinc-500"
              >
                Retry
              </button>
            </div>
          )}

          {connectedProviders.has(provider) &&
            !gpuLoading &&
            !gpuError &&
            gpuTypes.length === 0 && (
              <p className="text-sm text-zinc-500">
                No GPUs available from this provider right now.
              </p>
            )}

          {connectedProviders.has(provider) &&
            !gpuLoading &&
            !gpuError &&
            gpuTypes.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {gpuTypes.map((gpu) => {
                  const isSelected = gpuType === gpu.id;
                  const isDisabled = !gpu.available;

                  return (
                    <label
                      key={gpu.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                        isDisabled
                          ? "border-zinc-800/50 bg-zinc-900/50 cursor-not-allowed opacity-50"
                          : isSelected
                            ? "border-emerald-500 bg-emerald-500/10 cursor-pointer"
                            : "border-zinc-800 bg-zinc-900 cursor-pointer hover:border-zinc-600 hover:-translate-y-0.5"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gpuType"
                        value={gpu.id}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => setGpuType(gpu.id)}
                        className="accent-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-zinc-100 truncate">
                            {gpu.name}
                          </span>
                          {isDisabled && (
                            <span className="shrink-0 text-xs text-zinc-500 bg-zinc-800 rounded px-1.5 py-0.5">
                              Out of stock
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500">
                          {gpu.vramGb} GB VRAM
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium shrink-0 ${isDisabled ? "text-zinc-600" : "text-emerald-400"}`}
                      >
                        ${gpu.pricePerHour.toFixed(2)}/hr
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
        </div>

        {/* Cost estimate */}
        <CostEstimate
          pricePerHour={selectedGpu?.pricePerHour ?? null}
          provider={provider}
        />

        {/* Deploy */}
        {error && (
          <div
            className="flex items-center gap-1.5 text-sm text-red-400"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => deploy()}
            disabled={!provider || !gpuType || deploying}
            className="min-h-11 rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            {deploying ? "Deploying..." : "Deploy instance"}
          </button>
          {!connectedProviders.has(provider) && (
            <span className="text-sm text-zinc-500">
              Connect your provider above first
            </span>
          )}
          {connectedProviders.has(provider) && !gpuType && !gpuLoading && (
            <span className="text-sm text-zinc-500">
              Select an available GPU to deploy
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
