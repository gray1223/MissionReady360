import Link from "next/link";
import {
  Shield,
  Plane,
  Clock,
  BarChart3,
  Award,
  ArrowRight,
  GraduationCap,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Plane,
    title: "Unified Logbook",
    description:
      "Log military sorties and civilian flights in one place with mission details, FAA times, approaches, and more.",
  },
  {
    icon: Clock,
    title: "Currency Tracking",
    description:
      "Automatic tracking of military and FAA currency requirements with expiration warnings and status badges.",
  },
  {
    icon: GraduationCap,
    title: "FAA Rating Progress",
    description:
      "Track your hours toward PPL, Instrument, Commercial, ATP, and R-ATP ratings with visual progress bars.",
  },
  {
    icon: BarChart3,
    title: "Flight Analytics",
    description:
      "See 30-day, 90-day, and year-to-date flight hour summaries with night and instrument breakdowns.",
  },
  {
    icon: Award,
    title: "Qualification Management",
    description:
      "Track your certifications, ratings, medicals, and military qualifications in one place.",
  },
  {
    icon: Settings2,
    title: "Customizable Dashboard",
    description:
      "Toggle flight log sections, choose which ratings to track, and personalize your dashboard widgets.",
  },
];

export default function MilitaryLandingPage() {
  return (
    <>
      {/* Nav */}
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

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
            <Shield className="h-3.5 w-3.5" />
            Built for military aviators
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-100 sm:text-5xl">
            Track your military and civilian flight currencies{" "}
            <span className="text-emerald-400">in one place</span>
          </h1>

          <p className="mx-auto max-w-lg text-lg text-text-secondary">
            MissionReady360 combines your military flight log with FAA currency
            tracking and rating progress, so you always know where you stand.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
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

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </>
  );
}
