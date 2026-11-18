import Link from "next/link";
import { notFound } from "next/navigation";
import { community, uuid, https } from "@/lib/community";
import CommunityNav from "@/components/community-nav";
export default async function Member({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { client, user } = await community();
  const { id } = await params;
  if (!uuid(id)) notFound();
  const { data: p, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Unable to load member");
  if (!p) notFound();
  const { data: posts, error: pe } = await client
    .from("posts")
    .select("id,title,kind,status")
    .eq("author_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (pe) throw new Error("Unable to load member research");
  return (
    <main>
      <CommunityNav />
      <Link href="/members">← Community</Link>
      <article className="card reading">
        <div className="avatar large">
          {p.name
            .split(" ")
            .slice(0, 2)
            .map((n: string) => n[0])
            .join("")}
        </div>
        <p className="eyebrow">{p.career_stage}</p>
        <h1>{p.name}</h1>
        <p>
          {p.affiliation} · {p.city}
        </p>
        <div className="badges">
          <span className="badge">{p.field}</span>
          {p.open_to_mentorship && (
            <span className="badge green">Open to mentorship</span>
          )}
          {p.open_to_collaboration && (
            <span className="badge gold">Open to collaboration</span>
          )}
        </div>
        <h2>Research & experience</h2>
        <p className="prose">
          {p.bio || "This member has not added a biography yet."}
        </p>
        {p.interests && (
          <>
            <h3>Areas of interest</h3>
            <p>{p.interests}</p>
          </>
        )}
        <div className="actions">
          {p.website && https(p.website) && (
            <a
              className="button"
              href={p.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website / CV ↗
            </a>
          )}
          {p.contact_email && (
            <a className="button secondary" href={"mailto:" + p.contact_email}>
              Contact member
            </a>
          )}
          {p.open_to_mentorship && (
            <Link href="/mentorship">Browse mentorship times →</Link>
          )}
          {user.id === p.id && <Link href="/profile">Edit profile</Link>}
        </div>
      </article>
      <h2>Research in the commons</h2>
      {posts?.map((p) => (
        <article className="card" key={p.id}>
          <span className="badge">
            {p.kind} · {p.status}
          </span>
          <h3>
            <Link href={"/research/" + p.id}>{p.title}</Link>
          </h3>
        </article>
      ))}
      {!posts?.length && <p>No research posts yet.</p>}
    </main>
  );
}
