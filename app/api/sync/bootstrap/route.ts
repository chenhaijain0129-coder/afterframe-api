import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  const userId = await requireSession(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: archives, error: archiveError } = await supabaseAdmin
    .from("archives").select("*").eq("owner_id", userId).order("position");
  if (archiveError) return NextResponse.json({ error: "Could not read archives." }, { status: 500 });

  const archiveIds = (archives || []).map((archive) => archive.id);
  const { data: entries, error: entryError } = archiveIds.length
    ? await supabaseAdmin.from("entries").select("*").in("archive_id", archiveIds).order("created_at", { ascending: false })
    : { data: [], error: null };
  if (entryError) return NextResponse.json({ error: "Could not read entries." }, { status: 500 });

  const entryIds = (entries || []).map((entry) => entry.id);
  const { data: photos, error: photoError } = entryIds.length
    ? await supabaseAdmin.from("photos").select("*").in("entry_id", entryIds).order("position")
    : { data: [], error: null };
  if (photoError) return NextResponse.json({ error: "Could not read photos." }, { status: 500 });

  return NextResponse.json({ archives: archives || [], entries: entries || [], photos: photos || [] });
}
