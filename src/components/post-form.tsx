import { savePost } from "@/app/research/actions";
import Submit from "./submit";
type Post = {
  id?: string;
  title?: string;
  body?: string;
  field?: string;
  kind?: string;
  availability?: string;
};
export default function PostForm({ post = {} }: { post?: Post }) {
  return (
    <form action={savePost} className="wide-form">
      <input type="hidden" name="id" value={post.id || ""} />
      <div className="form-row">
        <label>
          Looking for
          <select name="kind" defaultValue={post.kind || "Question"}>
            <option>Question</option>
            <option>Project</option>
            <option>Mentorship</option>
          </select>
        </label>
        <label>
          Research field
          <input
            name="field"
            required
            maxLength={120}
            defaultValue={post.field}
            placeholder="e.g. Public health"
          />
        </label>
      </div>
      <label>
        Title
        <input
          name="title"
          required
          minLength={5}
          maxLength={160}
          defaultValue={post.title}
          placeholder="What would you like to explore together?"
        />
      </label>
      <label>
        Research question or project
        <textarea
          name="body"
          required
          minLength={20}
          maxLength={10000}
          rows={8}
          defaultValue={post.body}
          placeholder="Share the context, what you have tried, and the support you need."
        />
      </label>
      <label>
        Availability or next steps (optional)
        <input
          name="availability"
          maxLength={500}
          defaultValue={post.availability}
          placeholder="e.g. Tuesdays 14:00–16:00 EAT"
        />
      </label>
      <p className="hint">
        Visible to verified members. Share only research you have permission to
        disclose.
      </p>
      <Submit>{post.id ? "Save changes" : "Publish to the community"}</Submit>
    </form>
  );
}
