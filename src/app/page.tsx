import Link from "next/link";
import {
  Shield,
  Plane,
  Clock,
  BarChart3,
  Award,
} from "lucide-react";

const FEATURES = [
  {
    icon: Plane,
    title: "Unified Logbook",
    description:
      "Log military sorties and civilian flights in one place with all the details that matter.",
  },
  {
    icon: Clock,
    title: "Currency Tracking",
    description:
      "Automatic tracking of military and FAA currency requirements so you never fall out of currency.",
  },
  {
    icon: BarChart3,
    title: "Flight Analytics",
    description:
      "Visualize your flight hours, trends, and qualification progress at a glance.",
  },
  {
    icon: Award,
    title: "Qualification Management",
    description:
      "Track your certifications, ratings, medicals, and military qualifications.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-bg-base">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/20 ring-1 ring-emerald-500/30">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">
            MissionReady360
          </span>
        </div>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
            <Plane className="h-3.5 w-3.5" />
            Built for military aviators
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-100 sm:text-5xl">
            Track your military and civilian flight currencies{" "}
            <span className="text-emerald-400">in one place</span>
          </h1>

          <p className="mx-auto max-w-lg text-lg text-text-secondary">
            MissionReady360 combines your military flight log with FAA currency
            tracking, so you always know where you stand.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white hover:bg-emerald-500"
            >
              Get Started
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-4xl gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border-default bg-bg-surface/60 p-6 text-left"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/15">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-slate-100">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-default px-6 py-6 text-center text-xs text-text-muted">
        MissionReady360 &mdash; Built for those who fly.
      </footer>
    </div>
  );
}
