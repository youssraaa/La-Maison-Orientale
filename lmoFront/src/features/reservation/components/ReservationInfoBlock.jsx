import { useState } from "react";

import useRestaurantInfo from "../../../common/hooks/useRestaurantInfo";

import useReservationPolicy from "../hooks/useReservationPolicy";

import { formatDeadlineFr, formatDurationFr } from "../utils/reservationPolicy";



function buildPolicySections(policy) {

  const maxOnline = policy.maxOnlineCovers;

  const modDeadline = formatDeadlineFr(policy.modificationDeadlineHours);

  const tableDuration = formatDurationFr(policy.tableDurationClientMinutes);



  return [

    {

      title: "Retards",

      text: "En cas de retard de plus de 15 minutes par rapport à l’heure de réservation, la table pourrait ne pas être garantie.",

    },

    {

      title: "Heure de réservation",

      text: "L’heure peut être ajustée jusqu’à 15 minutes. Nous vous recommandons d’arriver à l’heure pour une expérience optimale.",

    },

    {

      title: "Durée de la table",

      text: `La table est disponible pendant ${tableDuration} maximum à compter de l’heure de réservation.`,

    },

    {

      title: "No-show",

      text: "Ne pas se présenter dans le délai prévu, avec une tolérance de 15 minutes, sera considéré comme une non-présentation (no-show).",

    },

    {

      title: "Modifications",

      text: `Les modifications en ligne sont possibles jusqu’à ${modDeadline} avant l’heure réservée, selon disponibilité. Passé ce délai, contactez-nous par téléphone.`,

    },

    {

      title: "Annulations",

      text: `Jusqu’à ${maxOnline} personnes : annulation libre en ligne à tout moment. Au-delà de ${maxOnline} personnes : annulation par téléphone uniquement.`,

    },

    {

      title: "Réservations en ligne",

      text: `Les réservations en ligne sont limitées à ${maxOnline} personnes. Au-delà, contactez-nous par téléphone.`,

    },

    {

      title: "Validité",

      text: "La réservation est valable si la date, l’heure, le nombre de convives et les coordonnées fournies sont respectés.",

    },

    {

      title: "Pénalités",

      text: "Si ces règles ne sont pas respectées, une pénalité de 25 € peut être appliquée par convive non présent ou pour réservation non conforme.",

    },

  ];

}



export function ReservationTip() {

  const { info } = useRestaurantInfo();

  const { policy } = useReservationPolicy();

  const { phone } = info;

  const maxOnline = policy.maxOnlineCovers;



  return (

    <p className="res-policy__tip">

      Les créneaux affichés sont libres. Arrivez à l’heure : la table est

      gardée 15 minutes. Pour plus de {maxOnline} personnes,{" "}

      {phone?.display ? (

        <a href={phone.href}>appelez-nous au {phone.display}</a>

      ) : (

        "appelez-nous"

      )}

      .

    </p>

  );

}



export function ReservationPolicyToggle({ variant = "head" }) {

  const [open, setOpen] = useState(false);

  const { policy } = useReservationPolicy();

  const sections = buildPolicySections(policy);



  return (

    <div className={`res-policy res-policy--${variant}${open ? " is-open" : ""}`}>

      <button

        type="button"

        className={`res-policy__toggle${open ? " is-open" : ""}`}

        aria-expanded={open}

        onClick={() => setOpen((v) => !v)}

      >

        Politique d’annulation

        <span aria-hidden="true">{open ? "−" : "+"}</span>

      </button>



      {open && (

        <div className="res-policy__panel" role="region" aria-label="Politique d’annulation">

          {sections.map((section) => (

            <div key={section.title} className="res-policy__item">

              <h4>{section.title}</h4>

              <p>{section.text}</p>

            </div>

          ))}

          <p className="res-policy__note">

            Ces conditions pourront être ajustées par le restaurant.

          </p>

        </div>

      )}

    </div>

  );

}



/** @deprecated Prefer ReservationTip + ReservationPolicyToggle */

export default function ReservationInfoBlock() {

  return (

    <>

      <ReservationTip />

      <ReservationPolicyToggle />

    </>

  );

}

