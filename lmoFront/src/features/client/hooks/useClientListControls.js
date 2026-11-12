import { useEffect, useMemo, useState } from "react";

export function useClientListControls(items, { filterFn, defaultPageSize = 10 } = {}) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    if (!filterFn) return items;
    return items.filter((item) => filterFn(item, q));
  }, [items, query, filterFn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);

  return {
    query,
    setQuery,
    pageSize,
    setPageSize,
    page: safePage,
    setPage,
    filtered,
    paginated,
    totalPages,
    totalCount: filtered.length,
    rangeStart,
    rangeEnd,
  };
}
