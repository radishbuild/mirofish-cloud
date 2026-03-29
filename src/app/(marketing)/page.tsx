import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  Shield,
  Zap,
  Server,
  Globe,
  Database,
  ArrowRight,
  ExternalLink,
  Lock,
  Cpu,
} from "lucide-react";

const steps = [
  {
    icon: Zap,
    num: "01",
    title: "Choose your GPU",
    desc: "Pick a provider and GPU tier for your workload.",
  },
  {
    icon: Server,
    num: "02",
    title: "Deploy in 90s",
    desc: "Dedicated instance, provisioned for you.",
  },
  {
    icon: Globe,
    num: "03",
    title: "Run simulations",
    desc: "Agents post, reply, and build social graphs.",
  },
  {
    icon: Database,
    num: "04",
    title: "Own everything",
    desc: "Export, analyze, destroy. It's yours.",
  },
];

export default async function Landing() {
  const session = await auth.api.getSession({ headers: await headers() });
  const loggedIn = !!session;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="text-lg font-bold tracking-widest text-emerald-400">
          MIROFISH
        </span>
        <Link
          href={loggedIn ? "/dashboard" : "/login"}
          className="min-h-10 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          {loggedIn ? "Dashboard" : "Get started"}{" "}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient orb background */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div
          className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center md:pt-36 md:pb-28 motion-safe:animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-xs text-muted mb-8 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Privacy-first by design
          </div>

          <h1 className="text-6xl font-bold leading-tight tracking-tighter md:text-8xl font-display">
            Simulate social media
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              with AI agents
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            Multi-agent simulations on your own dedicated GPU server. Your data,
            your models, your results — zero external API calls.
          </p>

          <div className="mt-10">
            <Link
              href={loggedIn ? "/dashboard" : "/login"}
              className="min-h-12 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              {loggedIn ? "Go to Dashboard" : "Launch your first simulation"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Product preview — fake simulation UI */}
      <section
        className="max-w-5xl mx-auto px-6 pb-24 motion-safe:animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <span className="h-3 w-3 rounded-full bg-zinc-700" />
            <span className="h-3 w-3 rounded-full bg-zinc-700" />
            <span className="h-3 w-3 rounded-full bg-zinc-700" />
            <span className="ml-4 text-xs text-zinc-600 font-mono">
              mirofish-abc123.runpod.io
            </span>
          </div>
          {/* Fake simulation dashboard */}
          <div className="p-4 md:p-6">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-zinc-200">
                  Simulation: Tech Policy Debate
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Running
                </span>
              </div>
              <span className="font-mono text-xs text-zinc-600">
                Round 12 / 20
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full bg-zinc-800 mb-5">
              <div className="h-1 rounded-full bg-emerald-500 w-3/5 transition-all" />
            </div>

            {/* Two-column feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Agent posts feed */}
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Agent Activity
                </p>
                {[
                  {
                    name: "Sarah Chen",
                    handle: "@schen_tech",
                    action: "posted",
                    text: "The new AI regulation bill misses the mark on open source. We need clearer definitions before enforcing compliance.",
                    time: "2m ago",
                    color: "bg-emerald-500",
                  },
                  {
                    name: "Marcus Rivera",
                    handle: "@mrivera",
                    action: "replied",
                    text: "Agree, but without some framework we get a race to the bottom. The EU approach isn't perfect but it's a start.",
                    time: "4m ago",
                    color: "bg-sky-500",
                  },
                  {
                    name: "Priya Nair",
                    handle: "@priya_n",
                    action: "reposted",
                    text: "Interesting thread on the tension between innovation speed and regulatory oversight.",
                    time: "6m ago",
                    color: "bg-amber-500",
                  },
                ].map((post) => (
                  <div
                    key={post.handle}
                    className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`h-6 w-6 rounded-full ${post.color} flex items-center justify-center text-xs font-bold text-zinc-950`}
                      >
                        {post.name[0]}
                      </div>
                      <span className="text-sm font-medium text-zinc-200">
                        {post.name}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {post.handle}
                      </span>
                      <span className="ml-auto text-xs text-zinc-700">
                        {post.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {post.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stats panel */}
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Live Stats
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Agents", value: "48", sub: "active" },
                    { label: "Posts", value: "312", sub: "generated" },
                    { label: "Replies", value: "189", sub: "threads" },
                    { label: "Topics", value: "7", sub: "clusters" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-3"
                    >
                      <span className="block font-mono text-xl font-bold text-zinc-100">
                        {stat.value}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {stat.label} · {stat.sub}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Mini graph placeholder */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-3">
                  <p className="text-xs text-zinc-500 mb-2">
                    Activity over time
                  </p>
                  <div className="flex items-end gap-1 h-16">
                    {[
                      3, 5, 4, 7, 6, 8, 9, 7, 10, 8, 11, 9, 12, 10, 8, 11, 13,
                      10, 9, 7,
                    ].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-emerald-500/30 motion-safe:animate-bar-shift"
                        style={{
                          height: `${h * 5}%`,
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="max-w-5xl mx-auto px-6 pb-28 motion-safe:animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold md:text-4xl font-display">
            How it works
          </h2>
          <p className="mt-3 text-muted">
            From zero to running simulation in four steps.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-zinc-900 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-zinc-600">
                  {step.num}
                </span>
                <step.icon
                  className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-emerald-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Private Cloud */}
      <section
        className="max-w-5xl mx-auto px-6 pb-28 motion-safe:animate-fade-up"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold md:text-4xl font-display">
            Your own private cloud
          </h2>
          <p className="mt-3 text-muted max-w-2xl mx-auto">
            Every instance is a dedicated GPU server running Ollama. Your
            documents, prompts, and results never leave your server. Zero
            external API calls.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Cpu,
              title: "GPU-powered",
              desc: "Dedicated GPU for fast inference. RTX 4090, A100, H100, and more.",
            },
            {
              icon: Server,
              title: "Ollama built-in",
              desc: "Run Qwen, Llama, and other open models. No external LLM calls.",
            },
            {
              icon: Database,
              title: "Neo4j knowledge graph",
              desc: "Agents build and traverse social graphs in a dedicated database.",
            },
            {
              icon: Lock,
              title: "Zero external calls",
              desc: "Everything runs on your server. No data leaves your instance.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-zinc-900 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <item.icon
                  className="h-5 w-5 text-emerald-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section
        className="max-w-3xl mx-auto px-6 pb-28 motion-safe:animate-fade-up"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="relative rounded-2xl border border-emerald-500/20 bg-zinc-900/50 p-10 md:p-14 text-center overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <Shield
            className="relative h-16 w-16 text-emerald-500/40 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            aria-hidden="true"
          />
          <h2 className="relative text-3xl font-bold mb-4 font-display">
            Your data stays yours
          </h2>
          <p className="relative text-zinc-400 max-w-lg mx-auto mb-8">
            Our database stores your email and instance status. That&apos;s it.
            Documents, API keys, simulation results, and prompts never leave
            your instance.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-left">
            <div className="rounded-xl bg-zinc-800/50 border border-zinc-800 p-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                We store
              </p>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>Email</li>
                <li>Instance status</li>
              </ul>
            </div>
            <div className="rounded-xl bg-zinc-800/50 border border-zinc-800 p-4">
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">
                We never see
              </p>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>Your documents</li>
                <li>API keys</li>
                <li>Sim results</li>
              </ul>
            </div>
          </div>
          <a
            href="https://github.com/nikmcfly/MiroFish-Offline"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open source (AGPL-3.0) — audit every line
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-bold tracking-widest text-emerald-400">
            MIROFISH
          </span>
          <nav className="flex gap-6 text-sm text-zinc-600">
            <Link
              href="/login"
              className="hover:text-zinc-300 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="hover:text-zinc-300 transition-colors"
            >
              Sign up
            </Link>
            <a
              href="https://github.com/nikmcfly/MiroFish-Offline"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              GitHub
            </a>
          </nav>
          <span className="text-xs text-zinc-700">
            AGPL-3.0 · Privacy-first
          </span>
        </div>
      </footer>
    </div>
  );
}
