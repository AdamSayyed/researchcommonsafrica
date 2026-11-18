import Link from "next/link";
export type Person = {
  id: string;
  name: string;
  career_stage: string;
  affiliation: string;
  field: string;
  city: string;
  bio: string;
  open_to_mentorship: boolean;
  open_to_collaboration?: boolean;
  interests?: string;
  website?: string;
  contact_email?: string;
};
export default function MemberCard({ person: p }: { person: Person }) {
  return (
    <article className="card member-card">
      <div className="avatar" aria-hidden="true">
        {p.name
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")}
      </div>
      <p className="eyebrow">{p.career_stage}</p>
      <h2>
        <Link href={"/members/" + p.id}>{p.name}</Link>
      </h2>
      <p>
        {p.affiliation}
        <br />
        {p.city}
      </p>
      <span className="badge">{p.field}</span>
      <p className="excerpt">
        {p.bio.slice(0, 180)}
        {p.bio.length > 180 ? "…" : ""}
      </p>
      <div className="badges">
        {p.open_to_mentorship && (
          <span className="badge green">Open to mentorship</span>
        )}
        {p.open_to_collaboration && (
          <span className="badge gold">Open to collaboration</span>
        )}
      </div>
    </article>
  );
}
