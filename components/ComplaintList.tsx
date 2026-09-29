import { getPhotoUrls, getAuthorityNames } from "@/lib/lookup";
import { ComplaintCard } from "./ComplaintCard";

export async function ComplaintList({ complaints }: { complaints: any[] }) {
  if (complaints.length === 0) {
    return <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500">No complaints yet.</p>;
  }

  const photos = await getPhotoUrls(complaints.map((c) => c.id));
  const names = await getAuthorityNames(complaints.map((c) => c.current_authority_id));

  return (
    <div className="space-y-3">
      {complaints.map((c) => (
        <ComplaintCard
          key={c.id}
          complaint={c}
          photoUrl={photos[c.id]}
          authorityName={c.current_authority_id ? names[c.current_authority_id] : undefined}
        />
      ))}
    </div>
  );
}
