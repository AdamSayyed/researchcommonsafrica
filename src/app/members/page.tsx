import Link from "next/link";
import { community } from "@/lib/community";
import CommunityNav from "@/components/community-nav";
import MemberCard from "@/components/member-card";
export default async function Members({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    mentor?: string;
    collaborator?: string;
    page?: string;
  }>;
}) {
  const { client, profile } = await community();
  const s = await searchParams;
  const page = Math.max(0, Math.min(1000, Number(s.page) || 0));
  const q = (s.q || "")
    .replace(/[%_,().]/g, " ")
    .trim()
    .slice(0, 100);
  let query = client
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });
  if (q)
    query = query.or(
      "name.ilike.%" +
        q +
        "%,field.ilike.%" +
        q +
        "%,city.ilike.%" +
        q +
        "%,interests.ilike.%" +
        q +
        "%,affiliation.ilike.%" +
        q +
        "%",
    );
  if (s.mentor === "1") query = query.eq("open_to_mentorship", true);
  if (s.collaborator === "1") query = query.eq("open_to_collaboration", true);
  const {
    data: people,
    count,
    error,
  } = await query.range(page * 12, page * 12 + 11);
  if (error) throw new Error("Unable to load community");
  const url = (p: number) =>
    "/members?" +
    new URLSearchParams({
      q: s.q || "",
      mentor: s.mentor || "",
      collaborator: s.collaborator || "",
      page: String(p),
    });
  return (
    <main>
      <CommunityNav />
      <section className="welcome">
        <p className="eyebrow">YOUR COMMUNITY, YOUR POSSIBILITIES</p>
        <h1>Welcome, {profile.name.split(" ")[0]}.</h1>
        <p>Find the next perspective that moves your research forward.</p>
        <div className="actions">
          <Link className="button" href="/research/new">
            Share a question
          </Link>
          <Link className="button secondary" href="/mentorship">
            Find mentorship
          </Link>
        </div>
      </section>
      <section className="page-heading">
        <div>
          <h2>Meet your community</h2>
          <p>Across borders, disciplines and practice.</p>
        </div>
        <Link href="/map">Explore the map →</Link>
      </section>
      <form className="filters">
        <input
          name="q"
          aria-label="Search members"
          placeholder="Name, field, city, affiliation or keyword"
          defaultValue={s.q}
        />
        <label className="check">
          <input
            type="checkbox"
            name="mentor"
            value="1"
            defaultChecked={s.mentor === "1"}
          />
          Mentors
        </label>
        <label className="check">
          <input
            type="checkbox"
            name="collaborator"
            value="1"
            defaultChecked={s.collaborator === "1"}
          />
          Collaborators
        </label>
        <button>Search</button>
      </form>
      <p className="hint">{count || 0} members found</p>
      <div className="grid">
        {people?.map((p) => (
          <MemberCard key={p.id} person={p} />
        ))}
      </div>
      {!people?.length && (
        <div className="empty">
          <h2>No matches yet.</h2>
          <p>Try a broader field or location.</p>
          <Link href="/members">Clear filters</Link>
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
