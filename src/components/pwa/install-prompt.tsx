"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Share, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios" | "desktop" | "unknown";
type InstallState =
  | "loading"
  | "prompt-ready"
  | "ios"
  | "show-instructions"
  | "installed"
  | "dismissed";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Mac") && "ontouchend" in document);
  if (isIos) return "ios";

  if (/Android/.test(ua)) return "android";

  return "desktop";
}

function useInstallPrompt() {
  const [state, setState] = useState<InstallState>("loading");
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const plat = detectPlatform();
    setPlatform(plat);

    // Already running as standalone PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setState("installed");
      return;
    }

    // Check if user previously dismissed (session only)
    if (sessionStorage.getItem("mr360-install-dismissed")) {
      setState("dismissed");
      return;
    }

    // iOS Safari — no beforeinstallprompt, show share instructions
    if (plat === "ios") {
      setState("ios");
      return;
    }

    // Listen for beforeinstallprompt (Chrome/Edge on Android & desktop)
    let prompted = false;
    const handler = (e: Event) => {
      e.preventDefault();
      prompted = true;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState("prompt-ready");
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If beforeinstallprompt doesn't fire within 3s, show manual instructions
    const timeout = setTimeout(() => {
      if (!prompted) {
        setState("show-instructions");
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timeout);
    };
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

  return { state, platform, install, dismiss };
}

/** Dashboard banner — dismissible, only shows when actionable */
export function InstallAppBanner({ className }: { className?: string }) {
  const { state, install, dismiss } = useInstallPrompt();

  if (
    state === "loading" ||
    state === "installed" ||
    state === "dismissed"
  ) {
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
        {state === "prompt-ready" && (
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
        {state === "show-instructions" && (
          <p className="mt-0.5 text-xs text-slate-400">
            Use your browser menu to install this app
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {state === "prompt-ready" && (
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

/** Settings page card — always visible with platform-specific instructions */
export function InstallAppCard() {
  const { state, platform, install } = useInstallPrompt();

  // Still loading client-side
  if (state === "loading") {
    return null;
  }

  // Already installed as PWA
  if (state === "installed") {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Smartphone className="h-5 w-5 text-primary" />
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

  // Native install prompt available (Chrome/Edge)
  if (state === "prompt-ready") {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100">Install as App</p>
            <p className="mt-0.5 text-xs text-slate-400">
              Add MissionReady360 to your home screen for a full-screen, app-like
              experience.
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
          </div>
        </div>
      </div>
    );
  }

  // iOS — show Share → Add to Home Screen steps
  if (state === "ios" || platform === "ios") {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100">Install as App</p>
            <p className="mt-1 text-xs text-slate-400">
              Add to your home screen for a full-screen experience:
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
          </div>
        </div>
      </div>
    );
  }

  // Android without prompt, or desktop — show generic browser instructions
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100">Install as App</p>
          <p className="mt-1 text-xs text-slate-400">
            Add MissionReady360 to your home screen for a full-screen, app-like
            experience:
          </p>
          <ol className="mt-2 space-y-1.5 text-xs text-slate-400">
            {platform === "android" ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    1
                  </span>
                  <span>Open in Chrome if not already</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    2
                  </span>
                  <span>
                    Tap the <strong className="text-slate-300">&#8942;</strong>{" "}
                    menu (top right)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    3
                  </span>
                  <span>Tap &quot;Add to Home screen&quot; or &quot;Install app&quot;</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    1
                  </span>
                  <span>
                    Look for the install icon{" "}
                    <Download className="inline h-3.5 w-3.5 -mt-0.5 text-slate-300" />{" "}
                    in your browser&apos;s address bar
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    2
                  </span>
                  <span>Or open the browser menu and select &quot;Install MissionReady360&quot;</span>
                </li>
              </>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
