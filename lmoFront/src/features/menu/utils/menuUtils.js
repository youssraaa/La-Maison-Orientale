export function mapApiCategory(cat) {
  const mapItem = (item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price != null ? Number(item.price) : null,
    featured: item.featured,
    imageUrl: item.imageUrl || null,
    disponibleEmporter: item.disponibleEmporter !== false,
    disponibleLivraison: item.disponibleLivraison !== false,
  });
  const subsections = (cat.subsections || [])
    .map((sub) => ({
      title: sub.title,
      items: (sub.items || []).map(mapItem),
    }))
    .filter((sub) => sub.items.length > 0);

  return {
    id: cat.id,
    title: cat.title,
    image: cat.image,
    note: cat.note,
    items: subsections.length > 0 ? [] : (cat.items || []).map(mapItem),
    subsections: subsections.length > 0 ? subsections : null,
  };
}

export function countMenuItems(categories) {
  return categories.reduce((total, cat) => {
    let n = total + (cat.items?.length || 0);
    (cat.subsections || []).forEach((sub) => {
      n += sub.items?.length || 0;
    });
    return n;
  }, 0);
}

export function flattenCategoryItems(category) {
  if (category.subsections?.length > 0) {
    return category.subsections.flatMap((sub) =>
      (sub.items || []).map((item) => ({ ...item, subsection: sub.title }))
    );
  }
  return (category.items || []).map((item) => ({ ...item, subsection: null }));
}

export function filterCategories(categories, query) {
  const q = query.trim().toLowerCase();
  if (!q) return categories;

  return categories
    .map((cat) => {
      if (cat.subsections?.length > 0) {
        const subsections = cat.subsections
          .map((sub) => ({
            ...sub,
            items: sub.items.filter(
              (item) =>
                item.name.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
            ),
          }))
          .filter((sub) => sub.items.length > 0);
        return subsections.length > 0 ? { ...cat, subsections, items: [] } : null;
      }
      const items = (cat.items || []).filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
      return items.length > 0 ? { ...cat, items } : null;
    })
    .filter(Boolean);
}
