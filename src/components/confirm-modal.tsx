"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <ConfirmModalInner
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText={confirmText}
    />
  );
}

function ConfirmModalInner({
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
}: Omit<ConfirmModalProps, "open">) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const matchesRef = useRef(false);
  const onConfirmRef = useRef(onConfirm);

  const matches = value === confirmText;

  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  useEffect(() => {
    matchesRef.current = matches;
  }, [matches]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Enter" && matchesRef.current) {
        onConfirmRef.current();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, input, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative mx-4 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 min-h-11 min-w-11 flex items-center justify-center rounded-xl text-zinc-500 transition-all duration-200 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle
            className="h-6 w-6 text-red-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <h2
              id="confirm-modal-title"
              className="text-lg font-semibold text-zinc-100"
            >
              {title}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">{description}</p>
          </div>
        </div>

        <label
          htmlFor="confirm-input"
          className="block text-sm text-zinc-400 mb-1.5"
        >
          Type{" "}
          <span className="font-mono font-semibold text-zinc-100">
            {confirmText}
          </span>{" "}
          to confirm
        </label>
        <input
          ref={inputRef}
          id="confirm-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          autoComplete="off"
        />

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="min-h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 transition-all duration-200 hover:border-zinc-600 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={!matches}
            className="min-h-11 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/20 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            Destroy
          </button>
        </div>
      </div>
    </div>
  );
}
