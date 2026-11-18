import Link from "next/link";
import { community } from "@/lib/community";
import CommunityNav from "@/components/community-nav";
import LocalTime from "@/components/local-time";
import Submit from "@/components/submit";
import { revalidatePath } from "next/cache";
async function readAll() {
  "use server";
  const { client, user } = await community();
  const { error } = await client
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  if (error) throw new Error("Unable to update notifications");
  revalidatePath("/notifications");
}
export default async function Notifications() {
  const { client, user } = await community();
  const { data: items, error } = await client
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Unable to load notifications");
  return (
    <main>
      <CommunityNav />
      <section className="page-heading">
        <div>
          <p className="eyebrow">KEEP THE CONVERSATION GOING</p>
          <h1>Your notifications.</h1>
        </div>
        <form action={readAll}>
          <Submit>Mark all as read</Submit>
        </form>
      </section>
      <p>Updates on your research conversations and mentorship sessions.</p>
      {items?.map((n) => (
        <article className={"card " + (!n.is_read ? "unread" : "")} key={n.id}>
          <Link href={n.href}>
            <strong>{n.message}</strong>
          </Link>
          <p className="hint">
            <LocalTime value={n.created_at} />
            {!n.is_read ? " · New" : ""}
          </p>
        </article>
      ))}
      {!items?.length && (
        <div className="empty">
          <h2>You’re all caught up.</h2>
          <p>Replies and bookings will appear here.</p>
        </div>
      )}
    </main>
  );
}
