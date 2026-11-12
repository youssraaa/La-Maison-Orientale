function DeliveryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="17" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="17" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6 17h2l2.5-6h7l2 4h2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 11h5.5l1.5-3h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PickupIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 9h8l-1.2 9H9.2L8 9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 9V6.5c0-1.2 1-2 2-2s2 .8 2 2V9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5.5 13.5c1.2-.8 2.6-1.2 4-1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function OrderModeToggle({ mode, onModeChange, className = "" }) {
  return (
    <div className={`order-mode-toggle${className ? ` ${className}` : ""}`}>
      <button
        type="button"
        className={mode === "LIVRAISON" ? "is-active" : undefined}
        onClick={() => onModeChange("LIVRAISON")}
      >
        <DeliveryIcon />
        <span className="order-mode-toggle__copy">
          <strong>Livraison</strong>
          <em>25-45 min</em>
        </span>
      </button>
      <button
        type="button"
        className={mode === "EMPORTER" ? "is-active" : undefined}
        onClick={() => onModeChange("EMPORTER")}
      >
        <PickupIcon />
        <span className="order-mode-toggle__copy">
          <strong>Emporter</strong>
          <em>15 min</em>
        </span>
      </button>
    </div>
  );
}
