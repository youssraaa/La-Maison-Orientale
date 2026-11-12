const fs = require("fs");
const path = require("path");

const filePath = path.join("lmoFront", "src", "index.css");
let content = fs.readFileSync(filePath, "utf8");

const marker = "/* ——— Réservation ——— */";
const markerIdx = content.indexOf(marker);
if (markerIdx === -1) {
  console.error("Marker not found:", marker);
  process.exit(1);
}

let before = content.slice(0, markerIdx);
let after = content.slice(markerIdx);

// 1. :root tokens in before (explicit)
before = before.replace(
  /--burgundy:\s*#[0-9a-fA-F]{6}/,
  "--burgundy: #b4232e"
);
before = before.replace(
  /--burgundy-deep:\s*#[0-9a-fA-F]{6}/,
  "--burgundy-deep: #7a1520"
);
before = before.replace(
  /--burgundy-soft:\s*#[0-9a-fA-F]{6}/,
  "--burgundy-soft: #d64550"
);

// 3. BEFORE part replacements
const beforeReplacements = [
  [/#9e1b2a/gi, "#b4232e"],
  [/#6e121c/gi, "#7a1520"],
  [/#b82d38/gi, "#d64550"],
  [/rgba\(158,\s*27,\s*42/g, "rgba(180, 35, 46"],
  [/rgba\(110,\s*18,\s*28/g, "rgba(122, 21, 32"],
];

for (const [re, rep] of beforeReplacements) {
  before = before.replace(re, rep);
}

// 4. AFTER (reservation): hardcode --res-burgundy tokens only
after = after.replace(
  /--res-burgundy:\s*[^;]+;/,
  "--res-burgundy: #9e1b2a;"
);
after = after.replace(
  /--res-burgundy-deep:\s*[^;]+;/,
  "--res-burgundy-deep: #6e121c;"
);

const result = before + after;
fs.writeFileSync(filePath, result, "utf8");

function count(str, sub) {
  let n = 0;
  let i = 0;
  while ((i = str.indexOf(sub, i)) !== -1) {
    n++;
    i += sub.length;
  }
  return n;
}

console.log("Wrote", filePath);
console.log(":root burgundy", /:root[\s\S]*?--burgundy:\s*(#[0-9a-fA-F]{6})/.exec(result)?.[1]);
const rootBlock = result.slice(0, result.indexOf("}"));
console.log("root deep", rootBlock.match(/--burgundy-deep:\s*(#[0-9a-fA-F]{6})/)?.[1]);
console.log("root soft", rootBlock.match(/--burgundy-soft:\s*(#[0-9a-fA-F]{6})/)?.[1]);
const resMatch = result.match(/\.reservation-page\s*\{[^}]*--res-burgundy:\s*(#[0-9a-fA-F]{6}|var\([^)]+\))/);
console.log("res-burgundy", resMatch?.[1]);
const resDeep = result.match(/\.reservation-page\s*\{[^}]*--res-burgundy-deep:\s*(#[0-9a-fA-F]{6}|var\([^)]+\))/);
console.log("res-burgundy-deep", resDeep?.[1]);
console.log("#9e1b2a total", count(result, "#9e1b2a"));
console.log("#b4232e total", count(result, "#b4232e"));
console.log("before rgba158", count(before, "rgba(158, 27, 42"));
console.log("after rgba158", count(after, "rgba(158, 27, 42"));
