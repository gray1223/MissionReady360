import { redirect } from "next/navigation";
import { Award, Plus, Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { QualificationList } from "@/components/qualifications/qualification-list";
import { AddQualificationButton } from "@/components/qualifications/add-qualification-button";
import type { UserQualification } from "@/lib/types/database";

export default async function QualificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: qualifications } = await supabase
    .from("user_qualifications")
    .select("*")
    .eq("user_id", user.id)
    .order("type")
    .order("name");

  const quals = (qualifications || []) as UserQualification[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            Qualifications & Certifications
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Track your FAA certificates, ratings, endorsements, and military qualifications
          </p>
        </div>
        <AddQualificationButton userId={user.id} />
      </div>

      {quals.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 mb-4">
                <Award className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">
                No qualifications added
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Add your FAA certificates, ratings, endorsements, military
                qualifications, and medical certificates to track them in one place.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <QualificationList qualifications={quals} userId={user.id} />
      )}
    </div>
  );
}
