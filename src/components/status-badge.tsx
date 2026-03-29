"use client";

import { Loader2 } from "lucide-react";

const statusConfig: Record<
  string,
  { dot: string; label: string; spin?: boolean }
> = {
  running: { dot: "bg-green-500", label: "Running" },
  provisioning: { dot: "bg-yellow-500", label: "Provisioning", spin: true },
  stopped: { dot: "bg-zinc-500", label: "Stopped" },
  failed: { dot: "bg-red-500", label: "Failed" },
  destroyed: { dot: "bg-red-500", label: "Destroyed" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { dot: "bg-zinc-600", label: status };

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm text-zinc-400"
      aria-label={`Status: ${config.label}`}
    >
      {config.spin ? (
        <Loader2
          className="h-3 w-3 animate-spin text-yellow-500"
          aria-hidden="true"
        />
      ) : (
        <span
          className={`h-2 w-2 rounded-full ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
