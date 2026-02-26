import Link from "next/link";
import { Shield, Plane, ArrowRight } from "lucide-react";

export default function ChooserPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-bg-base">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-accent) 1px, transparent 1px), linear-gradient(90deg, var(--grid-accent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mx-auto max-w-2xl space-y-8 text-center">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800/60 ring-1 ring-slate-700">
              <Plane className="h-7 w-7 text-slate-300" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              MissionReady360
            </h1>
            <p className="text-text-secondary">
              Choose your logbook experience
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Military */}
            <Link
              href="/military"
              className="group rounded-xl border border-slate-800 bg-bg-surface/60 p-8 text-left transition-all hover:border-emerald-500/40 hover:bg-bg-surface/80"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600/15">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-100">
                I&apos;m a Military Pilot
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Track sorties, branch currencies, NVG proficiency, and weapons
                events alongside FAA rating progress.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-400 group-hover:gap-2 transition-all">
                Get started <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            {/* Civilian */}
            <Link
              href="/civilian"
              className="group rounded-xl border border-slate-800 bg-bg-surface/60 p-8 text-left transition-all hover:border-sky-500/40 hover:bg-bg-surface/80"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-600/15">
                <Plane className="h-6 w-6 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-100">
                I&apos;m a Civilian Pilot
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Log flights, track FAA currencies and checkride requirements,
                and monitor your progress from Student Pilot to ATP.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-400 group-hover:gap-2 transition-all">
                Get started <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          {/* Sign in link */}
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-300 hover:text-slate-100"
            >
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
