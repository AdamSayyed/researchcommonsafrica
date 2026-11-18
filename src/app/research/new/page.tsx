import { community } from "@/lib/community";
import CommunityNav from "@/components/community-nav";
import PostForm from "@/components/post-form";
export default async function NewPost() {
  const { profile } = await community();
  return (
    <main>
      <CommunityNav />
      <p className="eyebrow">START A CONVERSATION</p>
      <h1>What are you working on?</h1>
      <PostForm post={{ field: profile.field }} />
    </main>
  );
}
