import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-base px-4 py-12">
      {/* Faint grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-accent) 1px, transparent 1px), linear-gradient(90deg, var(--grid-accent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            MissionReady360
          </h1>
          <p className="text-sm text-text-secondary">
            Military &amp; Civilian Flight Currency Tracker
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border-default bg-bg-surface p-6 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
