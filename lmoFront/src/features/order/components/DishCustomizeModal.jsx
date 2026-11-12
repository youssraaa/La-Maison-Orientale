import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice } from "../../menu/data/menuData";
import {
  DISH_CUSTOMIZATION_GROUPS,
  buildOptionsSummary,
  buildSelectedOptions,
  computeCustomizationPrice,
  validateCustomizationSelections,
} from "../utils/dishCustomization";

function InfoIcon() {
  return (
    <span className="dish-modal__info" aria-hidden="true">
      i
    </span>
  );
}

export default function DishCustomizeModal({ open, item, categoryTitle, image, onConfirm, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showRequiredHint, setShowRequiredHint] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setQuantity(1);
    setSelections({});
    setExpandedGroups({});
    setShowRequiredHint(false);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, item?.id, onClose]);

  const unitPrice = useMemo(
    () => computeCustomizationPrice(item?.price, selections),
    [item?.price, selections]
  );

  const totalPrice = unitPrice * quantity;

  const isReady = useMemo(
    () => validateCustomizationSelections(selections) === null,
    [selections]
  );

  if (!open || !item) return null;

  function toggleChoice(group, choiceId) {
    setSelections((prev) => {
      const current = prev[group.id] || [];
      if (group.type === "radio") {
        return { ...prev, [group.id]: [choiceId] };
      }
      const next = current.includes(choiceId)
        ? current.filter((id) => id !== choiceId)
        : [...current, choiceId];
      return { ...prev, [group.id]: next };
    });
    setShowRequiredHint(false);
  }

  function handleConfirm() {
    const missing = validateCustomizationSelections(selections);
    if (missing) {
      setShowRequiredHint(true);
      return;
    }

    onConfirm?.({
      platId: item.id,
      name: item.name,
      basePrice: Number(item.price),
      price: unitPrice,
      quantity,
      selections,
      options: buildSelectedOptions(selections),
      optionsSummary: buildOptionsSummary(selections),
    });
  }

  return createPortal(
    <div
      className="dish-modal__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="dish-modal" role="dialog" aria-modal="true" aria-labelledby="dish-modal-title">
        <button type="button" className="dish-modal__close" onClick={onClose} aria-label="Fermer">
          ×
        </button>

        {image ? (
          <div className="dish-modal__hero">
            <img src={image} alt="" loading="lazy" />
          </div>
        ) : null}

        <div className="dish-modal__intro">
          <div className="dish-modal__title-row">
            <h2 id="dish-modal-title" className="dish-modal__title">
              {item.name}
            </h2>
            {item.description ? <InfoIcon /> : null}
          </div>
          <p className="dish-modal__price">{formatPrice(item.price)}</p>
          {item.description ? <p className="dish-modal__desc">{item.description}</p> : null}
        </div>

        <div className="dish-modal__scroll">
          {DISH_CUSTOMIZATION_GROUPS.map((group) => {
            const selected = selections[group.id] || [];
            const expanded = expandedGroups[group.id];
            const visibleChoices =
              expanded || !group.visibleCount
                ? group.choices
                : group.choices.slice(0, group.visibleCount);
            const hiddenCount = group.choices.length - (group.visibleCount || group.choices.length);

            return (
              <section key={group.id} className="dish-modal__group">
                <header className="dish-modal__group-head">
                  <div>
                    {categoryTitle ? <span className="dish-modal__group-kicker">{item.name}</span> : null}
                    <h3>{group.title}</h3>
                  </div>
                  <span className={`dish-modal__badge${group.required ? " dish-modal__badge--required" : ""}`}>
                    {group.required ? "1 Obligatoire" : "Facultatif"}
                  </span>
                </header>

                <ul className="dish-modal__choices">
                  {visibleChoices.map((choice) => {
                    const checked = selected.includes(choice.id);
                    return (
                      <li key={choice.id}>
                        <label className={`dish-modal__choice${checked ? " is-selected" : ""}`}>
                          <input
                            type={group.type === "radio" ? "radio" : "checkbox"}
                            name={`dish-option-${group.id}`}
                            checked={checked}
                            onChange={() => toggleChoice(group, choice.id)}
                          />
                          <span className="dish-modal__choice-label">
                            {choice.label}
                            <InfoIcon />
                          </span>
                          {choice.price > 0 ? (
                            <strong className="dish-modal__choice-price">+{formatPrice(choice.price)}</strong>
                          ) : null}
                        </label>
                      </li>
                    );
                  })}
                </ul>

                {hiddenCount > 0 ? (
                  <button
                    type="button"
                    className="dish-modal__toggle-list"
                    onClick={() =>
                      setExpandedGroups((prev) => ({ ...prev, [group.id]: !expanded }))
                    }
                  >
                    {expanded ? "Moins afficher" : `Voir ${hiddenCount} plus`}
                  </button>
                ) : null}
              </section>
            );
          })}

          {showRequiredHint ? (
            <div className="dish-modal__hint" role="status">
              <strong>Découvrez ce que vous avez raté</strong>
              <p>
                N&apos;oubliez pas de choisir toutes vos options pour cet article. Vous y êtes presque.
              </p>
            </div>
          ) : null}
        </div>

        <footer className="dish-modal__footer">
          <div className="dish-modal__stepper">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              aria-label="Diminuer"
            >
              −
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Augmenter">
              +
            </button>
          </div>
          <button
            type="button"
            className="dish-modal__submit"
            onClick={handleConfirm}
            disabled={!isReady}
            aria-disabled={!isReady}
          >
            Ajouter {formatPrice(totalPrice)}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
