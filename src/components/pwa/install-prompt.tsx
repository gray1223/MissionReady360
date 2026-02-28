"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallState = "idle" | "android-ready" | "ios" | "installed" | "dismissed";

function useInstallPrompt() {
  const [state, setState] = useState<InstallState>("idle");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Already running as standalone PWA — nothing to show
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setState("installed");
      return;
    }
    // Check if user previously dismissed
    if (sessionStorage.getItem("mr360-install-dismissed")) {
      setState("dismissed");
      return;
    }

    // iOS Safari detection (no beforeinstallprompt support)
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    const isSafari =
      /Safari/.test(navigator.userAgent) &&
      !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    if (isIos && isSafari) {
      setState("ios");
      return;
    }

    // Android / Chrome — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState("android-ready");
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setState("installed");
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem("mr360-install-dismissed", "1");
    setState("dismissed");
  }, []);

  return { state, install, dismiss };
}

export function InstallAppBanner({ className }: { className?: string }) {
  const { state, install, dismiss } = useInstallPrompt();

  if (state === "idle" || state === "installed" || state === "dismissed") {
    return null;
  }

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4",
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
        <Download className="h-5 w-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100">
          Install MissionReady360
        </p>
        {state === "android-ready" && (
          <p className="mt-0.5 text-xs text-slate-400">
            Add to your home screen for quick access
          </p>
        )}
        {state === "ios" && (
          <p className="mt-0.5 text-xs text-slate-400">
            Tap{" "}
            <Share className="inline h-3.5 w-3.5 -mt-0.5 text-blue-400" />{" "}
            then &quot;Add to Home Screen&quot;
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {state === "android-ready" && (
          <Button variant="primary" size="sm" onClick={install}>
            Install
          </Button>
        )}
        <button
          onClick={dismiss}
          className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Compact version for the settings page */
export function InstallAppCard() {
  const { state, install, dismiss } = useInstallPrompt();

  // Always show in settings (even if dismissed in banner) — but not if installed
  const isStandalone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  if (isStandalone || state === "installed") {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-100">App Installed</p>
            <p className="mt-0.5 text-xs text-slate-400">
              You&apos;re using MissionReady360 as an app
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100">
            Install as App
          </p>
          {state === "android-ready" ? (
            <>
              <p className="mt-0.5 text-xs text-slate-400">
                Install MissionReady360 to your home screen for a native app
                experience with offline icon access.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={install}
              >
                <Download className="h-4 w-4" />
                Install App
              </Button>
            </>
          ) : state === "ios" ? (
            <>
              <p className="mt-1 text-xs text-slate-400">
                To install on your device:
              </p>
              <ol className="mt-2 space-y-1.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    1
                  </span>
                  <span>
                    Tap the{" "}
                    <Share className="inline h-3.5 w-3.5 -mt-0.5 text-blue-400" />{" "}
                    Share button in Safari
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    2
                  </span>
                  <span>Scroll down and tap &quot;Add to Home Screen&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    3
                  </span>
                  <span>Tap &quot;Add&quot; to confirm</span>
                </li>
              </ol>
            </>
          ) : (
            <p className="mt-0.5 text-xs text-slate-400">
              Open in Chrome (Android) or Safari (iOS) to install as an app.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
