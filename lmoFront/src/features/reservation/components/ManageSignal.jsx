function SignalIcon({ variant }) {
  if (variant === "success") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 12.2l2.4 2.4L16 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (variant === "phone") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8.5 4.2c.4-.9 1.5-1.3 2.4-.8l1.6.9c.8.5 1.1 1.5.7 2.4l-.8 1.7c1.2 2.2 3.1 4.1 5.3 5.3l1.7-.8c.9-.4 1.9-.1 2.4.7l.9 1.6c.5.9.1 2-.8 2.4l-1.8.8c-1.3.6-2.8.2-4.2-.5-2.9-1.5-5.3-3.9-6.8-6.8-.7-1.4-1.1-2.9-.5-4.2l.8-1.8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "cancel-window") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 7.5v5.2l3.2 1.8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (variant === "cancelled") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === "error") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === "lock") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 7.5v5.2l3.2 1.8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      <path d="M10.2 4.5h3.6l7.2 14.4H3l7.2-14.4Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

export default function ManageSignal({
  variant = "lock",
  tag,
  title,
  children,
  action = null,
  phone = null,
}) {
  return (
    <div className={`manage-signal manage-signal--${variant}`} role="status">
      <div className="manage-signal__icon" aria-hidden="true">
        <SignalIcon variant={variant} />
      </div>
      <div className="manage-signal__content">
        {tag ? <p className="manage-signal__tag">{tag}</p> : null}
        {title ? <h3 className="manage-signal__title">{title}</h3> : null}
        {children ? <div className="manage-signal__text">{children}</div> : null}
        {phone?.display ? (
          <a href={phone.href} className="manage-signal__cta">
            Appeler {phone.display}
          </a>
        ) : null}
        {action ? <div className="manage-signal__action">{action}</div> : null}
      </div>
    </div>
  );
}
