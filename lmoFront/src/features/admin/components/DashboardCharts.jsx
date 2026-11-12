import { useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PALETTE = {
  burgundy: "#7a1520",
  burgundySoft: "#b4232e",
  gold: "#e2b04a",
  goldLight: "#f6d98a",
  olive: "#3d7a4a",
  copper: "#c9864a",
  teal: "#2a6b5e",
  ink: "#2a1810",
  muted: "#7a6f66",
  grid: "rgba(122, 21, 32, 0.08)",
};

const HEATMAP_SHADES = [
  "rgba(122,21,32,0.06)",
  "rgba(122,21,32,0.15)",
  "rgba(122,21,32,0.28)",
  "rgba(122,21,32,0.42)",
  "rgba(122,21,32,0.58)",
  "rgba(122,21,32,0.75)",
  "rgba(122,21,32,0.92)",
];

function sumValues(points) {
  return (points || []).reduce((acc, p) => acc + (Number(p.value) || 0), 0);
}

function sumAmounts(points) {
  return (points || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
}

function formatEuro(value) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDayTick(dateIso, fullLabel, dense) {
  if (dateIso) {
    const parsed = new Date(`${dateIso}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      if (dense) {
        return parsed.toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit" });
      }
      return parsed.toLocaleDateString("fr-BE", { weekday: "short", day: "numeric" });
    }
  }
  if (!fullLabel) return "";
  return dense && fullLabel.length > 8 ? fullLabel.replace(/\s+\w+$/, "") : fullLabel;
}

function mapDailyPoint(point, dense, extra = {}) {
  return {
    label: point.label,
    date: point.date,
    tick: formatDayTick(point.date, point.label, dense),
    ...extra,
  };
}

function tooltipLabel(label, payload) {
  return payload?.[0]?.payload?.label || label;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-chart-tooltip">
      <p className="dash-chart-tooltip__label">{tooltipLabel(label, payload)}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="dash-chart-tooltip__row">
          <span className="dash-chart-tooltip__dot" style={{ background: entry.color }} />
          <span>{entry.name}</span>
          <strong>
            {entry.dataKey === "revenue" || entry.dataKey === "amount"
              ? formatEuro(entry.value)
              : entry.value}
          </strong>
        </p>
      ))}
    </div>
  );
}

function SimpleTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload?.length) return null;
  const raw = payload[0].value;
  return (
    <div className="dash-chart-tooltip">
      <p className="dash-chart-tooltip__label">{tooltipLabel(label, payload)}</p>
      <p className="dash-chart-tooltip__row">
        <strong>{unit === "euro" ? formatEuro(raw) : `${raw} ${unit}`.trim()}</strong>
      </p>
    </div>
  );
}

function EmptyOverlay({ message }) {
  return (
    <div className="dash-chart-empty">
      <span className="dash-chart-empty__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
          />
        </svg>
      </span>
      <p>{message}</p>
    </div>
  );
}

function PeriodToggle({ value, onChange }) {
  const options = [
    { key: "jour", label: "Jour" },
    { key: "mois", label: "Mois" },
    { key: "annee", label: "Année" },
  ];
  return (
    <div className="dash-period-toggle" role="group" aria-label="Période">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={`dash-period-toggle__btn${value === opt.key ? " is-active" : ""}`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, accent, total, headerAction, children, empty, emptyMessage, className = "" }) {
  return (
    <article className={`dash-chart-card dash-chart-card--${accent} ${className}`.trim()}>
      <header className="dash-chart-card__head">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <div className="dash-chart-card__actions">
          {headerAction || null}
          {total != null && total !== "" ? (
            <span className="dash-chart-card__total">{total}</span>
          ) : null}
        </div>
      </header>
      <div className="dash-chart-card__body">
        {children}
        {empty ? <EmptyOverlay message={emptyMessage} /> : null}
      </div>
    </article>
  );
}

function SectionBlock({ title, lead, children }) {
  return (
    <section className="dash-charts-section">
      <header className="dash-charts-section__head">
        <h4 className="dash-charts-section__title">{title}</h4>
        {lead ? <p className="dash-charts-section__lead">{lead}</p> : null}
      </header>
      <div className="dash-bento">{children}</div>
    </section>
  );
}

function HeatmapSlot({ hour, count, max }) {
  const ratio = max > 0 ? count / max : 0;
  const shadeIndex = ratio === 0 ? 0 : Math.min(HEATMAP_SHADES.length - 1, Math.ceil(ratio * (HEATMAP_SHADES.length - 1)));
  return (
    <div
      className="dash-heatmap__cell"
      style={{ background: HEATMAP_SHADES[shadeIndex] }}
      title={`${hour} — ${count} résa.`}
    >
      <span className="dash-heatmap__cell-label">{hour}</span>
      {count > 0 ? <span className="dash-heatmap__cell-value">{count}</span> : null}
    </div>
  );
}

function CapacityHeatmap({ byHour }) {
  if (!byHour || byHour.length === 0) return null;

  const data = byHour.filter((h) => h.label);
  const maxCount = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  return (
    <div className="dash-heatmap">
      <div className="dash-heatmap__legend">
        <span>Peu</span>
        <div className="dash-heatmap__legend-bar">
          {HEATMAP_SHADES.map((shade, i) => (
            <span key={i} className="dash-heatmap__legend-swatch" style={{ background: shade }} />
          ))}
        </div>
        <span>Beaucoup</span>
      </div>
      <div className="dash-heatmap__grid">
        {data.map((slot) => (
          <HeatmapSlot
            key={slot.label}
            hour={slot.label}
            count={Number(slot.value) || 0}
            max={maxCount}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceBar({ label, value, maxValue, color, pct }) {
  return (
    <div className="dash-service-bar">
      <span className="dash-service-bar__label">{label}</span>
      <div className="dash-service-bar__track">
        <div
          className="dash-service-bar__fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="dash-service-bar__value">{value}</span>
      <span className="dash-service-bar__pct">{pct}%</span>
    </div>
  );
}

function ServiceChart({ byService }) {
  if (!byService || byService.length === 0) return null;

  const data = byService
    .filter((s) => Number(s.value) > 0 || s.key === "MIDI" || s.key === "SOIR")
    .map((s) => ({ name: s.label, value: Number(s.value) || 0, key: s.key }));

  if (data.length === 0) return null;

  const total = data.reduce((a, d) => a + d.value, 0);

  const colors = { MIDI: PALETTE.gold, SOIR: PALETTE.burgundySoft };

  return (
    <div className="dash-service-chart">
      <div className="dash-service-chart__bars">
        {data.map((d) => (
          <ServiceBar
            key={d.key}
            label={d.name}
            value={d.value}
            maxValue={total}
            color={colors[d.key] || PALETTE.copper}
            pct={total > 0 ? Math.round((d.value / total) * 100) : 0}
          />
        ))}
      </div>
      <p className="dash-service-chart__total">{total} réservations au total</p>
    </div>
  );
}

function DashboardCharts({ charts, days }) {
  if (!charts) return null;

  const [cmdView, setCmdView] = useState("jour");
  const [resaView, setResaView] = useState("jour");

  const reservationsByDay = charts.reservationsByDay || [];
  const commandesByDay = charts.commandesByDay || [];
  const revenueByDay = charts.revenueByDay || [];
  const byHour = charts.reservationsByHour || [];
  const byService = charts.reservationsByService || [];
  const reservationsByMonth = charts.reservationsByMonth || [];
  const commandesByMonth = charts.commandesByMonth || [];

  const axisStyle = { fill: PALETTE.muted, fontSize: 10, fontWeight: 600 };

  const totalResa = sumValues(reservationsByDay);
  const totalCommandes = sumValues(commandesByDay);
  const totalRevenue = sumAmounts(revenueByDay);

  const totalResaYear = reservationsByMonth.reduce((a, p) => a + (Number(p.value) || 0), 0);
  const totalCmdYear = commandesByMonth.reduce((a, p) => a + (Number(p.count) || 0), 0);
  const totalRevYear = commandesByMonth.reduce((a, p) => a + (Number(p.amount) || 0), 0);

  return (
    <div className="dash-charts-grid dash-charts-grid--bento">
      <SectionBlock title="Commandes & revenus" lead={`${days} derniers jours`}>
        <ChartCard
          accent="teal"
          title="Commandes"
          subtitle={cmdView === "jour" ? "Par jour" : cmdView === "mois" ? "Par mois" : "Total année"}
          total={cmdView === "jour" ? totalCommandes : totalCmdYear}
          headerAction={<PeriodToggle value={cmdView} onChange={setCmdView} />}
          empty={cmdView === "jour" ? totalCommandes === 0 : totalCmdYear === 0}
          emptyMessage="Aucune commande"
        >
          {cmdView === "jour" ? (
            <CommandeBarChart data={commandesByDay} days={days} axisStyle={axisStyle} />
          ) : cmdView === "mois" ? (
            <CommandeMonthChart data={commandesByMonth} axisStyle={axisStyle} />
          ) : (
            <YearRecap count={totalCmdYear} amount={totalRevYear} label="commandes" />
          )}
        </ChartCard>

        <ChartCard
          accent="copper"
          title="Chiffre d'affaires"
          subtitle="Revenu des commandes"
          total={cmdView === "jour" ? formatEuro(totalRevenue) : formatEuro(totalRevYear)}
          empty={cmdView === "jour" ? totalRevenue === 0 : totalRevYear === 0}
          emptyMessage="—"
        >
          {cmdView === "jour" ? (
            <RevenueChart data={revenueByDay} commandesByDay={commandesByDay} days={days} axisStyle={axisStyle} />
          ) : (
            <RevenueMonthChart data={commandesByMonth} view={cmdView} axisStyle={axisStyle} />
          )}
        </ChartCard>


      </SectionBlock>

      <SectionBlock title="Réservations" lead={`${days} derniers jours`}>
        <ChartCard
          accent="burgundy"
          title="Nombre de réservations"
          subtitle={resaView === "jour" ? "Par jour" : resaView === "mois" ? "Par mois" : "Total année"}
          total={resaView === "jour" ? totalResa : totalResaYear}
          headerAction={<PeriodToggle value={resaView} onChange={setResaView} />}
          empty={resaView === "jour" ? totalResa === 0 : totalResaYear === 0}
          emptyMessage="Aucune réservation"
        >
          {resaView === "jour" ? (
            <ResaBarChart data={reservationsByDay} days={days} axisStyle={axisStyle} />
          ) : resaView === "mois" ? (
            <ResaMonthChart data={reservationsByMonth} axisStyle={axisStyle} />
          ) : (
            <YearRecap count={totalResaYear} label="réservations" />
          )}
        </ChartCard>

        <ChartCard
          accent="gold"
          title="Créneaux les plus demandés"
          subtitle="Nombre de réservations par tranche horaire"
          total={`${sumValues(byHour)} résa.`}
          empty={sumValues(byHour) === 0}
          emptyMessage="Aucune donnée horaire"
        >
          <CapacityHeatmap byHour={byHour} />
        </ChartCard>

        <ChartCard
          accent="burgundy"
          title="Service midi vs soir"
          subtitle="Répartition des réservations entre déjeuner et dîner"
          empty={byService.length === 0 || sumValues(byService) === 0}
          emptyMessage="Aucune donnée"
        >
          <ServiceChart byService={byService} />
        </ChartCard>

        <ChartCard
          accent="olive"
          title="Jours de la semaine"
          subtitle="Réservations cumulées par jour"
          total={`${totalResa} résa.`}
          empty={totalResa === 0}
          emptyMessage="Aucune donnée"
        >
          <WeeklyPatternChart reservationsByDay={reservationsByDay} />
        </ChartCard>
      </SectionBlock>
    </div>
  );
}

function CommandeBarChart({ data, days, axisStyle }) {
  const dense = days > 14;
  const tickInterval = dense ? Math.max(1, Math.floor((data.length || days) / 6)) : 0;
  const dayAxisMargin = { top: 8, right: 8, left: 0, bottom: dense ? 18 : 14 };
  const dayXAxisProps = {
    dataKey: "tick",
    tick: axisStyle,
    tickLine: false,
    axisLine: false,
    interval: tickInterval,
    angle: dense ? -42 : -32,
    textAnchor: "end",
    height: dense ? 54 : 46,
  };
  const series = data.map((p) => mapDailyPoint(p, dense, { value: p.value }));

  return (
    <div className="dash-chart-plot dash-chart-plot--md dash-chart-plot--dated">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={dayAxisMargin}>
          <CartesianGrid strokeDasharray="3 6" stroke={PALETTE.grid} vertical={false} />
          <XAxis {...dayXAxisProps} />
          <YAxis allowDecimals={false} tick={axisStyle} width={24} tickLine={false} axisLine={false} />
          <Tooltip content={<SimpleTooltip unit="cmd." />} />
          <Bar dataKey="value" fill={PALETTE.teal} radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CommandeMonthChart({ data, axisStyle }) {
  const series = (data || [])
    .filter((p) => (Number(p.count) || 0) > 0)
    .map((p) => ({ label: p.label, value: Number(p.count) || 0 }));

  return (
    <div className="dash-chart-plot dash-chart-plot--md">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 6" stroke={PALETTE.grid} vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={axisStyle} width={24} tickLine={false} axisLine={false} />
          <Tooltip content={<SimpleTooltip unit="cmd." />} />
          <Bar dataKey="value" fill={PALETTE.teal} radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueChart({ data, commandesByDay, days, axisStyle }) {
  const dense = days > 14;
  const tickInterval = dense ? Math.max(1, Math.floor((data.length || days) / 6)) : 0;
  const dayAxisMargin = { top: 8, right: 8, left: 0, bottom: dense ? 18 : 14 };
  const dayXAxisProps = {
    dataKey: "tick",
    tick: axisStyle,
    tickLine: false,
    axisLine: false,
    interval: tickInterval,
    angle: dense ? -42 : -32,
    textAnchor: "end",
    height: dense ? 54 : 46,
  };
  const financeSeries = commandesByDay.map((point, index) =>
    mapDailyPoint(point, dense, {
      revenue: data[index]?.amount ?? 0,
    })
  );

  return (
    <div className="dash-chart-plot dash-chart-plot--md dash-chart-plot--dated">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={financeSeries} margin={dayAxisMargin}>
          <CartesianGrid strokeDasharray="3 6" stroke={PALETTE.grid} vertical={false} />
          <XAxis {...dayXAxisProps} />
          <YAxis allowDecimals={false} tick={axisStyle} width={36} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}€`} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="revenue" name="Revenu" stroke={PALETTE.gold} strokeWidth={2} fill="rgba(226,176,74,0.15)" dot={{ r: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueMonthChart({ data, view, axisStyle }) {
  const series = (data || [])
    .filter((p) => {
      if (view === "mois") return (Number(p.amount) || 0) > 0;
      return true;
    })
    .map((p) => ({
      label: p.label,
      value: Number(p.amount) || 0,
    }));

  const total = series.reduce((a, p) => a + p.value, 0);

  return (
    <div className="dash-chart-plot dash-chart-plot--md">
      {view === "annee" ? (
        <div className="dash-year-recap">
          <p className="dash-year-recap__amount">{formatEuro(total)}</p>
          <p className="dash-year-recap__label">Revenu total de l&apos;année</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 6" stroke={PALETTE.grid} vertical={false} />
            <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={axisStyle} width={36} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}€`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name="Revenu" fill={PALETTE.gold} radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function ResaBarChart({ data, days, axisStyle }) {
  const dense = days > 14;
  const tickInterval = dense ? Math.max(1, Math.floor((data.length || days) / 6)) : 0;
  const dayAxisMargin = { top: 8, right: 8, left: 0, bottom: dense ? 18 : 14 };
  const dayXAxisProps = {
    dataKey: "tick",
    tick: axisStyle,
    tickLine: false,
    axisLine: false,
    interval: tickInterval,
    angle: dense ? -42 : -32,
    textAnchor: "end",
    height: dense ? 54 : 46,
  };
  const series = data.map((p) => mapDailyPoint(p, dense, { value: p.value }));

  return (
    <div className="dash-chart-plot dash-chart-plot--md dash-chart-plot--dated">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={dayAxisMargin}>
          <CartesianGrid strokeDasharray="3 6" stroke={PALETTE.grid} vertical={false} />
          <XAxis {...dayXAxisProps} />
          <YAxis allowDecimals={false} tick={axisStyle} width={24} tickLine={false} axisLine={false} />
          <Tooltip content={<SimpleTooltip unit="résa." />} />
          <Bar dataKey="value" fill={PALETTE.burgundySoft} radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ResaMonthChart({ data, axisStyle }) {
  const series = (data || [])
    .filter((p) => (Number(p.value) || 0) > 0)
    .map((p) => ({ label: p.label, value: Number(p.value) || 0 }));

  return (
    <div className="dash-chart-plot dash-chart-plot--md">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 6" stroke={PALETTE.grid} vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={axisStyle} width={24} tickLine={false} axisLine={false} />
          <Tooltip content={<SimpleTooltip unit="résa." />} />
          <Bar dataKey="value" fill={PALETTE.burgundySoft} radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function YearRecap({ count, amount, label }) {
  return (
    <div className="dash-year-recap">
      <p className="dash-year-recap__count">{count}</p>
      <p className="dash-year-recap__label">{label} cette année</p>
      {amount != null ? (
        <p className="dash-year-recap__amount">{formatEuro(amount)}</p>
      ) : null}
    </div>
  );
}

const DAY_NAMES = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const DAY_NAMES_FULL = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function WeeklyPatternChart({ reservationsByDay }) {
  if (!reservationsByDay || reservationsByDay.length === 0) return null;

  const counts = [0, 0, 0, 0, 0, 0, 0];
  reservationsByDay.forEach((p) => {
    if (!p.date) return;
    const d = new Date(`${p.date}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      counts[d.getDay()] += Number(p.value) || 0;
    }
  });

  const maxCount = Math.max(...counts, 1);

  return (
    <div className="dash-weekly">
      <div className="dash-weekly__bars">
        {counts.map((count, i) => {
          const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
          return (
            <div key={i} className="dash-weekly__row">
              <span className="dash-weekly__label">{DAY_NAMES[i]}</span>
              <div className="dash-weekly__track">
                <div
                  className="dash-weekly__fill"
                  style={{ width: `${pct}%` }}
                  title={`${DAY_NAMES_FULL[i]} — ${count} résa.`}
                />
              </div>
              <span className="dash-weekly__count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardCharts;
