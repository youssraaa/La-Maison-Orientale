function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

export default function ReservationAlert({ title, children, compact = false, className = "" }) {
  const classes = ["res-alert", compact && "res-alert--compact", className]
    .filter(Boolean)
    .join(" ");
  const message = typeof children === "string" ? children : null;

  return (
    <div className={classes} role="alert">
      <span className="res-alert__icon" aria-hidden="true">
        <AlertIcon />
      </span>
      <div className="res-alert__body">
        {title ? <p className="res-alert__title">{title}</p> : null}
        {message ? <p className="res-alert__text">{message}</p> : children}
      </div>
    </div>
  );
}
