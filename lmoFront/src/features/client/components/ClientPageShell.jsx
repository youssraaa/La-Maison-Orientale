import ClientPageHero from "./ClientPageHero";

export default function ClientPageShell({
  title,
  lead,
  action,
  icon,
  statusChip,
  pageClass = "",
  children,
}) {
  return (
    <div className={`client-page client-page--shell${pageClass ? ` ${pageClass}` : ""}`}>
      <ClientPageHero
        icon={icon}
        title={title}
        lead={lead}
        statusChip={statusChip}
        action={action}
      />

      <div className="client-page__body">{children}</div>
    </div>
  );
}
