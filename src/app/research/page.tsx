import Link from "next/link";
import CommunityNav from "@/components/community-nav";
import { community } from "@/lib/community";
export default async function Research({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    kind?: string;
    status?: string;
    page?: string;
    error?: string;
  }>;
}) {
  const { client } = await community();
  const s = await searchParams;
  const page = Math.max(0, Math.min(1000, Number(s.page) || 0));
  const q = (s.q || "")
    .replace(/[%_,().]/g, " ")
    .trim()
    .slice(0, 100);
  let query = client
    .from("posts")
    .select("*,profiles!posts_author_id_fkey(name)", { count: "exact" })
    .order("created_at", { ascending: false });
  if (q)
    query = query.or(
      "title.ilike.%" + q + "%,body.ilike.%" + q + "%,field.ilike.%" + q + "%",
    );
  if (["Question", "Project", "Mentorship"].includes(s.kind || ""))
    query = query.eq("kind", s.kind!);
  if (["Open", "Resolved"].includes(s.status || ""))
    query = query.eq("status", s.status!);
  const {
    data: posts,
    count,
    error,
  } = await query.range(page * 12, page * 12 + 11);
  if (error) throw new Error("Unable to load research");
  const url = (p: number) =>
    "/research?" +
    new URLSearchParams({
      q: s.q || "",
      kind: s.kind || "",
      status: s.status || "",
      page: String(p),
    });
  return (
    <main>
      <CommunityNav />
      <section className="page-heading">
        <div>
          <p className="eyebrow">IDEAS GROW THROUGH CONNECTION</p>
          <h1>The research commons.</h1>
          <p>
            Ask a question. Find a collaborator. Move your research forward.
          </p>
        </div>
        <Link className="button" href="/research/new">
          + Share your research
        </Link>
      </section>
      {s.error && (
        <p className="notice" role="alert">
          We couldn’t save that change. Check the fields and try again.
        </p>
      )}
      <form className="filters">
        <input
          name="q"
          aria-label="Search research"
          defaultValue={s.q}
          placeholder="Search questions, fields, or keywords"
        />
        <select name="kind" aria-label="Post type" defaultValue={s.kind || ""}>
          <option value="">All types</option>
          <option>Question</option>
          <option>Project</option>
          <option>Mentorship</option>
        </select>
        <select name="status" aria-label="Status" defaultValue={s.status || ""}>
          <option value="">Any status</option>
          <option>Open</option>
          <option>Resolved</option>
        </select>
        <button>Search</button>
      </form>
      <p className="hint">{count || 0} research posts</p>
      <div className="grid">
        {posts?.map((p) => (
          <article className="card" key={p.id}>
            <div className="badges">
              <span className="badge">{p.kind}</span>
              <span className={"badge " + (p.status === "Open" ? "green" : "")}>
                {p.status}
              </span>
            </div>
            <h2>
              <Link href={"/research/" + p.id}>{p.title}</Link>
            </h2>
            <p className="excerpt">
              {p.body.slice(0, 230)}
              {p.body.length > 230 ? "…" : ""}
            </p>
            <div className="card-footer">
              <span>{p.field}</span>
              <span>{p.profiles?.name}</span>
            </div>
          </article>
        ))}
      </div>
      {!posts?.length && (
        <div className="empty">
          <h2>No posts here yet.</h2>
          <p>Try another search or start a conversation with the community.</p>
          <Link href="/research/new">Share the first question →</Link>
        </div>
      )}
      <nav aria-label="Pagination">
        {page > 0 && <Link href={url(page - 1)}>← Previous</Link>}
        {(count || 0) > (page + 1) * 12 && (
          <Link href={url(page + 1)}>Next →</Link>
        )}
      </nav>
    </main>
  );
}
