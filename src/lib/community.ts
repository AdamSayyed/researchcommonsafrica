import "server-only";
import { requireMember } from "./member";
import { redirect } from "next/navigation";
export async function community() {
  const ctx = await requireMember();
  const { data: profile, error } = await ctx.client
    .from("profiles")
    .select("*")
    .eq("id", ctx.user.id)
    .maybeSingle();
  if (error) throw new Error("Unable to load profile");
  if (!profile) redirect("/profile");
  return { ...ctx, profile };
}
export const slotColumns =
  "id,mentor_id,starts_at,ends_at,topic,booked_by,cancelled,created_at";
export function text(form: FormData, key: string, max: number) {
  return String(form.get(key) || "")
    .trim()
    .slice(0, max);
}
export function uuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
export function https(value: string) {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
