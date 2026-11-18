"use client";
import { useFormStatus } from "react-dom";
export default function Submit({
  children,
  confirm,
}: {
  children: React.ReactNode;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
