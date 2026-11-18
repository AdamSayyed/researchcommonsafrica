"use client";
import { useFormStatus } from "react-dom";
export default function SignInSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Connecting to Google…" : "Continue with Google"}
    </button>
  );
}
