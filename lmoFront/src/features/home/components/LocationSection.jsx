import useRestaurantInfo from "../../../common/hooks/useRestaurantInfo";
import ContactIcon from "../../contact/components/ContactIcons";

function LocationRow({ icon, label, children }) {
  return (
    <div className="location-section__item">
      <span className="location-section__icon" aria-hidden="true">
        <ContactIcon name={icon} />
      </span>
      <div className="location-section__item-body">
        <span className="location-section__label">{label}</span>
        {children}
      </div>
    </div>
  );
}

function LocationSection() {
  const { info } = useRestaurantInfo();
  const { address, phone, hours, map, services } = info;

  return (
    <section className="location-section" id="nous-trouver">
      <div className="location-section__frame">
        <div className="location-section__panel">
          <p className="section-kicker section-kicker--light">Nous trouver</p>
          <h2>Au cœur de Quaregnon</h2>
          <p className="location-section__intro">
            La Maison Orientale vous accueille à Quaregnon&nbsp;!
          </p>

          <div className="location-section__details">
            <LocationRow icon="pin" label="Adresse">
              <p>
                {address.street}
                <br />
                {address.city}
              </p>
            </LocationRow>

            {services?.length > 0 ? (
              <LocationRow icon="service" label="Service">
                <p>{services.join(" · ")}</p>
              </LocationRow>
            ) : null}

            {phone?.display ? (
              <LocationRow icon="phone" label="Téléphone">
                <p>
                  <a href={phone.href}>{phone.display}</a>
                </p>
              </LocationRow>
            ) : null}

            <LocationRow icon="clock" label="Horaires">
              <ul className="location-section__hours">
                {hours.schedule.map((row) => (
                  <li key={row.day}>
                    <span>{row.day}</span>
                    <span>{row.time}</span>
                  </li>
                ))}
              </ul>
            </LocationRow>
          </div>

          <div className="location-section__cta-wrap">
            <a
              className="btn btn--gold location-section__cta"
              href={map.googleDirections}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ContactIcon name="pin" />
              <span>Obtenir l&apos;itinéraire</span>
            </a>
          </div>
        </div>

        <div className="location-section__map">
          <iframe
            title="Carte — La Maison Orientale, Quaregnon"
            src={map.googleEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export default LocationSection;
