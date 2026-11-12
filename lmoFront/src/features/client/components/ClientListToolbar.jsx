import { IconSearch } from "./ClientPortalIcons";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export default function ClientListToolbar({
  query,
  onQueryChange,
  placeholder = "Rechercher…",
  pageSize,
  onPageSizeChange,
  totalCount,
}) {
  return (
    <div className="client-list-toolbar">
      <div className="client-list-toolbar__left">
        {pageSize != null && onPageSizeChange ? (
          <label className="client-list-toolbar__size">
            <span>Afficher</span>
            <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>éléments</span>
          </label>
        ) : null}
        {totalCount != null ? (
          <p className="client-list-toolbar__count">{totalCount} au total</p>
        ) : null}
      </div>

      <label className="client-list-toolbar__search">
        <IconSearch />
        <span className="visually-hidden">Rechercher</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
        />
      </label>
    </div>
  );
}
