export default function ClientListPagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  totalCount,
  onPageChange,
}) {
  if (totalCount === 0) return null;

  return (
    <div className="client-list-pagination">
      <p className="client-list-pagination__info">
        Affichage de {rangeStart} à {rangeEnd} sur {totalCount} élément{totalCount > 1 ? "s" : ""}
      </p>
      {totalPages > 1 ? (
        <nav className="client-list-pagination__nav" aria-label="Pagination">
          <button
            type="button"
            className="client-list-pagination__btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Préc.
          </button>
          <span className="client-list-pagination__page">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="client-list-pagination__btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Suiv.
          </button>
        </nav>
      ) : null}
    </div>
  );
}
