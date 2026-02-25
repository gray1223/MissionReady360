"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/database";

type SupabaseContextType = {
  user: User | null;
  loading: boolean;
  profile: Profile | null;
};

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  profile: null,
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
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

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

  return (
    <SupabaseContext.Provider value={{ user, loading, profile }}>
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
