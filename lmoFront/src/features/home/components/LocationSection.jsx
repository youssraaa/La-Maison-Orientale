import { restaurantInfo } from "../../../common/data/restaurantInfo";

function LocationSection() {
  const { address, phone, hours, map } = restaurantInfo;

  return (
    <section className="location-section" id="nous-trouver">
      <div className="location-section__frame">
        <div className="location-section__panel">
          <p className="section-kicker section-kicker--light">Nous trouver</p>
          <h2>Au cœur de Quaregnon</h2>

          <div className="location-section__details">
            <div>
              <span className="location-section__label">Adresse</span>
              <p>
                {address.street}
                <br />
                {address.city}
              </p>
            </div>
            {phone?.display && (
              <div>
                <span className="location-section__label">Téléphone</span>
                <p>
                  <a href={phone.href}>{phone.display}</a>
                </p>
              </div>
            )}
            <div>
              <span className="location-section__label">Horaires</span>
              <ul className="location-section__hours">
                {hours.schedule.map((row) => (
                  <li key={row.day}>
                    <span>{row.day}</span>
                    <span>{row.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a
            className="btn btn--gold"
            href={map.googleDirections}
            target="_blank"
            rel="noopener noreferrer"
          >
            Obtenir l’itinéraire
          </a>
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
