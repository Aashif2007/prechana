import { createAdminClient } from "@/lib/supabase/admin";

// Only call these with IDs you already loaded through a user-scoped (RLS) query.
export async function getPhotoUrls(complaintIds: string[]) {
  const urls: Record<string, string> = {};
  if (complaintIds.length === 0) return urls;

  const db = createAdminClient();
  const { data } = await db
    .from("complaint_media")
    .select("complaint_id, storage_path")
    .in("complaint_id", complaintIds)
    .order("created_at");
  const rows = data ?? [];
  if (rows.length === 0) return urls;

  const paths = rows.map((row) => row.storage_path);
  const { data: signed } = await db.storage.from("complaint-photos").createSignedUrls(paths, 3600);

  for (let i = 0; i < rows.length; i++) {
    const url = signed?.[i]?.signedUrl;
    if (url && !urls[rows[i].complaint_id]) urls[rows[i].complaint_id] = url;
  }
  return urls;
}

export async function getAuthorityNames(ids: (string | null)[]) {
  const names: Record<string, string> = {};
  const wanted: string[] = [];
  for (const id of ids) {
    if (id && !wanted.includes(id)) wanted.push(id);
  }
  if (wanted.length === 0) return names;

  const db = createAdminClient();
  const { data } = await db.from("authorities").select("id, name").in("id", wanted);
  for (const row of data ?? []) names[row.id] = row.name;
  return names;
}
