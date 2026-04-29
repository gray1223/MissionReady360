import Link from "next/link";
import {
  Shield,
  Plane,
  Clock,
  ArrowRight,
  GraduationCap,
  Eye,
  Swords,
  Users,
  Target,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BRANCHES = ["USAF", "USN", "USA", "USMC", "USCG"];

const FEATURES = [
  {
    icon: Plane,
    title: "Sortie & Mission Logging",
    description:
      "Log mission symbols, crew positions, and formation data per branch standards. Tactical precision per sortie.",
  },
  {
    icon: Clock,
    title: "Branch Currency Compliance",
    description:
      "AR 95-1, AFI 11-2, and NATOPS currency rules tracked automatically with expiration warnings.",
  },
  {
    icon: Eye,
    title: "NVG & Night Proficiency",
    description:
      "NVG hours, goggle currency, and night proficiency in one place. Never lose currency to a date you forgot.",
  },
  {
    icon: Target,
    title: "Combat & Deployment Hours",
    description:
      "Combat sorties, deployment time, and combat-support hours kept separate from training records.",
  },
  {
    icon: Swords,
    title: "Weapons & Tactical Events",
    description:
      "Weapons deliveries, air-refueling contacts, airdrop events, and other tactical data per sortie.",
  },
  {
    icon: Users,
    title: "Crew Resource Management",
    description:
      "Tag crew members, positions, and formation roles. Build a CRM history that mirrors your flight time.",
  },
  {
    icon: GraduationCap,
    title: "FAA Rating Progress",
    description:
      "Your military time counts toward civilian ratings. Track PPL, Instrument, Commercial, and ATP progress.",
  },
  {
    icon: BookOpen,
    title: "Boldface Drills (T-6A)",
    description:
      "Adaptive Leitner-box drilling for T-6A USAF boldface. Misses come back fast; correct items space out.",
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
            Stay Mission Ready.{" "}
            <span className="text-emerald-400">Without the busywork.</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-text-secondary">
            Sortie logging, branch-currency compliance, NVG and combat hours, and
            FAA rating progress — all in one logbook built for military aviators.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/signup?mode=military">
              <Button variant="primary" size="lg">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/boldface">
              <Button variant="outline" size="lg">
                <BookOpen className="h-4 w-4" />
                Study T-6A Boldface — Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Branch bar */}
        <div className="mx-auto mt-16 flex flex-wrap items-center justify-center gap-3">
          {BRANCHES.map((branch) => (
            <span
              key={branch}
              className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-emerald-400"
            >
              {branch}
            </span>
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

        {/* Bottom CTA */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <h3 className="text-2xl font-bold tracking-tight text-slate-100">
            Built for those who fly.
          </h3>
          <p className="mt-2 text-base text-text-secondary">
            Set up your logbook in under five minutes. Bring prior hours with you
            or start fresh.
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-default px-6 py-6 text-center text-xs text-text-muted">
        MissionReady360 &mdash; Built for those who fly.
      </footer>
    </>
  );
}
