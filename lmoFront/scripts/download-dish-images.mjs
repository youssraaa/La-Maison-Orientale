/**
 * Télécharge les photos de plats (Unsplash, licence libre) dans public/images/dishes/.
 * Usage: node scripts/download-dish-images.mjs
 */
import { mkdir, writeFile, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DISHES_DIR = path.join(__dirname, "../public/images/dishes");
const IMAGES_DIR = path.join(__dirname, "../public/images");

const UNSPLASH = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=600&q=85`;

/** Fichier -> URL distante ou chemin local relatif à public/images */
const CATALOG = {
  // Entrées froides
  hommos: UNSPLASH("photo-1697126248437-db26a30024c5"),
  moutabal: UNSPLASH("photo-1626077890529-8a496b245392"),
  "warak-enab": UNSPLASH("photo-1608897019856-a30c380a558b"),
  "salade-fattouche": UNSPLASH("photo-1540189549336-e6e99c3679fe"),
  taboule: UNSPLASH("photo-1512621776951-a57141f2eefd"),
  "salade-russe": UNSPLASH("photo-1621996346565-e3dbc646d9a9"),

  // Entrées chaudes
  "soupe-lentilles": UNSPLASH("photo-1547592166-23ac45744acd"),
  kebbe: UNSPLASH("photo-1606491956689-2a7f724ee6e8"),
  "fatayer-epinards": UNSPLASH("photo-1625944232933-1b4e5d5d7c5a"),
  "fatayer-fromage": UNSPLASH("photo-1565299624946-b28f40a0ae38"),
  falafel: UNSPLASH("photo-1601059889840-532ec958922b"),
  "batata-harra": UNSPLASH("photo-1573080496218-b4207844c210"),
  riz: UNSPLASH("photo-1516684669134-6d309b9aebff"),
  boulgour: UNSPLASH("photo-1585937421612-70a008356fbe"),

  // Sandwichs & shawarmas
  "durum-shawarma": UNSPLASH("photo-1529006557810-274b9b2fc783"),
  "durum-shawarma-frites": UNSPLASH("photo-1565299500777-7900b128c5a7"),
  "durum-pane": UNSPLASH("photo-1626700051175-6818013e2746"),
  "durum-falafel": UNSPLASH("photo-1529008757458-e93567936643"),
  "durum-kefta": UNSPLASH("photo-1529042410759-b054120bf034"),
  "durum-brochette-boeuf": UNSPLASH("photo-1558030006-450675393462"),
  "durum-brochette-agneau": UNSPLASH("photo-1529692236678-f1f6cf9683ba"),
  "durum-brochette-poulet": UNSPLASH("photo-1608030895225-85391d787a06"),
  "sandwich-shawarma": UNSPLASH("photo-1551782450-17144efb9c50"),
  "sandwich-brochette-poulet": UNSPLASH("photo-1527477396000-e27137a04610"),
  "sandwich-brochette-boeuf": UNSPLASH("photo-1555939594-58d7cb561ad1"),
  "sandwich-brochette-agneau": UNSPLASH("photo-1544025162-d766942659677"),
  "sandwich-kefta": UNSPLASH("photo-1594212699903-ecda27e9f9a0"),
  "hamburger-boeuf": UNSPLASH("photo-1568901346735-8664a4040476"),
  "hamburger-poulet": UNSPLASH("photo-1606755962773-d324e166a853"),
  "filet-poulet": UNSPLASH("photo-1626082927389-6a091a0dc1d9"),
  frites: UNSPLASH("photo-1573080496218-b4207844c210"),

  // Assets locaux (photos du restaurant)
  "plat-shawarma": "local:shawarma-board.png",
  "plat-shawarma-arabi": "local:grill-feast.png",
  "shawarma-extra": "local:mixed-grill.png",
  "plat-falafel-arabi": "local:falafel-bowl.png",

  // Plats
  "cotelettes-agneau": "local:lamb-platters.png",
  "kefta-aubergines": "local:kofta-box.png",
  "brochettes-agneau": UNSPLASH("photo-1544025162-d766942659677"),
  "brochettes-boeuf": "local:skewers-prep.png",
  "brochettes-kefta": UNSPLASH("photo-1594212699903-ecda27e9f9a0"),
  "brochettes-poulet": UNSPLASH("photo-1527477396000-e27137a04610"),
  "ailes-poulet": UNSPLASH("photo-1608030895225-85391d787a06"),
  "pilons-poulet": UNSPLASH("photo-1626082927389-6a091a0dc1d9"),
  "brochettes-mixte": "local:mixed-grill.png",
  "grillade-1kg": "local:grill-platter.png",
  "grand-plateau": "local:mezze-platter.png",

  // Sauces
  sauces: UNSPLASH("photo-1472476446867-d7fbf518c7d8"),

  // Boissons chaudes
  espresso: UNSPLASH("photo-1514434788744-10676d2829f2"),
  "cafe-syrien": UNSPLASH("photo-1495474472287-4d71bcdd2085"),
  cafe: UNSPLASH("photo-1509042239860-f550ce710b93"),
  cappuccino: UNSPLASH("photo-1572442383556-681c3d7230f1"),
  "the-menthe": "local:drinks-mint.png",
  "the-noir": UNSPLASH("photo-1556679343-c7306c1976bc"),

  // Soft
  eau: UNSPLASH("photo-1523362625819-17cdcde7502e"),
  coca: UNSPLASH("photo-1622483760728-bb135ace6379"),
  fanta: UNSPLASH("photo-1624517452498-0486928992cc"),
  sprite: UNSPLASH("photo-1625772452277-0431c4a2a9a0"),
  "ice-tea": UNSPLASH("photo-1556679343-c7306c1976bc"),
  "red-bull": UNSPLASH("photo-1622547749225-3e4e4a4e4e4a"),
  ayran: UNSPLASH("photo-1623065423992-1d1b1b1b1b1b"),
  schweppes: UNSPLASH("photo-1625772452277-0431c4a2a9a0"),
  tropical: UNSPLASH("photo-1624517452498-0486928992cc"),
  uludag: UNSPLASH("photo-1625772452277-0431c4a2a9a0"),
  looza: UNSPLASH("photo-1624517452498-0486928992cc"),
};

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadUrl(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "LaMaisonOrientale/1.0 (dish-image-setup)" },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 5000) {
    throw new Error("Fichier trop petit (probablement invalide)");
  }
  return buffer;
}

async function copyLocal(relativePath) {
  const source = path.join(IMAGES_DIR, relativePath.replace(/^local:/, ""));
  if (!(await fileExists(source))) {
    throw new Error(`Asset local introuvable: ${source}`);
  }
  return source;
}

async function main() {
  await mkdir(DISHES_DIR, { recursive: true });

  const results = { ok: [], fail: [] };

  for (const [slug, source] of Object.entries(CATALOG)) {
    const ext = source.startsWith("local:") ? path.extname(source.replace("local:", "")) : ".jpg";
    const dest = path.join(DISHES_DIR, `${slug}${ext}`);

    try {
      if (source.startsWith("local:")) {
        const localPath = await copyLocal(source);
        await copyFile(localPath, dest);
      } else {
        const buffer = await downloadUrl(source);
        await writeFile(dest, buffer);
      }
      results.ok.push(`${slug}${ext}`);
      process.stdout.write(`✓ ${slug}${ext}\n`);
    } catch (error) {
      results.fail.push({ slug, error: error.message });
      process.stderr.write(`✗ ${slug}: ${error.message}\n`);
    }
  }

  console.log(`\nTerminé: ${results.ok.length} OK, ${results.fail.length} échecs`);
  if (results.fail.length) {
    console.log("Échecs:", results.fail);
    process.exitCode = 1;
  }
}

main();
