import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeSetter } from "@/components/providers/theme-setter";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarOffset } from "@/components/layout/sidebar-offset";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <SupabaseProvider initialUser={user} initialProfile={profile}>
      <script dangerouslySetInnerHTML={{
        __html: `document.documentElement.setAttribute('data-mode','${profile?.logbook_mode || 'military'}')`,
      }} />
      <ThemeSetter />
      <div className="min-h-screen bg-slate-950">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area with sidebar offset */}
        <SidebarOffset>
          <TopNav />
          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </SidebarOffset>

        {/* Mobile bottom navigation */}
        <MobileNav />
      </div>
    </SupabaseProvider>
  );
}
