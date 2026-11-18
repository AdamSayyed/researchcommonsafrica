import MeetingRequests from "@/components/meeting-requests";
import Link from "next/link";
import { community, slotColumns } from "@/lib/community";
import CommunityNav from "@/components/community-nav";
import SlotForm from "@/components/slot-form";
import Submit from "@/components/submit";
import LocalTime from "@/components/local-time";
import { bookSlot, cancelSlot, updateLink } from "./actions";
export default async function Mentorship({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { client, user, profile } = await community();
  const s = await searchParams;
  const { data: slots, error } = await client
    .from("mentor_slots")
    .select(slotColumns)
    .gte("ends_at", new Date().toISOString())
    .order("starts_at")
    .limit(200);
  if (error) throw new Error("Unable to load sessions");
  const { data: people, error: pe } = await client
    .from("profiles")
    .select("id,name,field");
  if (pe) throw new Error("Unable to load mentors");
  const names = new Map(people?.map((p) => [p.id, p]));
  const mine = (slots || []).filter(
    (t) => t.mentor_id === user.id || t.booked_by === user.id,
  );
  const available = (slots || []).filter(
    (t) =>
      !t.booked_by &&
      !t.cancelled &&
      t.mentor_id !== user.id &&
      new Date(t.starts_at) > new Date(),
  );
  const links = new Map<string, string>();
  await Promise.all(
    mine
      .filter((t) => !t.cancelled)
      .map(async (t) => {
        const { data, error } = await client.rpc("slot_link", {
          slot_id: t.id,
        });
        if (error) throw new Error("Unable to load meeting details");
        if (data) links.set(t.id, data);
      }),
  );
  return (
    <main>
      <CommunityNav />
      <p className="eyebrow">A LITTLE GUIDANCE, A NEW POSSIBILITY</p>
      <h1>Make time for mentorship.</h1>
      <p>
        Book a conversation with someone who understands your field. Times are
        displayed in your timezone.
      </p>
      {s.error && (
        <p className="notice" role="alert">
          {s.error === "unavailable"
            ? "That time is unavailable or overlaps your schedule. Please choose another session."
            : s.error === "request"
              ? "This request cannot be confirmed. It may have expired, changed, or conflict with a participant schedule. Decline or withdraw it and propose another time."
              : "Unable to save. Check your details, future date and HTTPS meeting link. Availability must not overlap your existing sessions."}
        </p>
      )}
      {s.success && (
        <p className="success" role="status">
          Session {s.success}. Your schedule is up to date.
        </p>
      )}
      <MeetingRequests />
      {[
        {
          title: "Your upcoming meetings",
          items: mine.filter((t) => t.booked_by && !t.cancelled),
        },
        {
          title: "Your availability",
          items: mine.filter((t) => !t.booked_by && !t.cancelled),
        },
        { title: "Cancelled sessions", items: mine.filter((t) => t.cancelled) },
      ].map((group) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          {!group.items.length && (
            <p className="empty">
              No sessions yet. Book a time below or offer your expertise.
            </p>
          )}
          <div className="grid">
            {group.items.map((t) => (
              <article className="card" key={t.id}>
                <span className="badge">
                  {t.cancelled
                    ? "Cancelled"
                    : t.booked_by
                      ? "Confirmed meeting"
                      : "Available"}
                </span>
                <h3>{t.topic}</h3>
                <p>
                  <LocalTime value={t.starts_at} />
                  <br />
                  {Math.round(
                    (Date.parse(t.ends_at) - Date.parse(t.starts_at)) / 60000,
                  )}{" "}
                  minutes
                </p>
                <p>
                  {t.mentor_id === user.id
                    ? t.booked_by
                      ? "With " + names.get(t.booked_by)?.name
                      : "You are mentoring"
                    : "Mentor: " + names.get(t.mentor_id)?.name}
                </p>
                {links.get(t.id) && (
                  <a
                    className="button"
                    href={links.get(t.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join meeting ↗
                  </a>
                )}
                {!t.cancelled && (
                  <div className="actions">
                    <a
                      href={"/mentorship/" + t.id + "/calendar"}
                      className="quiet"
                    >
                      Add to calendar
                    </a>
                    <form action={cancelSlot}>
                      <input type="hidden" name="id" value={t.id} />
                      <Submit
                        confirm={
                          t.mentor_id === user.id
                            ? "Cancel this session? The booked member will be notified."
                            : "Cancel your booking and free this time for someone else?"
                        }
                      >
                        Cancel {t.mentor_id === user.id ? "session" : "booking"}
                      </Submit>
                    </form>
                  </div>
                )}
                {!t.cancelled && t.mentor_id === user.id && (
                  <details>
                    <summary>Update meeting link</summary>
                    <form action={updateLink}>
                      <input type="hidden" name="id" value={t.id} />
                      <label>
                        Private meeting URL
                        <input
                          type="url"
                          name="meeting_url"
                          maxLength={500}
                          defaultValue={links.get(t.id) || ""}
                          placeholder="https://meet.google.com/…"
                        />
                      </label>
                      <Submit>Save link</Submit>
                    </form>
                  </details>
                )}
                {!t.cancelled &&
                  t.booked_by === user.id &&
                  !links.get(t.id) && (
                    <p className="hint">
                      Your mentor has not added a meeting link yet.
                    </p>
                  )}
              </article>
            ))}
          </div>
        </section>
      ))}
      <section>
        <h2>Available conversations</h2>
        <div className="grid">
          {available.map((t) => (
            <article className="card" key={t.id}>
              <span className="badge">{names.get(t.mentor_id)?.field}</span>
              <h3>{t.topic}</h3>
              <p>
                With{" "}
                <Link href={"/members/" + t.mentor_id}>
                  {names.get(t.mentor_id)?.name}
                </Link>
              </p>
              <p>
                <LocalTime value={t.starts_at} />
                <br />
                {Math.round(
                  (Date.parse(t.ends_at) - Date.parse(t.starts_at)) / 60000,
                )}{" "}
                minutes
              </p>
              <form action={bookSlot}>
                <input type="hidden" name="id" value={t.id} />
                <Submit>Book this conversation</Submit>
              </form>
            </article>
          ))}
        </div>
        {!available.length && (
          <div className="empty">
            <p>
              No open sessions yet. Find a mentor in the directory or be the
              first to offer a time.
            </p>
            <Link href="/members?mentor=1">Browse mentors →</Link>
          </div>
        )}
      </section>
      <section className="card">
        <h2>Share your time and experience</h2>
        {profile.open_to_mentorship ? (
          <SlotForm />
        ) : (
          <p>
            Turn on “Open to mentorship” in{" "}
            <Link href="/profile">your profile</Link> to publish availability.
          </p>
        )}
      </section>
    </main>
  );
}
