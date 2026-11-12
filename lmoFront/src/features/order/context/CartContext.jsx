import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildCustomizationLineId } from "../utils/dishCustomization";

const CartContext = createContext(null);
const STORAGE_KEY = "lmo_cart";

export const useCart = () => useContext(CartContext);

function normalizeCartItem(item, index = 0) {
  return {
    lineId: item.lineId || `legacy-${item.platId}-${index}`,
    platId: item.platId,
    nom: item.nom,
    prix: Number(item.prix),
    quantite: Number(item.quantite) || 1,
    basePrice: item.basePrice != null ? Number(item.basePrice) : Number(item.prix),
    options: item.options || [],
    optionsSummary: item.optionsSummary || "",
  };
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
  } catch {
    return [];
  }
}

export default function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (plat) => {
    if (!plat?.id) return;
    setItems((prev) => {
      const existing = prev.find((entry) => entry.platId === plat.id && !entry.optionsSummary);
      if (existing) {
        return prev.map((entry) =>
          entry.lineId === existing.lineId
            ? { ...entry, quantite: entry.quantite + 1 }
            : entry
        );
      }
      return [
        ...prev,
        normalizeCartItem({
          lineId: `legacy-${plat.id}-${Date.now()}`,
          platId: plat.id,
          nom: plat.name,
          prix: Number(plat.price),
          quantite: 1,
          basePrice: Number(plat.price),
          options: [],
          optionsSummary: "",
        }),
      ];
    });
  };

  const addConfiguredItem = ({
    platId,
    name,
    basePrice,
    price,
    quantity = 1,
    options = [],
    optionsSummary = "",
    selections = {},
  }) => {
    if (!platId) return;
    const lineId = buildCustomizationLineId(platId, selections);
    setItems((prev) => {
      const existing = prev.find((entry) => entry.lineId === lineId);
      if (existing) {
        return prev.map((entry) =>
          entry.lineId === lineId
            ? { ...entry, quantite: entry.quantite + quantity }
            : entry
        );
      }
      return [
        ...prev,
        normalizeCartItem({
          lineId,
          platId,
          nom: name,
          prix: Number(price),
          quantite: quantity,
          basePrice: Number(basePrice),
          options,
          optionsSummary,
        }),
      ];
    });
  };

  const updateQuantity = (lineId, quantite) => {
    if (quantite <= 0) {
      removeItem(lineId);
      return;
    }
    setItems((prev) =>
      prev.map((entry) => (entry.lineId === lineId ? { ...entry, quantite } : entry))
    );
  };

  const removeItem = (lineId) => {
    setItems((prev) => prev.filter((entry) => entry.lineId !== lineId));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantite, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, entry) => sum + entry.prix * entry.quantite, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addConfiguredItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
