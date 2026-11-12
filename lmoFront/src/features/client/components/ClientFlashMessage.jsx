export default function ClientFlashMessage({ tone = "success", children, onDismiss }) {
  if (!children) return null;

  return (
    <div className={`client-flash client-flash--${tone}`} role="status">
      <p>{children}</p>
      {onDismiss ? (
        <button type="button" className="client-flash__close" onClick={onDismiss} aria-label="Fermer">
          ×
        </button>
      ) : null}
    </div>
  );
}
