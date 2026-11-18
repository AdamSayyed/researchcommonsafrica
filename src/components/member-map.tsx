"use client";
import { useState } from "react";
import Link from "next/link";
type Location = {
  city: string;
  people: { id: string; name: string; field: string }[];
};
export default function MemberMap({ locations }: { locations: Location[] }) {
  const [selected, setSelected] = useState(locations[0]?.city || "");
  const current = locations.find((l) => l.city === selected);
  return (
    <div className="map-layout">
      <aside className="card">
        <h2>Explore a community</h2>
        <label>
          Member locations
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Africa overview</option>
            {locations.map((l) => (
              <option key={l.city} value={l.city}>
                {l.city} ({l.people.length})
              </option>
            ))}
          </select>
        </label>
        {current?.people.map((p) => (
          <p key={p.id}>
            <Link href={"/members/" + p.id}>
              <strong>{p.name}</strong>
            </Link>
            <br />
            <small>{p.field}</small>
          </p>
        ))}
        {!locations.length && (
          <p>Members who opt in to the map will appear here.</p>
        )}
        <p className="hint">
          City-level locations only. No home addresses or live location
          tracking.
        </p>
      </aside>
      <div className="map-frame">
        <iframe
          title={"Google Map of " + (selected || "Africa")}
          src={
            "https://maps.google.com/maps?q=" +
            encodeURIComponent(selected || "Africa") +
            "&z=" +
            (selected ? "10" : "3") +
            "&output=embed"
          }
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <p className="hint">
          Select a city to see its Google Map and members. Map content is
          provided by Google.
        </p>
      </div>
    </div>
  );
}
