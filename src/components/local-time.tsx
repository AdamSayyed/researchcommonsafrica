"use client";
import { useEffect, useState } from "react";
export default function LocalTime({ value }: { value: string }) {
  const [label, setLabel] = useState(
    value.slice(0, 16).replace("T", " ") + " UTC",
  );
  useEffect(
    () =>
      setLabel(
        new Date(value).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }) +
          " (" +
          Intl.DateTimeFormat().resolvedOptions().timeZone +
          ")",
      ),
    [value],
  );
  return <time dateTime={value}>{label}</time>;
}
