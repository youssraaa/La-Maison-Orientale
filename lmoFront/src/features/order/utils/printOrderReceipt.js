import { restaurantInfo } from "../../../common/data/restaurantInfo";
import { getPaymentMethodLabel } from "./paymentMethods";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(value) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDateLong(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-BE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

function modeLabel(mode) {
  return mode === "LIVRAISON" ? "Livraison" : "Emporter";
}

function statutLabel(statut) {
  const labels = {
    CONFIRMEE: "Confirmée",
    EN_ATTENTE: "En attente",
    EN_PREPARATION: "En préparation",
    PRETE: "Prête",
    REMIS: "Remise",
    EN_LIVRAISON: "En livraison",
    LIVREE: "Livrée",
    RETIREE: "Retirée",
    ANNULEE: "Annulée",
  };
  return labels[statut] || statut || "—";
}

function computeTotals(commande) {
  const lignes = commande.lignes || [];
  const subtotal = lignes.reduce((sum, line) => sum + Number(line.sousTotal || 0), 0);
  const total = Number(commande.total || 0);
  const isDelivery = commande.mode === "LIVRAISON";
  const deliveryFee = isDelivery && total > subtotal ? total - subtotal : 0;

  return { subtotal, deliveryFee, total, isDelivery };
}

function buildReceiptHtml(commande) {
  const { subtotal, deliveryFee, total, isDelivery } = computeTotals(commande);
  const logoUrl = `${window.location.origin}/images/logo-footer.png`;
  const linesHtml = (commande.lignes || [])
    .map(
      (line) => `
        <tr>
          <td class="receipt__desc">
            <strong>${escapeHtml(line.nom)}</strong>
            <span>${line.quantite} article${line.quantite > 1 ? "s" : ""}</span>
          </td>
          <td class="receipt__num">${formatMoney(line.prixUnitaire)}</td>
          <td class="receipt__num receipt__amount">${formatMoney(line.sousTotal)}</td>
        </tr>`
    )
    .join("");

  const addressBlock = commande.adresseLivraison
    ? `<div class="receipt__info-card">
        <span class="receipt__info-label">Adresse de livraison</span>
        <strong>${escapeHtml(commande.adresseLivraison)}</strong>
      </div>`
    : `<div class="receipt__info-card">
        <span class="receipt__info-label">Retrait</span>
        <strong>${escapeHtml(restaurantInfo.address.full)}</strong>
      </div>`;

  const commentBlock = commande.commentaire
    ? `<section class="receipt__note">
        <h3>Note</h3>
        <p>${escapeHtml(commande.commentaire).replace(/\n/g, "<br/>")}</p>
      </section>`
    : "";

  const deliveryRow =
    deliveryFee > 0
      ? `<div class="receipt__total-row">
          <span>Frais de livraison</span>
          <strong>${formatMoney(deliveryFee)}</strong>
        </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Reçu ${escapeHtml(commande.reference)} — ${escapeHtml(restaurantInfo.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
  />
  <style>
    :root {
      --burgundy: #5c121c;
      --burgundy-dark: #3a0c10;
      --burgundy-soft: #9e1b2a;
      --gold: #d4a84b;
      --gold-dark: #9a6b12;
      --cream: #fffdf9;
      --ink: #2a1818;
      --muted: #6b5348;
      --line: rgba(92, 18, 28, 0.14);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 2rem 1.5rem 2.5rem;
      font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif;
      color: var(--burgundy-dark);
      background: linear-gradient(180deg, #f3ece4 0%, #ebe2d8 100%);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .receipt {
      max-width: 820px;
      margin: 0 auto;
      background: #fff;
      border: 2px solid rgba(92, 18, 28, 0.22);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 18px 40px rgba(58, 12, 16, 0.16);
    }

    .receipt__toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      justify-content: center;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, #5c121c 0%, #3a0c10 100%);
      border-bottom: 2px solid rgba(212, 168, 75, 0.45);
    }

    .receipt__toolbar button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.7rem 1.15rem;
      border-radius: 999px;
      font-family: "Plus Jakarta Sans", sans-serif;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: filter 0.15s ease, transform 0.15s ease;
    }

    .receipt__toolbar button:hover {
      filter: brightness(1.05);
    }

    .receipt__toolbar button.primary {
      border: 1px solid rgba(212, 168, 75, 0.65);
      background: linear-gradient(145deg, #e8c56a, #d4a84b);
      color: var(--burgundy-dark);
    }

    .receipt__toolbar button.download {
      border: 1px solid rgba(255, 248, 239, 0.35);
      background: rgba(255, 248, 239, 0.12);
      color: #fff8ef;
    }

    .receipt__toolbar button.secondary {
      border: 1px solid rgba(255, 248, 239, 0.28);
      background: transparent;
      color: rgba(255, 248, 239, 0.92);
    }

    .receipt__body {
      padding: 1.75rem 2rem 2rem;
      background: linear-gradient(180deg, #fffdf9 0%, #fff 100%);
    }

    .receipt__head {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      align-items: flex-start;
      padding: 1rem 1.1rem 1.15rem;
      margin-bottom: 1rem;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(92, 18, 28, 0.06) 0%, rgba(212, 168, 75, 0.08) 100%);
      border: 1px solid rgba(92, 18, 28, 0.12);
      border-bottom: 3px solid var(--burgundy);
    }

    .receipt__brand {
      display: flex;
      gap: 1rem;
      align-items: center;
      min-width: 0;
    }

    .receipt__logo {
      width: 88px;
      height: 88px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .receipt__brand-text h1 {
      margin: 0 0 0.2rem;
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 1.55rem;
      font-weight: 700;
      color: var(--burgundy-dark);
      line-height: 1.15;
      letter-spacing: 0.02em;
    }

    .receipt__brand-text p {
      margin: 0;
      font-size: 0.82rem;
      color: var(--burgundy);
      line-height: 1.45;
      font-weight: 500;
    }

    .receipt__title-block {
      text-align: right;
      flex-shrink: 0;
    }

    .receipt__title-block h2 {
      margin: 0;
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 2.35rem;
      font-weight: 700;
      color: var(--burgundy);
      letter-spacing: 0.03em;
    }

    .receipt__title-block p {
      margin: 0.35rem 0 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--burgundy-dark);
    }

    .receipt__meta-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin: 0 0 1rem;
      padding: 0.75rem 0.9rem;
      border-radius: 8px;
      background: rgba(92, 18, 28, 0.05);
      border: 1px solid rgba(92, 18, 28, 0.1);
      font-size: 0.92rem;
      font-weight: 600;
    }

    .receipt__meta-row strong { color: var(--burgundy); }

    .receipt__grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .receipt__info-card {
      padding: 0.8rem 0.85rem;
      background: linear-gradient(180deg, rgba(92, 18, 28, 0.04) 0%, #fff 100%);
      border: 1px solid rgba(92, 18, 28, 0.14);
      border-left: 3px solid var(--burgundy);
      border-radius: 8px;
      min-height: 100%;
    }

    .receipt__info-label {
      display: block;
      margin-bottom: 0.35rem;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--burgundy-soft);
    }

    .receipt__info-card strong,
    .receipt__info-card span {
      display: block;
      font-size: 0.84rem;
      line-height: 1.45;
      color: var(--burgundy-dark);
    }

    .receipt__table-wrap {
      border: 1px solid rgba(92, 18, 28, 0.16);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead th {
      padding: 0.75rem 0.9rem;
      background: linear-gradient(180deg, #5c121c 0%, #3a0c10 100%);
      border-bottom: 2px solid rgba(212, 168, 75, 0.55);
      text-align: left;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #fff8ef;
    }

    thead th:nth-child(2),
    thead th:nth-child(3) { text-align: right; width: 120px; }

    tbody td {
      padding: 0.8rem 0.9rem;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
      font-size: 0.9rem;
    }

    tbody tr:last-child td { border-bottom: none; }

    .receipt__desc strong {
      display: block;
      margin-bottom: 0.15rem;
      color: var(--burgundy-dark);
      font-weight: 800;
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 1.02rem;
    }

    .receipt__desc span {
      font-size: 0.78rem;
      color: var(--muted);
    }

    .receipt__num {
      text-align: right;
      white-space: nowrap;
      color: var(--ink);
      font-weight: 600;
    }

    .receipt__amount {
      color: var(--burgundy-dark);
      font-weight: 800;
    }

    .receipt__totals {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }

    .receipt__totals-box {
      width: min(100%, 320px);
      padding: 0.85rem 1rem;
      background: linear-gradient(180deg, rgba(92, 18, 28, 0.05), #fff);
      border: 1px solid rgba(92, 18, 28, 0.18);
      border-radius: 8px;
    }

    .receipt__total-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.35rem 0;
      font-size: 0.9rem;
      color: var(--muted);
    }

    .receipt__total-row strong {
      color: var(--burgundy-dark);
      font-weight: 700;
    }

    .receipt__total-row--grand {
      margin-top: 0.45rem;
      padding-top: 0.65rem;
      border-top: 2px solid var(--burgundy);
      font-size: 1rem;
      color: var(--burgundy-dark);
      font-weight: 800;
    }

    .receipt__total-row--grand strong {
      font-size: 1.15rem;
      color: var(--burgundy-soft);
    }

    .receipt__note {
      margin: 1.25rem 0 0;
      padding: 0.85rem 1rem;
      border-left: 4px solid var(--burgundy);
      background: rgba(92, 18, 28, 0.05);
      border-radius: 0 8px 8px 0;
    }

    .receipt__note h3 {
      margin: 0 0 0.35rem;
      font-size: 0.78rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--burgundy-soft);
      font-weight: 800;
    }

    .receipt__note p {
      margin: 0;
      font-size: 0.86rem;
      line-height: 1.5;
      color: var(--burgundy-dark);
    }

    .receipt__footer {
      margin-top: 1.5rem;
      padding: 1rem 0.75rem 0;
      border-top: 2px solid rgba(92, 18, 28, 0.14);
      text-align: center;
    }

    .receipt__footer p {
      margin: 0.25rem 0;
      font-size: 0.84rem;
      line-height: 1.5;
      color: var(--burgundy);
      font-weight: 500;
    }

    .receipt__footer strong {
      color: var(--burgundy-dark);
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 1.05rem;
    }

    .receipt__disclaimer {
      margin-top: 1rem;
      font-size: 0.76rem;
      font-style: italic;
      color: rgba(92, 18, 28, 0.65);
    }

    @media (max-width: 720px) {
      .receipt__head { flex-direction: column; }
      .receipt__title-block { text-align: left; }
      .receipt__grid { grid-template-columns: 1fr 1fr; }
      .receipt__body { padding: 1.25rem; }
    }

    @media print {
      body {
        padding: 0;
        background: #fff;
      }

      .receipt {
        max-width: none;
        border: none;
        box-shadow: none;
        border-radius: 0;
      }

      .receipt__toolbar { display: none !important; }
      .receipt__body { padding: 0.5rem 0; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="receipt__toolbar no-print">
      <button type="button" class="primary" onclick="window.print()">Imprimer</button>
      <button type="button" class="download" onclick="downloadReceipt()">Télécharger</button>
      <button type="button" class="secondary" onclick="window.close()">Fermer</button>
    </div>

    <div class="receipt__body">
      <header class="receipt__head">
        <div class="receipt__brand">
          <img class="receipt__logo" src="${logoUrl}" alt="${escapeHtml(restaurantInfo.name)}"/>
          <div class="receipt__brand-text">
            <h1>${escapeHtml(restaurantInfo.name)}</h1>
            <p>${escapeHtml(restaurantInfo.tagline)}<br/>${escapeHtml(restaurantInfo.address.full)}</p>
          </div>
        </div>
        <div class="receipt__title-block">
          <h2>Reçu</h2>
          <p>N° ${escapeHtml(commande.reference)}</p>
        </div>
      </header>

      <div class="receipt__meta-row">
        <div><strong>Client :</strong> ${escapeHtml(commande.nomClient || "—")}</div>
        <div><strong>Date commande :</strong> ${escapeHtml(formatDate(commande.createdAt))}</div>
      </div>

      <div class="receipt__grid">
        <div class="receipt__info-card">
          <span class="receipt__info-label">Restaurant</span>
          <strong>${escapeHtml(restaurantInfo.name)}</strong>
          <span>${escapeHtml(restaurantInfo.address.full)}</span>
          <span>${escapeHtml(restaurantInfo.phone.display)}</span>
          <span>${escapeHtml(restaurantInfo.email.display)}</span>
        </div>
        <div class="receipt__info-card">
          <span class="receipt__info-label">Mode</span>
          <strong>${escapeHtml(modeLabel(commande.mode))}</strong>
          <span>Statut : ${escapeHtml(statutLabel(commande.statut))}</span>
        </div>
        ${addressBlock}
        <div class="receipt__info-card">
          <span class="receipt__info-label">Paiement</span>
          <strong>${escapeHtml(getPaymentMethodLabel(commande.modePaiement))}</strong>
          <span>Réf. ${escapeHtml(commande.reference)}</span>
        </div>
      </div>

      <div class="receipt__table-wrap">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Tarif unitaire</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            ${linesHtml}
          </tbody>
        </table>
      </div>

      <div class="receipt__totals">
        <div class="receipt__totals-box">
          <div class="receipt__total-row">
            <span>Sous-total</span>
            <strong>${formatMoney(subtotal)}</strong>
          </div>
          ${deliveryRow}
          <div class="receipt__total-row receipt__total-row--grand">
            <span>Total TTC</span>
            <strong>${formatMoney(total)}</strong>
          </div>
        </div>
      </div>

      ${commentBlock}

      <footer class="receipt__footer">
        <p><strong>${escapeHtml(restaurantInfo.name)}</strong></p>
        <p>${escapeHtml(restaurantInfo.address.full)} · ${escapeHtml(restaurantInfo.phone.display)} · ${escapeHtml(restaurantInfo.email.display)}</p>
        <p>Merci pour votre confiance. Pour toute modification ou annulation, contactez-nous au ${escapeHtml(restaurantInfo.phone.display)}.</p>
        <p class="receipt__disclaimer">
          Document généré le ${escapeHtml(formatDateLong(new Date().toISOString()))}.
          Il s&apos;agit d&apos;un reçu informatisé et ne nécessite pas de signature manuscrite.
        </p>
      </footer>
    </div>
  </div>
  <script>
    function downloadReceipt() {
      const filename = "Recu-${escapeHtml(commande.reference).replace(/[^a-zA-Z0-9-]/g, "")}.html";
      const html = "<!DOCTYPE html>\\n" + document.documentElement.outerHTML;
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>`;
}

export function openOrderReceiptPreview(commande) {
  if (!commande) return;

  const html = buildReceiptHtml(commande);
  const win = window.open("", "_blank", "width=920,height=980");
  if (!win) return;

  win.document.write(html);
  win.document.close();
  win.focus();
}

/** @deprecated Préférez openOrderReceiptPreview — ouvre l’aperçu sans impression auto. */
export function printOrderReceipt(commande) {
  openOrderReceiptPreview(commande);
}
