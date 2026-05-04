import Link from "next/link";
import { ArrowRight, AlertTriangle, BookOpen, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllBoldface, renderBoldfaceAnswer } from "@/lib/boldface/t6a-boldface";

export const metadata = {
  title: "T-6A Boldface — MissionReady360",
  description:
    "Public study reference for T-6A USAF boldface emergency procedures.",
};

export default function PublicBoldfacePage() {
  const items = getAllBoldface();

  return (
    <div className="relative min-h-screen bg-bg-base">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-accent) 1px, transparent 1px), linear-gradient(90deg, var(--grid-accent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/20 ring-1 ring-emerald-500/30">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">
            MissionReady360
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup?mode=military">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        {/* Hero */}
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
            <BookOpen className="h-3.5 w-3.5" />
            Public study reference
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            T-6A USAF Boldface
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-text-secondary">
            All {items.length} boldface emergency procedures in one place. Study
            them here free, then sign up for adaptive drilling that schedules
            reviews based on what you keep missing.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup?mode=military">
              <Button variant="primary" size="md">
                Sign up to drill adaptively
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Boldface text changes with TO updates. Verify against your current
            squadron / FTU publication before relying on this for graded
            recitation.
          </p>
        </div>

        {/* Items */}
        <ol className="mt-10 space-y-6">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className="rounded-xl border border-slate-800 bg-bg-surface/60 p-6"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-mono text-slate-500">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h2 className="text-lg font-semibold text-slate-100">
                  {item.title}
                </h2>
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-200">
                {renderBoldfaceAnswer(item)}
              </pre>
            </li>
          ))}
        </ol>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h3 className="text-2xl font-bold tracking-tight text-slate-100">
            Drill these adaptively.
          </h3>
          <p className="mt-2 text-base text-text-secondary">
            Sign up to get a Leitner-box drill that resurfaces what you miss and
            spaces correct items out (1 → 3 → 7 → 14 days). Free.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link href="/signup?mode=military">
              <Button variant="primary" size="lg">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border-default px-6 py-6 text-center text-xs text-text-muted">
        MissionReady360 — Built for those who fly.
      </footer>
    </div>
  );
}
