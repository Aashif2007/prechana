import { requireRole } from "@/lib/auth";
import { ReportForm } from "./ReportForm";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["citizen"]);
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Report a Problem</h1>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <ReportForm />
    </div>
  );
}
