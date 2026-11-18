"use server";
import { community, text, uuid } from "@/lib/community";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function savePost(form: FormData) {
  const { client, user } = await community();
  const id = text(form, "id", 50);
  const payload = {
    title: text(form, "title", 160),
    body: text(form, "body", 10000),
    field: text(form, "field", 120),
    kind: text(form, "kind", 30),
    availability: text(form, "availability", 500),
  };
  if (
    payload.title.length < 5 ||
    payload.body.length < 20 ||
    !payload.field ||
    !["Question", "Project", "Mentorship"].includes(payload.kind) ||
    (id && !uuid(id))
  )
    redirect("/research?error=invalid");
  const result = id
    ? await client
        .from("posts")
        .update(payload)
        .eq("id", id)
        .eq("author_id", user.id)
        .select("id")
        .single()
    : await client
        .from("posts")
        .insert({ ...payload, author_id: user.id })
        .select("id")
        .single();
  if (result.error || !result.data) redirect("/research?error=save");
  revalidatePath("/research");
  redirect("/research/" + result.data.id);
}
export async function setStatus(form: FormData) {
  const { client, user } = await community();
  const id = text(form, "id", 50);
  if (!uuid(id)) redirect("/research");
  const status = form.get("status") === "Resolved" ? "Resolved" : "Open";
  const { error } = await client
    .from("posts")
    .update({ status })
    .eq("id", id)
    .eq("author_id", user.id);
  if (error) redirect("/research/" + id + "?error=save");
  revalidatePath("/research/" + id);
  redirect("/research/" + id);
}
export async function reply(form: FormData) {
  const { client, user } = await community();
  const id = text(form, "post_id", 50),
    body = text(form, "body", 5000);
  if (!uuid(id)) redirect("/research");
  if (body.length < 2) redirect("/research/" + id + "?error=invalid");
  const { error } = await client
    .from("responses")
    .insert({ post_id: id, author_id: user.id, body });
  if (error) redirect("/research/" + id + "?error=save");
  revalidatePath("/research/" + id);
  redirect("/research/" + id);
}
export async function editReply(form: FormData) {
  const { client, user } = await community();
  const post = text(form, "post_id", 50),
    id = text(form, "id", 50),
    body = text(form, "body", 5000);
  if (!uuid(post) || !uuid(id)) redirect("/research");
  if (body.length < 2) redirect("/research/" + post + "?error=invalid");
  const { error } = await client
    .from("responses")
    .update({ body })
    .eq("id", id)
    .eq("author_id", user.id);
  if (error) redirect("/research/" + post + "?error=save");
  revalidatePath("/research/" + post);
  redirect("/research/" + post);
}
export async function deletePost(form: FormData) {
  const { client, user } = await community();
  const id = text(form, "id", 50);
  if (!uuid(id)) redirect("/research");
  const { error } = await client
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);
  if (error) redirect("/research/" + id + "?error=save");
  revalidatePath("/research");
  redirect("/research");
}
export async function deleteReply(form: FormData) {
  const { client, user } = await community();
  const id = text(form, "id", 50),
    post = text(form, "post_id", 50);
  if (!uuid(id) || !uuid(post)) redirect("/research");
  const { error } = await client
    .from("responses")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);
  if (error) redirect("/research/" + post + "?error=save");
  revalidatePath("/research/" + post);
  redirect("/research/" + post);
}
