import { Link } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import ClientAuthBrandPanel from "../../client/components/ClientAuthBrandPanel";

export default function StaffAuthLayout({ variant = "activate", pageClass = "", children }) {
  return (
    <main className={`page client-auth-page staff-auth-page ${pageClass}`.trim()}>
      <PublicNavbar />
      <section className="client-auth">
        <div className="client-auth__stage">
          <div className="client-auth__glow client-auth__glow--teal" aria-hidden="true" />
          <div className="client-auth__glow client-auth__glow--gold" aria-hidden="true" />

          <div className="client-auth__shell client-auth__shell--staff">
            <ClientAuthBrandPanel variant={variant} />

            <div className="client-auth__panel">
              <div className="client-auth__panel-inner staff-auth__panel-inner">{children}</div>
            </div>
          </div>

          <p className="client-auth__page-foot staff-auth__page-foot">
            <Link to="/connexion">Connexion espace agent</Link>
            <Link to="/">Retour au site</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
