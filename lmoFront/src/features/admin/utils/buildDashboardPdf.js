import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const BRAND = [180, 35, 46];
const INK = [58, 16, 20];
const MUTED = [138, 115, 100];

function waitForPaint(ms = 400) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(resolve, ms);
      });
    });
  });
}

function replaceSvgsWithImages(root) {
  if (!root) return;
  root.querySelectorAll("svg").forEach((svg) => {
    try {
      const box = svg.getBoundingClientRect();
      const width = Math.max(Math.round(box.width), 1);
      const height = Math.max(Math.round(box.height), 1);
      if (width < 2 || height < 2) return;

      const clone = svg.cloneNode(true);
      clone.setAttribute("width", String(width));
      clone.setAttribute("height", String(height));
      if (!clone.getAttribute("xmlns")) {
        clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }

      const xml = new XMLSerializer().serializeToString(clone);
      const encoded = encodeURIComponent(xml).replace(/'/g, "%27").replace(/"/g, "%22");
      const img = root.ownerDocument.createElement("img");
      img.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
      img.width = width;
      img.height = height;
      img.style.width = `${width}px`;
      img.style.height = `${height}px`;
      img.style.display = "block";
      svg.replaceWith(img);
    } catch {
      /* ignore single svg failures */
    }
  });
}

async function captureElement(el) {
  if (!el) return null;

  await waitForPaint(450);
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#fffcf7",
    logging: false,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: -window.scrollY,
    onclone: (clonedDoc) => {
      const clonedEl = el.id ? clonedDoc.getElementById(el.id) : null;
      if (clonedEl) {
        clonedEl.style.overflow = "visible";
        replaceSvgsWithImages(clonedEl);
      }
    },
  });

  if (!canvas.width || !canvas.height) return null;
  return {
    dataUrl: canvas.toDataURL("image/png"),
    aspect: canvas.height / canvas.width,
  };
}

function addCapturedImage(doc, capture, x, y, maxWidth, maxHeight) {
  if (!capture?.dataUrl) return y;

  let imgW = maxWidth;
  let imgH = imgW * capture.aspect;
  if (imgH > maxHeight) {
    imgH = maxHeight;
    imgW = imgH / capture.aspect;
  }

  doc.addImage(capture.dataUrl, "PNG", x, y, imgW, imgH);
  return y + imgH + 6;
}

async function saveDashboardPdf({ data, daysLabel, chartRootId = "lmo-dashboard-charts" }) {
  if (!data?.kpis) {
    throw new Error("Données du tableau de bord indisponibles.");
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16;
  let y = M;

  doc.setFillColor(...BRAND);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("La Maison Orientale", M, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Rapport d'activité — espace administration", M, 19);

  y = 38;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Synthèse (${daysLabel})`, M, y);
  y += 10;

  const kpis = data.kpis || {};
  const rows = [
    ["Réservations du jour", String(kpis.reservationsToday ?? "—")],
    ["Couverts prévus", String(kpis.coversToday ?? "—")],
    ["Nouveaux messages", String(kpis.newMessages ?? "—")],
    ["Réservations annuelles", String(kpis.reservationsYear ?? "—")],
    ["Couverts annuels", String(kpis.coversYear ?? "—")],
    ["Taux confirmées", `${kpis.confirmationRate ?? 0} %`],
    ["Réservations (période)", String(kpis.reservationsPeriod ?? "—")],
    ["Couverts (période)", String(kpis.coversPeriod ?? "—")],
    ["Messages (période)", String(kpis.messagesPeriod ?? "—")],
    ["À traiter", String((kpis.pendingReservations ?? 0) + (kpis.newMessages ?? 0))],
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setTextColor(...MUTED);
    doc.text(label, M, y);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.text(value, W - M, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 7;
  });

  let chartsIncluded = 0;
  const chartEl = document.getElementById(chartRootId);
  const secondaryEl = document.getElementById("lmo-dashboard-charts-secondary");

  try {
    const chartImg = await captureElement(chartEl);
    if (chartImg) {
      y += 4;
      if (y > H - 50) {
        doc.addPage();
        y = M;
      }
      doc.setTextColor(...INK);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Graphique principal", M, y);
      y += 8;
      y = addCapturedImage(doc, chartImg, M, y, W - M * 2, Math.min(95, H - y - 20));
      chartsIncluded += 1;
    }
  } catch (err) {
    console.warn("Capture graphique principal impossible", err);
  }

  try {
    const secondaryImg = await captureElement(secondaryEl);
    if (secondaryImg) {
      if (y > H - 90) {
        doc.addPage();
        y = M;
      }
      doc.setTextColor(...INK);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Graphiques détaillés", M, y);
      y += 8;
      addCapturedImage(doc, secondaryImg, M, y, W - M * 2, Math.min(110, H - y - 20));
      chartsIncluded += 1;
    }
  } catch (err) {
    console.warn("Capture graphiques secondaires impossible", err);
  }

  if (chartsIncluded === 0) {
    y += 6;
    if (y > H - 24) {
      doc.addPage();
      y = M;
    }
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(
      "Les graphiques n'ont pas pu être capturés ; les indicateurs ci-dessus restent disponibles.",
      M,
      y,
      { maxWidth: W - M * 2 },
    );
  }

  doc.setDrawColor(220, 210, 205);
  doc.line(M, H - 16, W - M, H - 16);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `Généré le ${new Date().toLocaleString("fr-BE")} · Usage interne`,
    M,
    H - 10,
  );

  doc.save(`rapport-lmo-${Date.now()}.pdf`);
}

export default saveDashboardPdf;
