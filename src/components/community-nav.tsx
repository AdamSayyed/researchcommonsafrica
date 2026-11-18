import Link from "next/link";
import { requireMember } from "@/lib/member";
import { redirect } from "next/navigation";
async function signOut() {
  "use server";
  const { client } = await requireMember();
  await client.auth.signOut();
  redirect("/");
}
export default function CommunityNav() {
  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/members">
          <img src="/foundation-logo.png" alt="" />
          <span>
            Research Commons<small>AFRICA</small>
          </span>
        </Link>
        <form action={signOut}>
          <button className="quiet">Sign out</button>
        </form>
      </header>
      <nav className="tabs" aria-label="Community navigation">
        <Link href="/members">Community</Link>
        <Link href="/research">Research board</Link>
        <Link href="/mentorship">Mentorship</Link>
        <Link href="/map">Member map</Link>
        <Link href="/notifications">Notifications</Link>
        <Link href="/profile">My profile</Link>
      </nav>
    </>
  );
}
