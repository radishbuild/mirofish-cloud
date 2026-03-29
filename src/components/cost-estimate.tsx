"use client";

import { DollarSign } from "lucide-react";

interface CostEstimateProps {
  pricePerHour: number | null;
  provider?: string;
}

export function CostEstimate({ pricePerHour, provider }: CostEstimateProps) {
  if (pricePerHour == null) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <DollarSign
          className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="text-sm">
          <p className="font-medium text-zinc-100">Estimated cost</p>
          <p className="text-zinc-500">Select a GPU to see pricing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <DollarSign
        className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="text-sm">
        <p className="font-medium text-zinc-100">Estimated cost</p>
        <p className="text-emerald-400">
          ${pricePerHour.toFixed(2)}/hr compute
        </p>
        <p className="text-zinc-500">
          + storage for 50GB volume &amp; 20GB disk
        </p>
        {provider === "runpod" && (
          <p className="text-zinc-600 text-xs mt-1">
            Exact total shown after deploy in RunPod dashboard
          </p>
        )}
      </div>
    </div>
  );
}
