import MeetingRequestForm from "@/components/meeting-request-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { community, uuid } from "@/lib/community";
import CommunityNav from "@/components/community-nav";
import Submit from "@/components/submit";
import LocalTime from "@/components/local-time";
import PostForm from "@/components/post-form";
import {
  reply,
  editReply,
  deleteReply,
  deletePost,
  setStatus,
} from "../actions";
export default async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; meeting?: string }>;
}) {
  const { client, user } = await community();
  const { id } = await params;
  if (!uuid(id)) notFound();
  const { data: p, error } = await client
    .from("posts")
    .select("*,profiles!posts_author_id_fkey(id,name,affiliation)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Unable to load post");
  if (!p) notFound();
  const { data: responses, error: re } = await client
    .from("responses")
    .select("*,profiles!responses_author_id_fkey(name)")
    .eq("post_id", id)
    .order("created_at")
    .limit(200);
  if (re) throw new Error("Unable to load responses");
  const { data: pending, error: requestError } = await client
    .from("meeting_requests")
    .select("id")
    .eq("post_id", id)
    .eq("requester_id", user.id)
    .eq("status", "Pending")
    .gt("starts_at", new Date().toISOString())
    .limit(1);
  if (requestError) throw new Error("Unable to load meeting requests");
  const s = await searchParams;
  return (
    <main>
      <CommunityNav />
      <Link href="/research">← Research board</Link>
      <article className="card reading">
        <div className="badges">
          <span className="badge">{p.kind}</span>
          <span className="badge green">{p.status}</span>
          <span className="badge">{p.field}</span>
        </div>
        <h1>{p.title}</h1>
        <p>
          By <Link href={"/members/" + p.author_id}>{p.profiles?.name}</Link> ·{" "}
          <LocalTime value={p.created_at} />
        </p>
        <div className="prose">{p.body}</div>
        {p.availability && (
          <p className="notice">
            <strong>Availability / next steps:</strong> {p.availability}
          </p>
        )}
        {user.id === p.author_id && (
          <>
            <div className="actions">
              <form action={setStatus}>
                <input type="hidden" name="id" value={id} />
                <input
                  type="hidden"
                  name="status"
                  value={p.status === "Open" ? "Resolved" : "Open"}
                />
                <Submit>
                  {p.status === "Open" ? "Mark resolved" : "Reopen post"}
                </Submit>
              </form>
              <form action={deletePost}>
                <input type="hidden" name="id" value={id} />
                <Submit confirm="Delete this post and all its responses? This cannot be undone.">
                  Delete post
                </Submit>
              </form>
            </div>
            <details>
              <summary>Edit your post</summary>
              <PostForm post={p} />
            </details>
          </>
        )}
      </article>
      {s.meeting && (
        <p className="notice" role="alert">
          Could not send the request. Choose a future time, or check Mentorship
          for an existing pending request.
        </p>
      )}
      {p.status === "Open" && user.id !== p.author_id && (
        <section className="card">
          <h2>Schedule a conversation about this post</h2>
          {pending?.length ? (
            <p>
              You already have a pending request.{" "}
              <Link href="/mentorship">
                View or withdraw it in Mentorship →
              </Link>
            </p>
          ) : (
            <MeetingRequestForm post={id} />
          )}
        </section>
      )}
      {user.id === p.author_id && (
        <p>
          <Link href="/mentorship">
            Review meeting requests for your research →
          </Link>
        </p>
      )}
      {s.error && (
        <p role="alert" className="notice">
          Couldn’t save. The post may be resolved or your session may have
          changed. Refresh and try again.
        </p>
      )}
      <h2>Conversation ({responses?.length || 0})</h2>
      {responses?.map((r) => (
        <article className="card" key={r.id}>
          <p>
            <Link href={"/members/" + r.author_id}>
              <strong>{r.profiles?.name}</strong>
            </Link>{" "}
            · <LocalTime value={r.created_at} />
          </p>
          <div className="prose">{r.body}</div>
          {r.author_id === user.id && (
            <details>
              <summary>Edit or remove response</summary>
              <form action={editReply}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="post_id" value={id} />
                <textarea
                  name="body"
                  required
                  minLength={2}
                  maxLength={5000}
                  defaultValue={r.body}
                />
                <Submit>Save response</Submit>
              </form>
              <form action={deleteReply}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="post_id" value={id} />
                <Submit confirm="Delete this response?">Delete response</Submit>
              </form>
            </details>
          )}
        </article>
      ))}
      {p.status === "Open" ? (
        <section className="card">
          <h2>Contribute your perspective</h2>
          <form action={reply}>
            <input type="hidden" name="post_id" value={id} />
            <label>
              Your response
              <textarea
                name="body"
                required
                minLength={2}
                maxLength={5000}
                rows={5}
              />
            </label>
            <Submit>Post response</Submit>
          </form>
        </section>
      ) : (
        <p className="notice">
          This post is resolved. Its author can reopen the conversation.
        </p>
      )}
    </main>
  );
}
