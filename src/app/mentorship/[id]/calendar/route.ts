import { NextResponse } from "next/server";
import { community, uuid, slotColumns } from "@/lib/community";
const escape = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
const date = (s: string) =>
  new Date(s)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z/, "Z");
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { client, user } = await community();
  const { id } = await params;
  if (!uuid(id)) return new NextResponse("Not found", { status: 404 });
  const { data: s, error } = await client
    .from("mentor_slots")
    .select(slotColumns)
    .eq("id", id)
    .maybeSingle();
  if (
    error ||
    !s ||
    s.cancelled ||
    (s.mentor_id !== user.id && s.booked_by !== user.id)
  )
    return new NextResponse("Not found", { status: 404 });
  const { data: link } = await client.rpc("slot_link", { slot_id: id });
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Research Commons Africa//Mentorship//EN",
    "BEGIN:VEVENT",
    "UID:" + s.id + "@researchcommonsafrica.vercel.app",
    "DTSTAMP:" + date(new Date().toISOString()),
    "DTSTART:" + date(s.starts_at),
    "DTEND:" + date(s.ends_at),
    "SUMMARY:" + escape(s.topic),
    "DESCRIPTION:" +
      escape(
        "Research Commons Africa mentorship. Check the app for schedule changes.",
      ),
    "LOCATION:" + escape(link || "Meeting link to be added"),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mentorship.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
