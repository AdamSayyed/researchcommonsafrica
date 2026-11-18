import { community } from "@/lib/community";
import CommunityNav from "@/components/community-nav";
import MemberMap from "@/components/member-map";
export default async function MapPage() {
  const { client } = await community();
  const { data: people, error } = await client
    .from("profiles")
    .select("id,name,field,city")
    .eq("show_on_map", true)
    .order("city")
    .limit(1000);
  if (error) throw new Error("Unable to load member locations");
  const locations = new Map<
    string,
    { id: string; name: string; field: string }[]
  >();
  people?.forEach((p) =>
    locations.set(p.city, [
      ...(locations.get(p.city) || []),
      { id: p.id, name: p.name, field: p.field },
    ]),
  );
  return (
    <main>
      <CommunityNav />
      <p className="eyebrow">ACROSS BORDERS</p>
      <h1>A continent of connections.</h1>
      <p>
        Discover the people behind research, wherever they are. You choose
        whether to appear on this map in your profile.
      </p>
      <MemberMap
        locations={Array.from(locations, ([city, people]) => ({
          city,
          people,
        }))}
      />
    </main>
  );
}
