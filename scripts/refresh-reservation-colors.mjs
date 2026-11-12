import fs from "node:fs";

const path = "lmoFront/src/index.css";
let css = fs.readFileSync(path, "utf8");
const start = css.indexOf("/* ——— Réservation ——— */");
let end = css.indexOf("@media (max-width: 800px) {\r\n  .reservation-stage");
if (end < 0) {
  end = css.indexOf("@media (max-width: 800px) {\n  .reservation-stage");
}
if (start < 0 || end < 0) {
  console.error("markers not found", start, end);
  process.exit(1);
}

const old = css.slice(start, end);
const keepFrom = old.indexOf(".reservation-date-field__btn");
if (keepFrom < 0) {
  console.error("keep marker missing");
  process.exit(1);
}
const kept = old.slice(keepFrom);

const next = `/* ——— Réservation ——— */

.reservation-page {
  --res-burgundy: #b4232e;
  --res-burgundy-deep: #8e1c26;
  --res-gold: #d4a84b;
  --res-pine: #1f6b4a;
  --res-pine-soft: #e8f4ee;
  --res-ink: #1a1a1a;
  --res-muted: #5f6562;
  --res-line: rgba(180, 35, 46, 0.14);
  --res-fill: #f5f7f6;
  --res-surface: #ffffff;
  background:
    radial-gradient(ellipse at 12% 0%, rgba(180, 35, 46, 0.06), transparent 42%),
    radial-gradient(ellipse at 88% 18%, rgba(31, 107, 74, 0.07), transparent 40%),
    linear-gradient(180deg, #f7f8f7 0%, #eef1f0 100%);
}

.reservation-stage {
  position: relative;
  width: min(1200px, 96%);
  margin: -2.5rem auto 3.5rem;
  z-index: 1;
}

.reservation-sheet {
  position: relative;
  z-index: 1;
  width: 100%;
  margin: 0;
  padding: clamp(1.65rem, 3.8vw, 2.75rem) clamp(1.4rem, 4vw, 3.1rem);
  background: var(--res-surface);
  border: 1px solid var(--res-line);
  border-radius: var(--radius);
  box-shadow: 0 18px 48px rgba(20, 24, 22, 0.08);
}

.reservation-sheet .contact-sheet__brand {
  margin-bottom: 1.15rem;
  color: var(--res-burgundy-deep);
}

.reservation-policy {
  margin: 0 0 1.35rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
}

.reservation-policy__tip {
  margin: 0;
  width: 100%;
  padding: 0.95rem 1.15rem;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #24352c;
  background: var(--res-pine-soft);
  border: 1px solid rgba(31, 107, 74, 0.18);
  border-left: 4px solid var(--res-pine);
}

.reservation-policy__tip a {
  color: var(--res-burgundy-deep);
  font-weight: 700;
}

.reservation-policy__actions {
  display: flex;
  justify-content: flex-start;
}

.reservation-policy__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.95rem;
  border: 1px solid var(--res-line);
  background: #fff;
  color: var(--res-burgundy-deep);
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0.45rem;
}

.reservation-policy__toggle span {
  display: grid;
  place-items: center;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(180, 35, 46, 0.28);
  font-size: 0.72rem;
  font-weight: 700;
  font-style: italic;
  color: var(--res-burgundy);
  background: rgba(180, 35, 46, 0.06);
}

.reservation-policy__toggle.is-open span {
  font-style: normal;
}

.reservation-policy__toggle:hover {
  border-color: rgba(180, 35, 46, 0.4);
  background: #fff7f7;
}

.reservation-policy__panel {
  width: 100%;
  padding: 1.15rem 1.25rem;
  background: var(--res-fill);
  border: 1px solid var(--res-line);
  display: grid;
  gap: 0.95rem;
}

.reservation-policy__item h4 {
  margin: 0 0 0.25rem;
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--res-burgundy-deep);
}

.reservation-policy__item p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--res-muted);
}

.reservation-policy__note {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  font-style: italic;
  color: var(--res-muted);
}

.reservation-widget {
  width: 100%;
}

.reservation-steps {
  display: flex;
  justify-content: space-between;
  gap: 0.35rem;
  margin: 0 0 1.75rem;
  padding: 0.9rem 0.8rem;
  list-style: none;
  background: var(--res-fill);
  border: 1px solid var(--res-line);
  border-radius: 0.55rem;
}

.reservation-steps__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
  color: var(--res-muted);
}

.reservation-steps__num {
  width: 2.2rem;
  height: 2.2rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1.5px solid rgba(180, 35, 46, 0.22);
  font-size: 0.85rem;
  font-weight: 700;
  background: #fff;
  color: var(--res-burgundy-deep);
}

.reservation-steps__label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.reservation-steps__item.is-active .reservation-steps__num,
.reservation-steps__item.is-done .reservation-steps__num {
  background: var(--res-burgundy);
  border-color: var(--res-burgundy);
  color: #fff;
  box-shadow: 0 4px 14px rgba(180, 35, 46, 0.28);
}

.reservation-steps__item.is-active .reservation-steps__label {
  color: var(--res-burgundy-deep);
}

.reservation-step__title {
  margin: 0 0 1.35rem;
  font-family: var(--font-display);
  font-size: clamp(1.65rem, 3vw, 2.15rem);
  color: var(--res-burgundy-deep);
}

.reservation-step__lead,
.reservation-step__hint {
  margin: 0 0 1.15rem;
  font-size: 0.95rem;
  color: var(--res-muted);
  line-height: 1.5;
}

.reservation-contact__intro {
  margin: -0.35rem 0 1.1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--res-muted);
}

.reservation-block {
  margin-bottom: 1.65rem;
}

.reservation-block__label {
  margin: 0 0 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-body);
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--res-burgundy-deep);
}

.reservation-block__icon {
  display: grid;
  place-items: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  background: var(--res-pine-soft);
  color: var(--res-pine);
  border: 1px solid rgba(31, 107, 74, 0.18);
  flex-shrink: 0;
}

.reservation-block__label span:last-child {
  color: var(--res-burgundy);
}

.reservation-dates__strip {
  display: flex;
  gap: 0.65rem;
  overflow-x: auto;
  padding: 0.15rem 0.1rem 0.65rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}

.reservation-date-chip {
  flex: 0 0 auto;
  min-width: 4.6rem;
  padding: 0.7rem 0.65rem;
  border: 1.5px solid var(--res-line);
  border-radius: 0.65rem;
  background: #fff;
  color: var(--res-ink);
  font-family: var(--font-body);
  cursor: pointer;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.reservation-date-chip__day {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--res-muted);
}

.reservation-date-chip__num {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.1;
}

.reservation-date-chip__note {
  font-size: 0.65rem;
  color: var(--res-burgundy);
  font-weight: 600;
}

.reservation-date-chip:hover:not(:disabled):not(.is-selected) {
  border-color: rgba(180, 35, 46, 0.35);
  background: #fff7f7;
}

.reservation-date-chip.is-selected {
  border-color: var(--res-burgundy);
  background: var(--res-burgundy);
  color: #fff;
  box-shadow: 0 5px 16px rgba(180, 35, 46, 0.28);
}

.reservation-date-chip.is-selected .reservation-date-chip__day,
.reservation-date-chip.is-selected .reservation-date-chip__note {
  color: rgba(255, 255, 255, 0.85);
}

.reservation-date-chip.is-closed,
.reservation-date-chip:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.reservation-dates__nav {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0.15rem 0 0.85rem;
}

.reservation-dates__arrow {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1px solid var(--res-line);
  background: #fff;
  color: var(--res-burgundy-deep);
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.reservation-dates__arrow:hover {
  border-color: var(--res-pine);
  color: var(--res-pine);
}

.reservation-dates__track {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(180, 35, 46, 0.45), rgba(31, 107, 74, 0.45));
}

.reservation-date-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid var(--res-line);
  border-radius: 0.65rem;
  background: var(--res-fill);
}

.reservation-date-field input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--res-ink);
  outline: none;
}

`;

css = css.slice(0, start) + next + "\n" + kept + css.slice(end);

// Patch remaining brown/gold-heavy reservation selectors
const patches = [
  [
    /\.reservation-cover \{[\s\S]*?\.reservation-cover\.is-selected \{[\s\S]*?\}/,
    null,
  ],
];

// Targeted replacements for leftover warm tones in reservation section
const replacements = [
  [/background: #fffefb;/g, "background: #fff;"],
  [/color: #3a2214;/g, "color: var(--res-ink);"],
  [/color: #8a7058;/g, "color: var(--res-muted);"],
  [/color: #5c301c;/g, "color: var(--res-burgundy-deep);"],
  [/color: #7a6454;/g, "color: var(--res-muted);"],
  [/color: #5a4030;/g, "color: var(--res-muted);"],
  [/border-color: #c4893a;/g, "border-color: var(--res-burgundy);"],
  [
    /background: linear-gradient\(160deg, #ffe08a, #e8b84a\);/g,
    "background: var(--res-burgundy);",
  ],
  [
    /background: linear-gradient\(145deg, #f5df8f, #e0b04a 40%, #b8862e\);/g,
    "background: var(--res-burgundy);",
  ],
  [
    /background: linear-gradient\(145deg, #ffe7a8, var\(--res-gold-soft\)\);/g,
    "background: var(--res-burgundy-deep);",
  ],
  [/color: #2a1810;/g, "color: #fff;"],
  [/box-shadow: 0 8px 22px rgba\(184, 134, 46, 0\.35\);/g, "box-shadow: 0 8px 22px rgba(180, 35, 46, 0.28);"],
  [/box-shadow: 0 6px 18px rgba\(232, 184, 74, 0\.45\);/g, "box-shadow: 0 6px 18px rgba(180, 35, 46, 0.28);"],
  [/border: 1px solid rgba\(212, 168, 75, 0\.45\);/g, "border: 1px solid var(--res-line);"],
  [/border: 1px solid rgba\(212, 168, 75, 0\.35\);/g, "border: 1px solid var(--res-line);"],
  [/border-bottom: 1px solid rgba\(212, 168, 75, 0\.2\);/g, "border-bottom: 1px solid var(--res-line);"],
  [
    /background: linear-gradient\(90deg, rgba\(255, 248, 234, 0\.65\), transparent\);/g,
    "background: var(--res-fill);",
  ],
  [
    /background: linear-gradient\(90deg, rgba\(232, 243, 236, 0\.75\), transparent\);/g,
    "background: #fff;",
  ],
  [/background: #f7f3ec;/g, "background: var(--res-fill);"],
  [/background: #f3f0ea;/g, "background: var(--res-fill);"],
  [/border-bottom: 1\.5px solid rgba\(74, 55, 44, 0\.32\);/g, "border-bottom: 1.5px solid var(--res-line);"],
  [/border: 1px solid rgba\(74, 55, 44, 0\.14\);/g, "border: 1px solid var(--res-line);"],
  [/color: rgba\(74, 55, 44, 0\.42\);/g, "color: rgba(95, 101, 98, 0.55);"],
  [/color: rgba\(74, 55, 44, 0\.62\);/g, "color: var(--res-muted);"],
  [/border-bottom-color: var\(--burgundy(?:, #8b2e3b)?\);/g, "border-bottom-color: var(--res-burgundy);"],
];

for (const [re, to] of replacements) {
  css = css.replace(re, to);
}

// Fix selected slot text colors after burgundy fill
css = css.replace(
  `.reservation-slot.is-selected {
  background: var(--res-burgundy);
  border-color: var(--res-burgundy);
  color: var(--res-burgundy-deep);
  box-shadow: 0 6px 18px rgba(180, 35, 46, 0.28);
}

.reservation-slot.is-selected .reservation-slot__status {
  color: var(--res-burgundy);
}`,
  `.reservation-slot.is-selected {
  background: var(--res-burgundy);
  border-color: var(--res-burgundy);
  color: #fff;
  box-shadow: 0 6px 18px rgba(180, 35, 46, 0.28);
}

.reservation-slot.is-selected .reservation-slot__status {
  color: rgba(255, 255, 255, 0.85);
}`
);

css = css.replace(
  `.reservation-widget__cta,
.reservation-step__actions .btn--accent {
  width: 100%;
  border: none;
  border-radius: 0.55rem;
  background: var(--res-burgundy);
  color: #fff;
  font-weight: 700;
  padding: 0.95rem 1.25rem;
  box-shadow: 0 8px 22px rgba(180, 35, 46, 0.28);
}

.reservation-widget__cta:hover,
.reservation-step__actions .btn--accent:hover {
  background: var(--res-burgundy-deep);
  color: #fff;
}`,
  `.reservation-widget__cta,
.reservation-step__actions .btn--accent {
  width: 100%;
  border: none;
  border-radius: 0.55rem;
  background: var(--res-burgundy);
  color: #fff;
  font-weight: 700;
  padding: 0.95rem 1.25rem;
  box-shadow: 0 8px 22px rgba(180, 35, 46, 0.28);
}

.reservation-widget__cta:hover,
.reservation-step__actions .btn--accent:hover {
  background: var(--res-burgundy-deep);
  color: #fff;
}`
);

css = css.replace(
  `.reservation-step__actions .btn--ghost {
  border: 1px solid var(--res-line);
  border-radius: 0.55rem;
  background: #fff;
  color: var(--res-burgundy-deep);
}`,
  `.reservation-step__actions .btn--ghost {
  border: 1px solid var(--res-line);
  border-radius: 0.55rem;
  background: #fff;
  color: var(--res-burgundy-deep);
}`
);

fs.writeFileSync(path, css);
console.log("Reservation colors updated");
