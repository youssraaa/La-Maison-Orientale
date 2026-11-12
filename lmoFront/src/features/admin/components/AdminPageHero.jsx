export default function AdminPageHero({
  icon: Icon,
  title,
  lead,
  statusChip,
  heroStats,
  action,
  kicker = "Espace Admin",
}) {
  const ChipIcon = statusChip?.icon;

  return (
    <header
      className={`client-page-hero admin-page-hero${
        heroStats ? " admin-page-hero--with-stats" : ""
      }`}
    >
      <div className="client-page-hero__main">
        {Icon ? (
          <span className="client-page-hero__icon" aria-hidden="true">
            <Icon />
          </span>
        ) : null}
        <div>
          <h1 className="client-page-hero__title">{title}</h1>
          {lead ? <p className="client-page-hero__sub">{lead}</p> : null}
        </div>
      </div>
      {heroStats ? heroStats : statusChip ? (
        <span
          className={`client-page-hero__chip${
            statusChip.tone === "ok" ? " client-page-hero__chip--ok" : ""
          }${statusChip.tone === "alert" ? " admin-page-hero__chip--alert" : ""}`}
        >
          {ChipIcon ? <ChipIcon /> : null}
          {statusChip.label}
        </span>
      ) : null}
      {!heroStats && !statusChip && action ? (
        <div className="client-page-hero__action">{action}</div>
      ) : null}
    </header>
  );
}
