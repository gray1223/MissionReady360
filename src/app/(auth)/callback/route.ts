import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const mode = searchParams.get("mode");

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // No profile yet -- send to onboarding
          // Resolve mode: explicit param > user metadata > default military
          const resolvedMode =
            mode ||
            user.user_metadata?.logbook_mode ||
            "military";
          return NextResponse.redirect(
            `${origin}/onboarding?mode=${resolvedMode}`
          );
        }
      }

      // Has profile -- go to dashboard (or wherever `next` points)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong -- send back to login with error hint
  return NextResponse.redirect(`${origin}/login`);
}
