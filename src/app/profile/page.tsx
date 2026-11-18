import { requireMember } from "@/lib/member";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { https, text } from "@/lib/community";
import CommunityNav from "@/components/community-nav";
import Submit from "@/components/submit";
import { cities } from "@/lib/locations";
const careers = [
  "Master’s student",
  "PhD student",
  "Professor",
  "Industry professional",
  "Other researcher",
];
async function save(form: FormData) {
  "use server";
  const { client, user } = await requireMember();
  const profile = {
    id: user.id,
    name: text(form, "name", 80),
    career_stage: text(form, "career_stage", 60),
    affiliation: text(form, "affiliation", 160),
    field: text(form, "field", 120),
    city: text(form, "city", 160),
    bio: text(form, "bio", 1000),
    interests: text(form, "interests", 500),
    website: text(form, "website", 500),
    contact_email: text(form, "contact_email", 254),
    research_alerts: form.has("research_alerts"),
    show_on_map: form.has("show_on_map"),
    open_to_mentorship: form.has("mentor"),
    open_to_collaboration: form.has("collaborator"),
  };
  if (
    !profile.name ||
    !profile.affiliation ||
    !profile.field ||
    !profile.city ||
    !careers.includes(profile.career_stage) ||
    !https(profile.website) ||
    (profile.contact_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.contact_email))
  )
    redirect("/profile?error=invalid");
  const { data: existing, error: lookupError } = await client
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (lookupError) redirect("/profile?error=save");
  const { id, ...changes } = profile;
  const { error } = existing
    ? await client.from("profiles").update(changes).eq("id", id)
    : await client.from("profiles").insert(profile);
  if (error) redirect("/profile?error=save");
  revalidatePath("/members");
  redirect("/members");
}
export default async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { client, user } = await requireMember();
  const { data: p, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error("Could not load profile");
  const q = await searchParams;
  return (
    <main>
      <CommunityNav />
      <p className="eyebrow">LET YOUR COMMUNITY GET TO KNOW YOU</p>
      <h1>Your place in the commons.</h1>
      <p>
        Your profile is visible to verified members. Your sign-in email stays
        private unless you choose to share a contact email below.
      </p>
      {q.error && (
        <p className="notice" role="alert">
          Unable to save. Check the required fields and use an HTTPS website
          link.
        </p>
      )}
      <form action={save} className="card wide-form">
        <div className="form-row">
          <label>
            Name
            <input name="name" required maxLength={80} defaultValue={p?.name} />
          </label>
          <label>
            Career stage
            <select name="career_stage" defaultValue={p?.career_stage}>
              {careers.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Affiliation
            <input
              name="affiliation"
              required
              maxLength={160}
              defaultValue={p?.affiliation}
            />
          </label>
          <label>
            Research field
            <input
              name="field"
              required
              maxLength={120}
              defaultValue={p?.field}
            />
          </label>
        </div>
        <label>
          City, country
          <input
            name="city"
            list="cities"
            required
            maxLength={160}
            defaultValue={p?.city}
            placeholder="Start typing a city, or enter your own"
          />
          <datalist id="cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          Areas of interest / expertise
          <input
            name="interests"
            maxLength={500}
            defaultValue={p?.interests}
            placeholder="e.g. Epidemiology, maternal health, qualitative methods"
          />
        </label>
        <label>
          About your research and experience
          <textarea
            name="bio"
            maxLength={1000}
            rows={6}
            defaultValue={p?.bio}
          />
        </label>
        <div className="form-row">
          <label>
            Website, portfolio or CV link (optional)
            <input
              type="url"
              name="website"
              maxLength={500}
              defaultValue={p?.website}
              placeholder="https://…"
            />
          </label>
          <label>
            Contact email to share (optional)
            <input
              type="email"
              name="contact_email"
              maxLength={254}
              defaultValue={p?.contact_email}
            />
          </label>
        </div>
        <label className="check">
          <input
            type="checkbox"
            name="mentor"
            defaultChecked={p?.open_to_mentorship}
          />
          Open to mentorship
        </label>
        <label className="check">
          <input
            type="checkbox"
            name="collaborator"
            defaultChecked={p?.open_to_collaboration}
          />
          Open to collaboration
        </label>
        <label className="check">
          <input
            type="checkbox"
            name="show_on_map"
            defaultChecked={p?.show_on_map}
          />
          Show my city on the member map
        </label>
        <label className="check">
          <input
            type="checkbox"
            name="research_alerts"
            defaultChecked={p?.research_alerts}
          />
          Notify me in the app about new posts in my research field (mentors
          only)
        </label>
        <p className="hint">
          The map uses Google Maps to show your selected city. Share a city, not
          a street address.
        </p>
        <Submit>Save profile</Submit>
      </form>
    </main>
  );
}
