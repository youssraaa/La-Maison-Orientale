import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BURGUNDY = "#b4232e";
const BURGUNDY_DEEP = "#7a1520";
const GOLD = "#c4a35a";
const OLIVE = "#3d7a4a";
const SAFFRON = "#d4892e";
const TEAL = "#2a6b5e";
const MUTED = "#8a7364";
const GRID = "rgba(40, 20, 16, 0.1)";

const STATUS_COLORS = {
  EN_ATTENTE: SAFFRON,
  CONFIRMEE: OLIVE,
  REFUSEE: BURGUNDY,
  ANNULEE: "#7a6f68",
};

const MSG_BAR_COLORS = [BURGUNDY, SAFFRON, GOLD, TEAL, OLIVE, "#c45a3a"];

function ChartTooltip({ active, payload, label, suffix }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-chart__tooltip">
      <p className="admin-chart__tooltip-label">{label}</p>
      <p className="admin-chart__tooltip-value">
        {payload[0].value} {suffix || ""}
      </p>
    </div>
  );
}

function PiePercentLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

function ChartPanel({ title, subtitle, children }) {
  return (
    <section className="admin-chart">
      {(title || subtitle) && (
        <header className="admin-chart__head">
          {title ? <h3>{title}</h3> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      )}
      <div className="admin-chart__surface">{children}</div>
    </section>
  );
}

function DashboardCharts({ charts, days, compact = false }) {
  if (!charts) return null;

  const reservationsByDay = charts.reservationsByDay || [];
  const coversByDay = charts.coversByDay || [];
  const messagesByDay = charts.messagesByDay || [];
  const byStatus = (charts.reservationsByStatus || []).filter((d) => d.value > 0);
  const byHour = charts.reservationsByHour || [];

  const activitySeries = reservationsByDay.map((point, index) => ({
    label: point.label,
    reservations: point.value,
    covers: coversByDay[index]?.value ?? 0,
  }));

  const dense = days > 14;
  const tickInterval = dense ? 4 : 0;

  const mainChart = (
    <div className={`admin-chart__plot${compact ? "" : " admin-chart__plot--tall"}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={activitySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="lmoResaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BURGUNDY} stopOpacity={0.45} />
              <stop offset="100%" stopColor={BURGUNDY} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="lmoCoverFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
              <stop offset="100%" stopColor={GOLD} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: MUTED, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            interval={tickInterval}
            minTickGap={18}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: MUTED, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "#1c100e",
              border: "1px solid rgba(196,163,90,0.35)",
              borderRadius: 8,
              color: "#fff",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: MUTED }} />
          <Area
            type="monotone"
            dataKey="reservations"
            name="Réservations"
            stroke={BURGUNDY}
            strokeWidth={2.6}
            fill="url(#lmoResaFill)"
            dot={{ r: 3, fill: BURGUNDY, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="covers"
            name="Couverts"
            stroke={GOLD}
            strokeWidth={2.4}
            fill="url(#lmoCoverFill)"
            dot={{ r: 3, fill: GOLD, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (compact) {
    return <div className="admin-charts admin-charts--compact">{mainChart}</div>;
  }

  return (
    <div className="admin-charts">
      <ChartPanel
        title="Fréquentation prévue"
        subtitle={`Réservations et couverts sur ${days} jours`}
      >
        {mainChart}
      </ChartPanel>

      <div className="admin-charts__row">
        <ChartPanel title="Répartition des statuts" subtitle="Sur la période">
          <div className="admin-chart__plot">
            {byStatus.length === 0 ? (
              <p className="admin-dash__empty">Pas encore de données.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="48%"
                    outerRadius={95}
                    innerRadius={42}
                    labelLine={false}
                    label={PiePercentLabel}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {byStatus.map((entry) => (
                      <Cell
                        key={entry.statut}
                        fill={STATUS_COLORS[entry.statut] || BURGUNDY_DEEP}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value, name) => [`${value} résa.`, name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartPanel>

        <ChartPanel title="Pics horaires" subtitle="Créneaux demandés">
          <div className="admin-chart__plot">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byHour} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="lmoHourFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TEAL} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={TEAL} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} interval={1} />
                <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} width={28} />
                <Tooltip content={<ChartTooltip suffix="résa." />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={TEAL}
                  strokeWidth={2.6}
                  fill="url(#lmoHourFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      <ChartPanel title="Messages contact" subtitle={`Volume sur ${days} jours`}>
        <div className="admin-chart__plot">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={messagesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} interval={tickInterval} />
              <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} width={28} />
              <Tooltip content={<ChartTooltip suffix="messages" />} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {messagesByDay.map((_, index) => (
                  <Cell key={`msg-${index}`} fill={MSG_BAR_COLORS[index % MSG_BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>
    </div>
  );
}

export default DashboardCharts;
