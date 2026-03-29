"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Shield, Lock, Eye, AlertCircle, Mail, Check } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authClient.signIn.magicLink({ email, callbackURL: "/dashboard" });
      setSent(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to send login link",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    try {
      await authClient.signIn.social({ provider, callbackURL: "/dashboard" });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to sign in with ${provider}`,
      );
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <nav className="flex items-center px-6 py-5 md:px-12">
        <Link
          href="/"
          className="text-lg font-bold tracking-widest text-emerald-400"
        >
          MIROFISH
        </Link>
      </nav>

      <div className="flex-1 flex">
        {/* Left — value props */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 xl:px-24 relative">
          {/* Ambient gradient mesh */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
          >
            <div className="absolute -top-1/4 -left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl motion-safe:animate-pulse" />
            <div className="absolute -bottom-1/4 -right-1/4 w-80 h-80 rounded-full bg-emerald-400/5 blur-3xl motion-safe:animate-pulse [animation-delay:2s]" />
            <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-emerald-600/5 blur-3xl motion-safe:animate-pulse [animation-delay:4s]" />
          </div>
          <h2 className="text-4xl font-bold mb-8 leading-tight font-display">
            Your simulations,
            <br />
            your infrastructure
          </h2>
          <div className="space-y-6">
            {[
              {
                icon: Shield,
                title: "Data stays on your instance",
                desc: "Documents, API keys, and results never leave your server.",
              },
              {
                icon: Lock,
                title: "Encrypted credentials",
                desc: "Provider keys encrypted at rest with AES-256-GCM.",
              },
              {
                icon: Eye,
                title: "Open source & auditable",
                desc: "AGPL-3.0 licensed. Inspect every line of code.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <item.icon
                    className="h-5 w-5 text-emerald-400"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold mb-8 font-display">
              Log in to MiroFish
            </h1>

            {sent ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check
                      className="h-5 w-5 text-emerald-400"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Check your inbox
                  </h2>
                </div>
                <p className="text-sm text-zinc-400">
                  We sent a login link to{" "}
                  <span className="font-medium text-zinc-100">{email}</span>.
                  Click the link in the email to sign in.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleOAuth("github")}
                    className="min-h-11 w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-medium transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    Continue with GitHub
                  </button>
                  <button
                    onClick={() => handleOAuth("google")}
                    className="min-h-11 w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-medium transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    Continue with Google
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-xs text-zinc-600">or</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm text-zinc-400 mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="you@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="min-h-11 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Send login link
                      </>
                    )}
                  </button>
                </form>

                {error && (
                  <div
                    className="flex items-center gap-2 mt-4 text-sm text-red-400"
                    role="alert"
                  >
                    <AlertCircle
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
