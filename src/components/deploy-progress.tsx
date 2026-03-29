"use client";

import { Check, Loader2, Circle } from "lucide-react";

interface DeployProgressProps {
  status: string;
  providerHint?: string;
}

export function DeployProgress({ status, providerHint }: DeployProgressProps) {
  const steps = [
    { label: "Instance created", done: true },
    {
      label: "Waiting for provider...",
      done: status === "running",
      active: status === "provisioning",
    },
    {
      label: "Instance running!",
      done: status === "running",
      active: false,
    },
  ];

  const failed = status === "failed";

  return (
    <div aria-live="polite" className="space-y-3">
      {steps.map((step) => (
        <div key={step.label} className="flex items-center gap-3">
          {failed && !step.done ? (
            <Circle className="h-5 w-5 text-red-400" aria-hidden="true" />
          ) : step.done ? (
            <Check className="h-5 w-5 text-emerald-400" aria-hidden="true" />
          ) : step.active ? (
            <Loader2
              className="h-5 w-5 animate-spin text-yellow-500"
              aria-hidden="true"
            />
          ) : (
            <Circle className="h-5 w-5 text-zinc-600" aria-hidden="true" />
          )}
          <span
            className={`text-sm ${step.done ? "text-zinc-100 font-medium" : step.active ? "text-zinc-100" : "text-zinc-500"}`}
          >
            {step.label}
          </span>
        </div>
      ))}
      {failed && (
        <div
          className="flex items-center gap-2 mt-2 text-sm text-red-400"
          role="alert"
        >
          <Circle className="h-4 w-4" aria-hidden="true" />
          Deployment failed. Please try again.
        </div>
      )}
      {providerHint && !failed && status !== "running" && (
        <p className="text-xs text-zinc-500 mt-2">{providerHint}</p>
      )}
    </div>
  );
}
