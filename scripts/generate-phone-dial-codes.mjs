import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const raw = `AD|+376|Andorre
AE|+971|Émirats arabes unis
AF|+93|Afghanistan
AG|+1|Antigua-et-Barbuda
AI|+1|Anguilla
AL|+355|Albanie
AM|+374|Arménie
AO|+244|Angola
AQ|+672|Antarctique
AR|+54|Argentine
AS|+1|Samoa américaines
AT|+43|Autriche
AU|+61|Australie
AW|+297|Aruba
AX|+358|Îles Åland
AZ|+994|Azerbaïdjan
BA|+387|Bosnie-Herzégovine
BB|+1|Barbade
BD|+880|Bangladesh
BE|+32|Belgique
BF|+226|Burkina Faso
BG|+359|Bulgarie
BH|+973|Bahreïn
BI|+257|Burundi
BJ|+229|Bénin
BL|+590|Saint-Barthélemy
BM|+1|Bermudes
BN|+673|Brunei
BO|+591|Bolivie
BQ|+599|Pays-Bas caribéens
BR|+55|Brésil
BS|+1|Bahamas
BT|+975|Bhoutan
BW|+267|Botswana
BY|+375|Biélorussie
BZ|+501|Belize
CA|+1|Canada
CC|+61|Îles Cocos
CD|+243|RD Congo
CF|+236|Centrafrique
CG|+242|Congo
CH|+41|Suisse
CI|+225|Côte d'Ivoire
CK|+682|Îles Cook
CL|+56|Chili
CM|+237|Cameroun
CN|+86|Chine
CO|+57|Colombie
CR|+506|Costa Rica
CU|+53|Cuba
CV|+238|Cap-Vert
CW|+599|Curaçao
CX|+61|Île Christmas
CY|+357|Chypre
CZ|+420|Tchéquie
DE|+49|Allemagne
DJ|+253|Djibouti
DK|+45|Danemark
DM|+1|Dominique
DO|+1|République dominicaine
DZ|+213|Algérie
EC|+593|Équateur
EE|+372|Estonie
EG|+20|Égypte
EH|+212|Sahara occidental
ER|+291|Érythrée
ES|+34|Espagne
ET|+251|Éthiopie
FI|+358|Finlande
FJ|+679|Fidji
FK|+500|Malouines
FM|+691|Micronésie
FO|+298|Îles Féroé
FR|+33|France
GA|+241|Gabon
GB|+44|Royaume-Uni
GD|+1|Grenade
GE|+995|Géorgie
GF|+594|Guyane française
GG|+44|Guernesey
GH|+233|Ghana
GI|+350|Gibraltar
GL|+299|Groenland
GM|+220|Gambie
GN|+224|Guinée
GP|+590|Guadeloupe
GQ|+240|Guinée équatoriale
GR|+30|Grèce
GT|+502|Guatemala
GU|+1|Guam
GW|+245|Guinée-Bissau
GY|+592|Guyana
HK|+852|Hong Kong
HN|+504|Honduras
HR|+385|Croatie
HT|+509|Haïti
HU|+36|Hongrie
ID|+62|Indonésie
IE|+353|Irlande
IL|+972|Israël
IM|+44|Île de Man
IN|+91|Inde
IO|+246|Territoire britannique de l'océan Indien
IQ|+964|Irak
IR|+98|Iran
IS|+354|Islande
IT|+39|Italie
JE|+44|Jersey
JM|+1|Jamaïque
JO|+962|Jordanie
JP|+81|Japon
KE|+254|Kenya
KG|+996|Kirghizistan
KH|+855|Cambodge
KI|+686|Kiribati
KM|+269|Comores
KN|+1|Saint-Kitts-et-Nevis
KP|+850|Corée du Nord
KR|+82|Corée du Sud
KW|+965|Koweït
KY|+1|Îles Caïmans
KZ|+7|Kazakhstan
LA|+856|Laos
LB|+961|Liban
LC|+1|Sainte-Lucie
LI|+423|Liechtenstein
LK|+94|Sri Lanka
LR|+231|Liberia
LS|+266|Lesotho
LT|+370|Lituanie
LU|+352|Luxembourg
LV|+371|Lettonie
LY|+218|Libye
MA|+212|Maroc
MC|+377|Monaco
MD|+373|Moldavie
ME|+382|Monténégro
MF|+590|Saint-Martin
MG|+261|Madagascar
MH|+692|Îles Marshall
MK|+389|Macédoine du Nord
ML|+223|Mali
MM|+95|Myanmar
MN|+976|Mongolie
MO|+853|Macao
MP|+1|Mariannes du Nord
MQ|+596|Martinique
MR|+222|Mauritanie
MS|+1|Montserrat
MT|+356|Malte
MU|+230|Maurice
MV|+960|Maldives
MW|+265|Malawi
MX|+52|Mexique
MY|+60|Malaisie
MZ|+258|Mozambique
NA|+264|Namibie
NC|+687|Nouvelle-Calédonie
NE|+227|Niger
NF|+672|Île Norfolk
NG|+234|Nigeria
NI|+505|Nicaragua
NL|+31|Pays-Bas
NO|+47|Norvège
NP|+977|Népal
NR|+674|Nauru
NU|+683|Niue
NZ|+64|Nouvelle-Zélande
OM|+968|Oman
PA|+507|Panama
PE|+51|Pérou
PF|+689|Polynésie française
PG|+675|Papouasie-Nouvelle-Guinée
PH|+63|Philippines
PK|+92|Pakistan
PL|+48|Pologne
PM|+508|Saint-Pierre-et-Miquelon
PR|+1|Porto Rico
PS|+970|Palestine
PT|+351|Portugal
PW|+680|Palaos
PY|+595|Paraguay
QA|+974|Qatar
RE|+262|La Réunion
RO|+40|Roumanie
RS|+381|Serbie
RU|+7|Russie
RW|+250|Rwanda
SA|+966|Arabie saoudite
SB|+677|Îles Salomon
SC|+248|Seychelles
SD|+249|Soudan
SE|+46|Suède
SG|+65|Singapour
SH|+290|Sainte-Hélène
SI|+386|Slovénie
SJ|+47|Svalbard et Jan Mayen
SK|+421|Slovaquie
SL|+232|Sierra Leone
SM|+378|Saint-Marin
SN|+221|Sénégal
SO|+252|Somalie
SR|+597|Suriname
SS|+211|Soudan du Sud
ST|+239|Sao Tomé-et-Principe
SV|+503|Salvador
SX|+1|Saint-Martin (NL)
SY|+963|Syrie
SZ|+268|Eswatini
TC|+1|Îles Turques-et-Caïques
TD|+235|Tchad
TG|+228|Togo
TH|+66|Thaïlande
TJ|+992|Tadjikistan
TK|+690|Tokelau
TL|+670|Timor oriental
TM|+993|Turkménistan
TN|+216|Tunisie
TO|+676|Tonga
TR|+90|Turquie
TT|+1|Trinité-et-Tobago
TV|+688|Tuvalu
TW|+886|Taïwan
TZ|+255|Tanzanie
UA|+380|Ukraine
UG|+256|Ouganda
US|+1|États-Unis
UY|+598|Uruguay
UZ|+998|Ouzbékistan
VA|+39|Vatican
VC|+1|Saint-Vincent-et-les-Grenadines
VE|+58|Venezuela
VG|+1|Îles Vierges britanniques
VI|+1|Îles Vierges américaines
VN|+84|Viêt Nam
VU|+678|Vanuatu
WF|+681|Wallis-et-Futuna
WS|+685|Samoa
XK|+383|Kosovo
YE|+967|Yémen
YT|+262|Mayotte
ZA|+27|Afrique du Sud
ZM|+260|Zambie
ZW|+263|Zimbabwe`;

function flagEmoji(iso) {
  return [...iso.toUpperCase()]
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

const items = raw
  .trim()
  .split(/\n/)
  .map((line) => {
    const [iso, dial, label] = line.split("|");
    return { iso, dial, label, flag: flagEmoji(iso) };
  });

items.sort((a, b) =>
  a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
);

const out = `/** Indicatifs téléphoniques mondiaux (ISO) + drapeaux emoji. */
export const DEFAULT_PHONE_DIAL = "+32";
export const DEFAULT_PHONE_ISO = "BE";

export const PHONE_DIAL_CODES = ${JSON.stringify(items, null, 2)};

export function findDialEntry(isoOrDial) {
  return (
    PHONE_DIAL_CODES.find((c) => c.iso === isoOrDial) ||
    PHONE_DIAL_CODES.find((c) => c.dial === isoOrDial) ||
    PHONE_DIAL_CODES.find((c) => c.iso === "BE")
  );
}

export function flagEmojiFromIso(iso) {
  if (!iso || iso.length !== 2) return "";
  return [...iso.toUpperCase()]
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}
`;

const target = path.join(
  __dirname,
  "../lmoFront/src/features/reservation/utils/phoneDialCodes.js"
);
fs.writeFileSync(target, out, "utf8");
console.log("wrote", items.length, "entries to", target);
