import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { card, formatDate } from "@/lib/ui";
import { VerifyForm } from "./VerifyForm";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; otpSent?: string; reference?: string; verified?: string }>;
}) {
  const profile = await getCurrentProfile();
  const { error, reference, verified } = await searchParams;
  if (!profile) return null;

  const supabase = await createClient();
  const { data: history } = await supabase
    .from("identity_verifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>

      <div className={card}>
        <p className="font-medium">{profile.full_name}</p>
        <p className="text-sm text-slate-500 capitalize">{profile.role}</p>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {verified && (
        <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          Identity verified successfully.
        </p>
      )}

      {profile.aadhaar_verified ? (
        <div className={card + " flex items-center gap-2"}>
          <span className="text-lg">✅</span>
          <div>
            <p className="font-medium text-emerald-700">Aadhaar Verified</p>
            <p className="text-xs text-slate-500">Your identity has been verified.</p>
          </div>
        </div>
      ) : (
        <VerifyForm reference={reference} />
      )}

      {(history ?? []).length > 0 && (
        <div className={card}>
          <p className="mb-2 text-sm font-semibold">Verification history</p>
          {(history ?? []).map((h) => (
            <p key={h.id} className="border-b border-slate-100 py-1.5 text-xs text-slate-500 last:border-0">
              {formatDate(h.created_at)} · {h.masked_aadhaar} · {h.status}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
