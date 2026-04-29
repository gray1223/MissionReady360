import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllBoldface } from "@/lib/boldface/t6a-boldface";
import { computeDueStates, type ProgressRow } from "@/lib/boldface/scheduling";
import { BoldfaceDrillClient } from "./boldface-drill-client";

export default async function BoldfacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rowData } = await supabase
    .from("boldface_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("airframe", "t6a");

  const rows = (rowData ?? []) as ProgressRow[];
  const items = getAllBoldface();
  const states = computeDueStates(
    items.map((i) => i.id),
    rows,
  );

  return (
    <BoldfaceDrillClient
      items={items.map((i) => ({
        id: i.id,
        title: i.title,
        stepCount: i.steps.length,
      }))}
      initialStates={states.map((s) => ({
        itemId: s.itemId,
        box: s.box,
        nextDueAt: s.nextDueAt.toISOString(),
        totalAttempts: s.totalAttempts,
        correctAttempts: s.correctAttempts,
        isDue: s.isDue,
        isNew: s.isNew,
      }))}
    />
  );
}
