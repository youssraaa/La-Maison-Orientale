import { useEffect, useRef } from "react";

import { createPortal } from "react-dom";



function LateIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">

      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />

      <path

        d="M12 7.5v5.2l3.2 1.8"

        stroke="currentColor"

        strokeWidth="1.5"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

    </svg>

  );

}



function PhoneIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">

      <path

        d="M6.5 4h2.8l1.2 3.2-1.9 1.4a12.5 12.5 0 0 0 5.8 5.8l1.4-1.9L19 15.7V18.5a1.5 1.5 0 0 1-1.5 1.5A14 14 0 0 1 5 7.5 1.5 1.5 0 0 1 6.5 4Z"

        stroke="currentColor"

        strokeWidth="1.5"

        strokeLinejoin="round"

      />

    </svg>

  );

}



function CheckIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">

      <path

        d="M5 12.5l4.2 4.2L19 7.5"

        stroke="currentColor"

        strokeWidth="2"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

    </svg>

  );

}



/**

 * Popup « trop tard pour modifier » — style aligné sur la popup d'annulation.

 * @param {"cancelOnly"|"locked"|"phone"} variant

 */

export default function ManageLateModal({

  open,

  variant = "cancelOnly",

  deadlineLabel = "2 h",

  phone = null,

  busy = false,

  onCancel,

  onClose,

}) {

  const primaryRef = useRef(null);



  useEffect(() => {

    if (!open) return undefined;



    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";



    const onKey = (event) => {

      if (event.key === "Escape" && !busy) onClose?.();

    };



    document.addEventListener("keydown", onKey);

    const timer = window.setTimeout(() => primaryRef.current?.focus(), 30);



    return () => {

      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", onKey);

      window.clearTimeout(timer);

    };

  }, [open, busy, onClose]);



  if (!open) return null;



  const isPhone = variant === "phone";

  const isLocked = variant === "locked";



  const title = isPhone

    ? "Annulation par téléphone"

    : isLocked

      ? "Délai dépassé"

      : "Modification impossible";



  return createPortal(

    <div

      className="res-cancel-modal__overlay"

      role="presentation"

      onClick={(event) => {

        if (event.target === event.currentTarget && !busy) onClose?.();

      }}

    >

      <div

        className="res-cancel-modal res-cancel-modal--brand manage-late-modal--brand"

        role="alertdialog"

        aria-modal="true"

        aria-labelledby="manage-late-modal-title"

      >

        <header className="res-cancel-modal__hero">

          <span className="res-cancel-modal__hero-icon" aria-hidden="true">

            {isPhone ? <PhoneIcon /> : <LateIcon />}

          </span>

          <h2 id="manage-late-modal-title">{title}</h2>

        </header>



        <div className="res-cancel-modal__body">

          {isPhone ? (

            <>

              <p className="res-cancel-modal__note">

                Pour un groupe de plus de 10 personnes, merci de nous appeler

                {phone?.display ? (

                  <>

                    {" "}

                    au <a href={phone.href}>{phone.display}</a>

                  </>

                ) : null}

                . Les modifications en ligne ne sont plus disponibles.

              </p>

            </>

          ) : isLocked ? (

            <>

              <p className="res-cancel-modal__note">

                À moins de <strong>{deadlineLabel}</strong> de votre table, les changements en ligne

                sont clos.

              </p>

              {phone?.display ? (

                <p className="manage-late-modal__phone">

                  Une urgence ?{" "}

                  <a href={phone.href} className="manage-late-modal__phone-link">

                    {phone.display}

                  </a>

                </p>

              ) : null}

            </>

          ) : (

            <>

              <p className="res-cancel-modal__note">

                Il reste moins de <strong>{deadlineLabel}</strong> avant votre table.

              </p>

              <div className="manage-late-modal__ok">

                <div className="manage-late-modal__ok-head">

                  <span className="manage-late-modal__ok-icon" aria-hidden="true">

                    <CheckIcon />

                  </span>

                  <p className="manage-late-modal__ok-kicker">Annulation possible</p>

                </div>

                <p className="manage-late-modal__ok-text">Vos plans changent ?</p>

                <p className="manage-late-modal__ok-sub">Vous pouvez encore annuler en ligne.</p>

              </div>

            </>

          )}



          <div className="res-cancel-modal__actions">

            <button

              ref={!isLocked && !isPhone ? undefined : primaryRef}

              type="button"

              className="res-cancel-modal__btn res-cancel-modal__btn--keep"

              onClick={onClose}

              disabled={busy}

            >

              {isLocked || isPhone ? "Compris" : "Garder ma table"}

            </button>

            {!isLocked && !isPhone ? (

              <button

                ref={primaryRef}

                type="button"

                className="res-cancel-modal__btn res-cancel-modal__btn--confirm"

                onClick={onCancel}

                disabled={busy}

              >

                {busy ? "Annulation…" : "Annuler ma réservation"}

              </button>

            ) : null}

          </div>

        </div>

      </div>

    </div>,

    document.body

  );

}

