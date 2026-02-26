"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, LogbookMode } from "@/lib/types/database";

type SupabaseContextType = {
  user: User | null;
  loading: boolean;
  profile: Profile | null;
  mode: LogbookMode;
  switchMode: (mode: LogbookMode) => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  profile: null,
  mode: "military",
  switchMode: async () => {},
});

export function SupabaseProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode;
  initialUser: User | null;
  initialProfile: Profile | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [mode, setMode] = useState<LogbookMode>(
    initialProfile?.logbook_mode || "military"
  );

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const switchMode = useCallback(
    async (newMode: LogbookMode) => {
      if (newMode === mode) return;

      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { error } = await supabase
        .from("profiles")
        .update({ logbook_mode: newMode })
        .eq("id", currentUser.id);

      if (!error) {
        setMode(newMode);
        if (profile) {
          setProfile({ ...profile, logbook_mode: newMode });
        }
        router.refresh();
      }
    },
    [mode, profile, router]
  );

  return (
    <SupabaseContext.Provider value={{ user, loading, profile, mode, switchMode }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useUser() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a SupabaseProvider");
  }
  return context;
}

export function useProfile() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a SupabaseProvider");
  }
  return { profile: context.profile };
}

export function useLogbookMode() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useLogbookMode must be used within a SupabaseProvider");
  }
  return {
    mode: context.mode,
    switchMode: context.switchMode,
    isMilitary: context.mode === "military",
    isCivilian: context.mode === "civilian",
  };
}
