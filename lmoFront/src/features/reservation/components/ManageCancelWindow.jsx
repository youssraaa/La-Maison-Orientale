export default function ManageCancelWindow({ deadlineLabel, onCancel, busy = false }) {
  return (
    <section className="manage-late" aria-labelledby="manage-late-title">
      <div className="manage-late__frame">
        <div className="manage-late__medallion" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M12 7.5v5.2l3.2 1.8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="manage-late__tag">
          <span aria-hidden="true" />
          Dernières heures
          <span aria-hidden="true" />
        </p>

        <h3 id="manage-late-title">Modifications fermées en ligne</h3>

        <p className="manage-late__lead">
          Il reste moins de <strong>{deadlineLabel}</strong> avant votre table. Les changements de
          date, d&apos;horaire ou de couverts ne sont plus possibles depuis cette page.
        </p>

        <div className="manage-late__note">
          <p>Vous pouvez encore annuler votre réservation si vos plans changent.</p>
        </div>

        <button type="button" className="manage-late__btn" onClick={onCancel} disabled={busy}>
          {busy ? "Annulation…" : "Annuler ma réservation"}
        </button>
      </div>
    </section>
  );
}
