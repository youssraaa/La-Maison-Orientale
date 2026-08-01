import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PHONE_DIAL_CODES, findDialEntry } from "../utils/phoneDialCodes";

function flagSrc(iso) {
  return `https://flagcdn.com/w40/${String(iso).toLowerCase()}.png`;
}

function FlagImg({ iso, emoji, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={`phone-country__flag-emoji ${className}`} aria-hidden="true">
        {emoji}
      </span>
    );
  }
  return (
    <img
      className={className}
      src={flagSrc(iso)}
      alt=""
      width="22"
      height="16"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function PhoneCountrySelect({ value, onChange, id = "phoneIso" }) {
  const listId = useId();
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = findDialEntry(value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PHONE_DIAL_CODES;
    return PHONE_DIAL_CODES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;

    function onDocClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }

    function onKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => searchRef.current?.focus());

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function selectCountry(iso) {
    onChange(iso);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="phone-country" ref={rootRef}>
      <button
        type="button"
        id={id}
        className={`phone-country__trigger${open ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <FlagImg
          className="phone-country__flag-img"
          iso={selected.iso}
          emoji={selected.flag}
        />
        <span className="phone-country__dial">{selected.dial}</span>
        <span className="phone-country__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="phone-country__panel" role="presentation">
          <input
            ref={searchRef}
            type="search"
            className="phone-country__search"
            placeholder="Rechercher un pays…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher un pays"
          />
          <ul
            id={listId}
            className="phone-country__list"
            role="listbox"
            aria-label="Indicatifs pays"
          >
            {filtered.length === 0 && (
              <li className="phone-country__empty">Aucun pays trouvé</li>
            )}
            {filtered.map((c) => {
              const isSelected = c.iso === selected.iso;
              return (
                <li key={c.iso} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={`phone-country__option${isSelected ? " is-selected" : ""}`}
                    onClick={() => selectCountry(c.iso)}
                  >
                    <span className="phone-country__option-flag">
                      <FlagImg iso={c.iso} emoji={c.flag} />
                    </span>
                    <span className="phone-country__option-name">{c.label}</span>
                    <span className="phone-country__option-code">{c.dial}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PhoneCountrySelect;
