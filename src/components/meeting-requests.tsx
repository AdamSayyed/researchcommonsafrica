import Link from "next/link";
import LocalTime from "./local-time";
import Submit from "./submit";
import { respondMeeting } from "@/app/mentorship/requests";
import { community } from "@/lib/community";
export default async function MeetingRequests() {
  const { client, user } = await community();
  const { data: requests, error } = await client
    .from("meeting_requests")
    .select(
      "*,requester:profiles!meeting_requests_requester_id_fkey(name),recipient:profiles!meeting_requests_recipient_id_fkey(name)",
    )
    .eq("status", "Pending")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Unable to load meeting requests");
  return (
    <section>
      <h2>Meeting requests awaiting confirmation</h2>
      <p>
        These are proposals, not confirmed meetings. The sender has confirmed
        their availability; the post author confirms the other side.
      </p>
      {!requests?.length && (
        <p className="empty">No pending meeting requests.</p>
      )}
      <div className="grid">
        {requests?.map((r) => (
          <article className="card" key={r.id}>
            <span className="badge gold">
              {Date.parse(r.starts_at) <= Date.now()
                ? "Expired"
                : r.recipient_id === user.id
                  ? "Your confirmation needed"
                  : "Waiting for post author"}
            </span>
            <h3>{r.post_title}</h3>
            <p>
              {r.recipient_id === user.id
                ? "From: " + r.requester?.name
                : "To: " + r.recipient?.name}
            </p>
            <p>
              <LocalTime value={r.starts_at} />
              <br />
              {Math.round(
                (Date.parse(r.ends_at) - Date.parse(r.starts_at)) / 60000,
              )}{" "}
              minutes
            </p>
            {r.note && <p className="prose">{r.note}</p>}
            {r.post_id && (
              <Link href={"/research/" + r.post_id}>View research post →</Link>
            )}
            <div className="actions">
              {r.recipient_id === user.id ? (
                <>
                  {Date.parse(r.starts_at) > Date.now() && (
                    <form action={respondMeeting}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="decision" value="Confirmed" />
                      <Submit>Confirm meeting</Submit>
                    </form>
                  )}
                  <form action={respondMeeting}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="decision" value="Declined" />
                    <Submit>Decline</Submit>
                  </form>
                </>
              ) : (
                <form action={respondMeeting}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="decision" value="Withdrawn" />
                  <Submit>Withdraw request</Submit>
                </form>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
