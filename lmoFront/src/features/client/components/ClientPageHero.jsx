export default function ClientPageHero({ icon: Icon, title, lead, statusChip, action }) {
  const ChipIcon = statusChip?.icon;

  return (
    <header className="client-page-hero">
      <div className="client-page-hero__main">
        {Icon ? (
          <span className="client-page-hero__icon" aria-hidden="true">
            <Icon />
          </span>
        ) : null}
        <div>
          <p className="client-page-hero__kicker">Mon compte</p>
          <h1 className="client-page-hero__title">{title}</h1>
          {lead ? <p className="client-page-hero__sub">{lead}</p> : null}
        </div>
      </div>
      {statusChip ? (
        <span
          className={`client-page-hero__chip${
            statusChip.tone === "ok" ? " client-page-hero__chip--ok" : ""
          }`}
        >
          {ChipIcon ? <ChipIcon /> : null}
          {statusChip.label}
        </span>
      ) : null}
      {!statusChip && action ? <div className="client-page-hero__action">{action}</div> : null}
    </header>
  );
}
