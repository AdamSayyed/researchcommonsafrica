"use server";
import { community, text, https, uuid } from "@/lib/community";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function createSlot(form: FormData) {
  const { client, user, profile } = await community();
  const start = new Date(text(form, "starts_at", 50)),
    minutes = Number(form.get("minutes")),
    topic = text(form, "topic", 160),
    meeting_url = text(form, "meeting_url", 500);
  if (
    !profile.open_to_mentorship ||
    !Number.isFinite(start.getTime()) ||
    start.getTime() <= Date.now() ||
    ![30, 60, 90].includes(minutes) ||
    topic.length < 3 ||
    !https(meeting_url)
  )
    redirect("/mentorship?error=invalid");
  const { error } = await client
    .from("mentor_slots")
    .insert({
      mentor_id: user.id,
      starts_at: start.toISOString(),
      ends_at: new Date(start.getTime() + minutes * 60000).toISOString(),
      topic,
      meeting_url,
    });
  if (error) redirect("/mentorship?error=save");
  revalidatePath("/mentorship");
  redirect("/mentorship?success=published");
}
export async function bookSlot(form: FormData) {
  const { client } = await community();
  const id = text(form, "id", 50);
  if (!uuid(id)) redirect("/mentorship");
  const { data, error } = await client.rpc("book_slot", { slot_id: id });
  if (error || !data) redirect("/mentorship?error=unavailable");
  revalidatePath("/mentorship");
  redirect("/mentorship?success=booked");
}
export async function cancelSlot(form: FormData) {
  const { client } = await community();
  const id = text(form, "id", 50);
  if (!uuid(id)) redirect("/mentorship");
  const { data, error } = await client.rpc("cancel_slot", { slot_id: id });
  if (error || !data) redirect("/mentorship?error=save");
  revalidatePath("/mentorship");
  redirect("/mentorship?success=cancelled");
}
export async function updateLink(form: FormData) {
  const { client, user } = await community();
  const id = text(form, "id", 50),
    meeting_url = text(form, "meeting_url", 500);
  if (!uuid(id) || !https(meeting_url)) redirect("/mentorship?error=invalid");
  const { error } = await client
    .from("mentor_slots")
    .update({ meeting_url })
    .eq("id", id)
    .eq("mentor_id", user.id);
  if (error) redirect("/mentorship?error=save");
  revalidatePath("/mentorship");
  redirect("/mentorship?success=updated");
}
