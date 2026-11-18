"use client";
import { useState, useEffect } from "react";
import { requestMeeting } from "@/app/mentorship/requests";
import Submit from "./submit";
export default function MeetingRequestForm({ post }: { post: string }) {
  const [start, setStart] = useState("");
  const [zone, setZone] = useState("your local timezone");
  useEffect(
    () => setZone(Intl.DateTimeFormat().resolvedOptions().timeZone),
    [],
  );
  return (
    <form action={requestMeeting}>
      <input type="hidden" name="post" value={post} />
      <label>
        Proposed meeting time ({zone})
        <input
          type="datetime-local"
          required
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </label>
      <input
        type="hidden"
        name="starts"
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
        What would you like to discuss? (optional)
        <textarea name="message" maxLength={1000} rows={3} />
      </label>
      <label className="check">
        <input type="checkbox" required />I confirm I am available at this time.
      </label>
      <p className="hint">
        Sending confirms your side. The post author must also accept before this
        appears in both members’ upcoming meetings.
      </p>
      <Submit>Confirm my time & send request</Submit>
    </form>
  );
}
