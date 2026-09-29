import { getPhotoUrls, getAuthorityNames } from "@/lib/lookup";
import { card, btn, btnLight, input } from "@/lib/ui";
import { StatCard } from "@/components/StatCard";
import { ComplaintCard } from "@/components/ComplaintCard";
import {
  acknowledge, startWork, addNote, forwardToDepartment, markCompleted,
} from "@/app/(app)/workflow/actions";

type Mode = "councillor" | "department";

function Hidden({ id }: { id: string }) {
  return <input type="hidden" name="complaintId" value={id} />;
}

export async function WorkQueue({ complaints, mode }: { complaints: any[]; mode: Mode }) {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  let pending = 0;
  let overdue = 0;
  let escalated = 0;
  let resolved = 0;
  for (const c of complaints) {
    if (c.status === "Assigned" || c.status === "Reopened") pending++;
    if (c.status === "Escalated") escalated++;
    if (c.status === "Resolved") resolved++;
    const pastDue = c.sla_due_at && new Date(c.sla_due_at).getTime() < now;
    if (c.status === "Overdue" || (pastDue && c.status !== "Resolved")) overdue++;
  }

  const photos = await getPhotoUrls(complaints.map((c) => c.id));
  const names = await getAuthorityNames(complaints.map((c) => c.current_authority_id));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Pending Acknowledgement" value={pending} />
        <StatCard label="Overdue" value={overdue} />
        <StatCard label="Escalated" value={escalated} />
        <StatCard label="Resolved" value={resolved} />
      </div>

      {complaints.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500">No complaints assigned to you.</p>
      )}

      {complaints.map((c) => {
        const status = c.status;
        const waiting = status === "Resolved" || status === "Pending Confirmation";
        const canAck = status === "Assigned" || status === "Escalated" || status === "Reopened" || status === "Overdue";
        const canStart = status === "Acknowledged";
        const canComplete = status === "Acknowledged" || status === "In Progress";

        return (
          <div key={c.id} className="space-y-2">
            <ComplaintCard
              complaint={c}
              photoUrl={photos[c.id]}
              authorityName={c.current_authority_id ? names[c.current_authority_id] : undefined}
            />
            <p className="px-1 text-sm text-slate-600">{c.description}</p>

            <div className={card + " space-y-3"}>
              {waiting && <p className="text-sm text-slate-500">Waiting for citizen confirmation.</p>}

              <div className="flex flex-wrap gap-2">
                {canAck && (
                  <form action={acknowledge}>
                    <Hidden id={c.id} />
                    <button className={btn}>{mode === "councillor" ? "Acknowledge" : "Accept"}</button>
                  </form>
                )}
                {mode === "department" && canStart && (
                  <form action={startWork}>
                    <Hidden id={c.id} />
                    <button className={btn}>Start Work</button>
                  </form>
                )}
                {mode === "councillor" && !waiting && (
                  <form action={forwardToDepartment}>
                    <Hidden id={c.id} />
                    <button className={btnLight}>Forward to Department</button>
                  </form>
                )}
              </div>

              {!waiting && (
                <form action={addNote} className="flex gap-2">
                  <Hidden id={c.id} />
                  <input name="note" required maxLength={500} placeholder="Add a note or progress update" className={input} />
                  <button className={btnLight}>Add Note</button>
                </form>
              )}

              {mode === "department" && canComplete && (
                <form action={markCompleted} className="space-y-2 border-t border-slate-100 pt-3">
                  <Hidden id={c.id} />
                  <textarea
                    name="description"
                    required
                    minLength={10}
                    maxLength={1000}
                    placeholder="What was done to fix the problem?"
                    className={input}
                  />
                  <input type="date" name="completedOn" required defaultValue={today} className={input} />
                  <button className={btn}>Mark Completed</button>
                </form>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
