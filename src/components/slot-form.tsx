"use client";
import { useState, useEffect } from "react";
import { createSlot } from "@/app/mentorship/actions";
import Submit from "./submit";
export default function SlotForm() {
  const [start, setStart] = useState("");
  const [zone, setZone] = useState("your local time");
  useEffect(
    () => setZone(Intl.DateTimeFormat().resolvedOptions().timeZone),
    [],
  );
  return (
    <form action={createSlot}>
      <label>
        Session topic
        <input
          name="topic"
          required
          minLength={3}
          maxLength={160}
          placeholder="Research design, data analysis, career advice…"
        />
      </label>
      <label>
        Start time ({zone})
        <input
          type="datetime-local"
          required
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </label>
      <input
        type="hidden"
        name="starts_at"
        value={
          start && !isNaN(Date.parse(start))
            ? new Date(start).toISOString()
            : ""
        }
      />
      <label>
        Duration
        <select name="minutes">
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="90">90 minutes</option>
        </select>
      </label>
      <label>
        Meeting link (optional)
        <input
          type="url"
          name="meeting_url"
          placeholder="https://meet.google.com/…"
          maxLength={500}
        />
      </label>
      <p className="hint">
        Paste your Google Meet or Zoom link. Only you and the member who books
        can see it. You can add it later.
      </p>
      <Submit>Publish availability</Submit>
    </form>
  );
}
