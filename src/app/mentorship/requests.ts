"use server";
import { community, text, uuid } from "@/lib/community";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function requestMeeting(form: FormData) {
  const { client } = await community();
  const post = text(form, "post", 50),
    starts = text(form, "starts", 50),
    minutes = Number(form.get("minutes")),
    message = text(form, "message", 1000);
  if (!uuid(post)) redirect("/research");
  if (
    !Number.isFinite(Date.parse(starts)) ||
    Date.parse(starts) <= Date.now() ||
    ![30, 60, 90].includes(minutes)
  )
    redirect("/research/" + post + "?meeting=invalid");
  const { error } = await client.rpc("request_post_meeting", {
    post,
    starts,
    minutes,
    message,
  });
  if (error) redirect("/research/" + post + "?meeting=failed");
  revalidatePath("/mentorship");
  revalidatePath("/research/" + post);
  redirect("/mentorship?success=requested");
}
export async function respondMeeting(form: FormData) {
  const { client } = await community();
  const request_id = text(form, "id", 50),
    decision = text(form, "decision", 20);
  if (
    !uuid(request_id) ||
    !["Confirmed", "Declined", "Withdrawn"].includes(decision)
  )
    redirect("/mentorship");
  const { data, error } = await client.rpc("respond_post_meeting", {
    request_id,
    decision,
  });
  if (error || !data) redirect("/mentorship?error=request");
  revalidatePath("/mentorship");
  redirect("/mentorship?success=" + decision.toLowerCase());
}
