import { menuCategories } from "../src/features/menu/data/menuData.js";
import { getDishImage } from "../src/features/order/utils/dishImages.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dishesDir = path.join(__dirname, "../public/images/dishes");

const items = [];
for (const cat of menuCategories) {
  const collect = (list) => list?.forEach((item) => items.push({ name: item.name, category: cat }));
  collect(cat.items);
  cat.subsections?.forEach((s) => collect(s.items));
}

const seen = new Set();
const unique = items.filter((i) => {
  if (seen.has(i.name)) return false;
  seen.add(i.name);
  return true;
});

const FALLBACKS = new Set([
  "entree-froide.jpg",
  "entree-chaude.jpg",
  "shawarma.jpg",
  "sauces.jpg",
  "grill-plat.jpg",
  "cafe-hot.jpg",
  "boisson.jpg",
]);

let mapped = 0;
let fallback = 0;
let missingFile = 0;
const problems = [];

for (const { name, category } of unique) {
  const img = getDishImage({ name }, category);
  if (!img) {
    problems.push({ name, issue: "no image returned" });
    continue;
  }

  const rel = img.replace("/images/dishes/", "");
  const filePath = path.join(dishesDir, rel);

  if (!img.startsWith("/images/dishes/")) {
    fallback++;
    problems.push({ name, img, issue: "category gallery fallback" });
  } else if (!fs.existsSync(filePath)) {
    missingFile++;
    problems.push({ name, img, issue: "file missing" });
  } else if (FALLBACKS.has(rel)) {
    fallback++;
    problems.push({ name, img, issue: "category fallback image" });
  } else {
    mapped++;
  }
}

const js = fs.readFileSync(path.join(__dirname, "../src/features/order/utils/dishImages.js"), "utf8");
const refs = [...new Set([...js.matchAll(/\$\{BASE\}\/([^`"]+)/g)].map((m) => m[1]))];
const missingRefs = refs.filter((r) => !fs.existsSync(path.join(dishesDir, r)));

console.log(JSON.stringify({
  totalMenuItems: unique.length,
  mappedDedicated: mapped,
  fallback,
  missingFile,
  referencedFiles: refs.length,
  missingReferencedFiles: missingRefs.length,
  missingRefs,
  problems,
}, null, 2));
