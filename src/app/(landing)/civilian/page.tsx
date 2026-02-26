import Link from "next/link";
import {
  Plane,
  Clock,
  BarChart3,
  ArrowRight,
  GraduationCap,
  ClipboardCheck,
  MapPin,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CivilianThemeInit } from "./theme-init";

const RATING_STEPS = ["Student", "PPL", "Instrument", "Commercial", "ATP"];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Digital Flight Logbook",
    description:
      "Log every flight with all FAA-required time categories — PIC, SIC, dual, solo, instrument, night, and cross-country in a clean interface.",
  },
  {
    icon: Clock,
    title: "FAA Currency Countdown",
    description:
      "Automatic tracking of day/night passenger currency, IFR currency, flight review, and medical expiration with countdown timers.",
  },
  {
    icon: GraduationCap,
    title: "Rating Progress Tracker",
    description:
      "Visual progress bars for PPL, Instrument Rating, Commercial, and ATP. See exactly how many hours you still need.",
  },
  {
    icon: ClipboardCheck,
    title: "Checkride Prep Dashboard",
    description:
      "See requirements met vs. gaps remaining at a glance. Know exactly what you need before your next checkride.",
  },
  {
    icon: MapPin,
    title: "Cross-Country Tracking",
    description:
      "Track cross-country time, long XC requirements, and route history. Stay on top of your XC hour requirements.",
  },
  {
    icon: Award,
    title: "Certificate & Medical Tracking",
    description:
      "Track your certificate type, ratings, endorsements, and medical class with expiration alerts and renewal reminders.",
  },
  {
    icon: Plane,
    title: "Instructor & Dual Time",
    description:
      "Separate tracking for dual received, instructor given, solo, and PIC time categories. Perfect for students and CFIs.",
  },
  {
    icon: BarChart3,
    title: "Flight Analytics & Reports",
    description:
      "Monthly hour trends, category breakdowns, and year-to-date summaries. Exportable reports for insurance and checkrides.",
  },
];

export default function CivilianLandingPage() {
  return (
    <>
      <CivilianThemeInit />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600/20 ring-1 ring-sky-500/30">
            <Plane className="h-5 w-5 text-sky-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">
            MissionReady360
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup?mode=civilian">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1.5 text-xs font-medium text-sky-400">
            <Plane className="h-3.5 w-3.5" />
            Built for pilots
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-100 sm:text-5xl">
            From Student Pilot to ATP —{" "}
            <span className="text-sky-400">Track Every Hour That Counts</span>
          </h1>

          <p className="mx-auto max-w-lg text-lg text-text-secondary">
            Log flights, track FAA currencies and checkride requirements, and
            monitor your progress from your first solo to your ATP certificate.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link href="/signup?mode=civilian">
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

        {/* Rating pathway visual */}
        <div className="mx-auto mt-16 flex flex-wrap items-center justify-center gap-2">
          {RATING_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-sky-400">
                {step}
              </span>
              {i < RATING_STEPS.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
              )}
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border-default bg-bg-surface/60 p-6 text-left"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600/15">
                  <Icon className="h-5 w-5 text-sky-400" />
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
