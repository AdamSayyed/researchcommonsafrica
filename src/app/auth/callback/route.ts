import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = process.env.APP_URL;
  if (!origin) throw new Error("APP_URL must be configured");
  const failure = (reason: string) =>
    NextResponse.redirect(new URL("/sign-in?error=" + reason, origin));
  if (params.has("error"))
    return failure(
      params.get("error") === "access_denied" ? "cancelled" : "google",
    );
  const code = params.get("code");
  if (!code) return failure("google");
  const client = await supabase();
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Auth code exchange failed", {
      code: error.code,
      status: error.status,
    });
    return failure("google");
  }
  return NextResponse.redirect(new URL("/members", origin));
}
