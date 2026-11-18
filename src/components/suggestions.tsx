"use client";
import { useId, useState } from "react";
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export default function Suggestions({
  name,
  label,
  options,
  initial = "",
  multiple = false,
  required = false,
  maxLength = 160,
}: {
  name: string;
  label: string;
  options: string[];
  initial?: string;
  multiple?: boolean;
  required?: boolean;
  maxLength?: number;
}) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const pieces = value.split(",");
  const query = multiple ? pieces[pieces.length - 1].trim() : value;
  const chosen = multiple
    ? pieces.slice(0, -1).map((s) => normalize(s.trim()))
    : [];
  const matches = options
    .filter(
      (o) =>
        normalize(o).includes(normalize(query)) &&
        !chosen.includes(normalize(o)),
    )
    .slice(0, 10);
  function choose(option: string) {
    const next = multiple
      ? [
          ...pieces
            .slice(0, -1)
            .map((s) => s.trim())
            .filter(Boolean),
          option,
        ].join(", ")
      : option;
    if (next.length <= maxLength) setValue(next);
    setOpen(false);
    setActive(-1);
  }
  return (
    <div className="suggestions">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        value={value}
        required={required}
        maxLength={maxLength}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={id + "-options"}
        aria-activedescendant={
          open && active >= 0 ? id + "-option-" + active : undefined
        }
        aria-describedby={id + "-hint"}
        placeholder={
          multiple
            ? "Choose an interest, then type a comma to add another"
            : "Start typing a city or country"
        }
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setActive(-1);
        }}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setActive(-1);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.max(0, i - 1));
          } else if (
            e.key === "Enter" &&
            open &&
            active >= 0 &&
            matches[active]
          ) {
            e.preventDefault();
            choose(matches[active]);
          }
        }}
      />
      {open && (
        <div className="suggestion-menu">
          <ul
            id={id + "-options"}
            role="listbox"
            aria-label={label + " suggestions"}
          >
            {matches.map((option, index) => (
              <li
                role="option"
                id={id + "-option-" + index}
                aria-selected={index === active}
                key={option}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(option)}
              >
                {option}
              </li>
            ))}
          </ul>
          {!matches.length && (
            <p>No suggestions. You can keep your own entry.</p>
          )}
        </div>
      )}
      <p className="hint" id={id + "-hint"}>
        {multiple
          ? "Select common interests or enter your own, separated by commas."
          : "Select a suggested city, or enter any city and country."}
      </p>
    </div>
  );
}
