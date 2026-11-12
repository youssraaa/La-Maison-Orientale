import { useAuth } from "../../../common/auth/AuthContext";
import AdminPageHero from "./AdminPageHero";

export default function AdminPageShell({
  title,
  lead,
  action,
  icon,
  statusChip,
  heroStats,
  pageClass = "",
  children,
}) {
  return (
    <div className={`admin-page admin-page--shell${pageClass ? ` ${pageClass}` : ""}`}>
      <AdminPageHero
        icon={icon}
        title={title}
        lead={lead}
        statusChip={statusChip}
        heroStats={heroStats}
        action={action}
      />
      <div className="admin-page__body">{children}</div>
    </div>
  );
}
