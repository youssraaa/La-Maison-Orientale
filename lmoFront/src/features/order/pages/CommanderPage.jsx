import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import { fetchPublicMenu } from "../../admin/api/publicContentApi";
import { menuCategories as fallbackCategories } from "../../menu/data/menuData";
import {
  countMenuItems,
  filterCategories,
  mapApiCategory,
} from "../../menu/utils/menuUtils";
import { useCart } from "../context/CartContext";
import { useClientAuth } from "../../../common/auth/ClientAuthContext";
import { fetchClientProfile } from "../../client/api/clientAccountApi";
import { submitCommande } from "../api/commandeApi";
import OrderCategoryNav from "../components/OrderCategoryNav";
import OrderMenuCard from "../components/OrderMenuCard";
import OrderCartPanel from "../components/OrderCartPanel";
import OrderModeChangeModal from "../components/OrderModeChangeModal";
import DishCustomizeModal from "../components/DishCustomizeModal";
import { getDishImage, getSubsectionImage } from "../utils/dishImages";
import { buildCustomizationOrderNote, isCustomizableItem } from "../utils/dishCustomization";
import { getIncompatibleCartItems } from "../utils/orderModeRules";
import { computeOrderTotals, getMinimumOrderBanner, loadOrderPolicy } from "../utils/orderPolicy";
import {
  composeDeliveryAddress,
  EMAIL_FORMAT_EXAMPLE,
  PHONE_LOCAL_EXAMPLE,
} from "../../../common/utils/contactFieldValidation";
import {
  getCheckoutErrorFocus,
  validateCheckoutForm,
  validateCheckoutOrder,
} from "../utils/checkoutValidation";
import { DEFAULT_MAX_DELIVERY_KM, validateDeliveryZone } from "../utils/deliveryZone";
import {
  normalizePaymentMethod,
} from "../utils/paymentMethods";
import {
  mapCommandeApiErrors,
  mergeApiError,
  getFormBannerMessage,
} from "../../../common/utils/formErrors";

function CommanderPage() {
  const navigate = useNavigate();
  const { items, addItem, addConfiguredItem, updateQuantity, removeItem, clearCart, totalPrice, totalItems } =
    useCart();
  const { token, user } = useClientAuth();
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [mode, setMode] = useState("EMPORTER");
  const [modeModal, setModeModal] = useState(null);
  const [customizeTarget, setCustomizeTarget] = useState(null);
  const [modeToast, setModeToast] = useState(null);
  const [form, setForm] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
    telephone: "",
    adresseRue: "",
    adresseNumero: "",
    adresseCp: "",
    adresseVille: "",
    commentaire: "",
  });
  const [step, setStep] = useState("browse");
  const [paymentMethod, setPaymentMethod] = useState("ESPECES");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [checkoutFocus, setCheckoutFocus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderPolicy, setOrderPolicy] = useState({
    fraisLivraison: 2.5,
    montantMinimumLivraison: 25,
  });

  useEffect(() => {
    loadOrderPolicy({ force: true }).then(setOrderPolicy);
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;
    fetchClientProfile(token)
      .then((profile) => {
        if (cancelled || !profile) return;
        setForm((prev) => ({
          ...prev,
          nom: prev.nom || profile.nom?.trim() || user?.nom || "",
          email: prev.email || profile.email?.trim() || user?.email || "",
          telephone: prev.telephone || profile.telephone?.trim() || "",
          adresseRue: prev.adresseRue || profile.adresseLivraison?.trim() || "",
          adresseCp: prev.adresseCp || profile.codePostalLivraison?.trim() || "",
          adresseVille: prev.adresseVille || profile.villeLivraison?.trim() || "",
        }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [token, user?.nom, user?.email]);

  useEffect(() => {
    if (!modeToast) return undefined;
    const timer = window.setTimeout(() => setModeToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [modeToast]);

  useEffect(() => {
    let cancelled = false;
    fetchPublicMenu()
      .then((cats) => {
        if (cancelled || !cats.length) return;
        const mapped = cats.map(mapApiCategory);
        if (countMenuItems(mapped) > 0) {
          setCategories(mapped);
          setActiveCategory(mapped[0]?.id ?? "");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setCategories(fallbackCategories);
        setActiveCategory(fallbackCategories[0]?.id ?? "");
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (items.length === 0 && step === "checkout") {
      setStep("browse");
    }
  }, [items.length, step]);

  const visibleCategories = useMemo(
    () => filterCategories(categories, search),
    [categories, search]
  );

  const quantityByPlatId = useMemo(() => {
    const map = new Map();
    items.forEach((i) => map.set(i.platId, i.quantite));
    return map;
  }, [items]);

  const cartTotals = useMemo(
    () => computeOrderTotals(totalPrice, mode, orderPolicy.fraisLivraison),
    [totalPrice, mode, orderPolicy.fraisLivraison]
  );

  const minimumOrderMessage = useMemo(
    () => validateCheckoutOrder(totalPrice, mode, orderPolicy),
    [totalPrice, mode, orderPolicy]
  );

  const minimumOrderBanner = useMemo(
    () => getMinimumOrderBanner(totalPrice, mode, orderPolicy),
    [totalPrice, mode, orderPolicy]
  );

  useEffect(() => {
    setPaymentMethod((current) => normalizePaymentMethod(mode, current));
  }, [mode]);

  useEffect(() => {
    if (step !== "checkout") return;
    document.querySelector(".order-cart-column")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const cartSuggestions = useMemo(() => {
    const inCart = new Set(items.map((i) => i.platId));
    const picks = [];
    categories.forEach((cat) => {
      const pool = [
        ...(cat.items || []),
        ...(cat.subsections?.flatMap((sub) => sub.items || []) || []),
      ];
      pool.forEach((item) => {
        if (picks.length >= 3) return;
        if (!item.id || inCart.has(item.id) || item.price == null) return;
        picks.push(item);
      });
    });
    return picks;
  }, [categories, items]);

  function handleFormChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setError("");
  }

  function announceModeChange(nextMode) {
    setModeToast(nextMode);
    window.requestAnimationFrame(() => {
      document
        .querySelector(".order-cart__mode-banner")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function handleModeChange(nextMode) {
    if (nextMode === mode) return;

    if (items.length === 0) {
      setMode(nextMode);
      announceModeChange(nextMode);
      return;
    }

    const incompatible = getIncompatibleCartItems(items, nextMode);
    setModeModal({ targetMode: nextMode, incompatibleItems: incompatible, cartItems: items });
  }

  function confirmModeChange() {
    if (!modeModal) return;
    if (modeModal.incompatibleItems?.length > 0) {
      modeModal.incompatibleItems.forEach((item) => removeItem(item.lineId));
    }
    setMode(modeModal.targetMode);
    announceModeChange(modeModal.targetMode);
    setModeModal(null);
  }

  function cancelModeChange() {
    setModeModal(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!items.length) {
      setError("Votre panier est vide.");
      setFieldErrors({});
      return;
    }

    const orderError = validateCheckoutOrder(totalPrice, mode, orderPolicy);
    if (orderError) {
      setError(orderError);
      setFieldErrors({});
      return;
    }

    const clientErrors = validateCheckoutForm(form, mode, { subtotal: totalPrice, orderPolicy });
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setCheckoutFocus(getCheckoutErrorFocus(clientErrors));
      setError(
        getFormBannerMessage(
          clientErrors,
          "Vérifiez les champs indiqués."
        )
      );
      return;
    }

    setCheckoutFocus(null);

    if (mode === "LIVRAISON") {
      const deliveryAddress = composeDeliveryAddress(form);
      const zoneResult = await validateDeliveryZone(deliveryAddress, form, DEFAULT_MAX_DELIVERY_KM);
      if (!zoneResult.ok) {
        setFieldErrors({ adresseCp: zoneResult.message });
        setCheckoutFocus("address");
        setError(zoneResult.message);
        return;
      }
    }

    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      const data = await submitCommande(
        {
          mode,
          nom: form.nom.trim(),
          email: form.email.trim(),
          telephone: form.telephone.trim(),
          adresseLivraison: mode === "LIVRAISON" ? composeDeliveryAddress(form) : null,
          adresseLivraisonRue:
            mode === "LIVRAISON" ? form.adresseRue.trim() || null : null,
          adresseLivraisonNumero:
            mode === "LIVRAISON" ? form.adresseNumero.trim() || null : null,
          codePostalLivraison: mode === "LIVRAISON" ? form.adresseCp.trim() || null : null,
          villeLivraison: mode === "LIVRAISON" ? form.adresseVille.trim() || null : null,
          commentaire: [form.commentaire.trim(), buildCustomizationOrderNote(items)]
            .filter(Boolean)
            .join("\n\n") || null,
          modePaiement: paymentMethod,
          lignes: items.map((i) => ({ platId: i.platId, quantite: i.quantite })),
        },
        token
      );
      clearCart();
      navigate(`/commande/confirmation/${data.manageToken}`);
    } catch (err) {
      const mapped = mapCommandeApiErrors(mergeApiError(err, { adresseLivraison: "adresseCp" }));
      setFieldErrors(mapped);
      setError(getFormBannerMessage(mapped, "Impossible d'envoyer la commande."));
    } finally {
      setLoading(false);
    }
  }

  function isAvailableForCurrentMode(item) {
    if (!item) return true;
    if (mode === "EMPORTER") return item.disponibleEmporter !== false;
    if (mode === "LIVRAISON") return item.disponibleLivraison !== false;
    return true;
  }

  function handleItemClick(item, category, subsectionTitle = null) {
    if (!item?.id || item.price == null) return;

    if (!isAvailableForCurrentMode(item)) return;

    if (isCustomizableItem(item, category)) {
      setCustomizeTarget({
        item,
        category,
        subsectionTitle,
        image: getDishImage(item, category, subsectionTitle),
      });
      return;
    }

    addItem({ id: item.id, name: item.name, price: item.price });
  }

  function handleCustomizeConfirm(configuredItem) {
    addConfiguredItem(configuredItem);
    setCustomizeTarget(null);
  }

  function renderOrderMenuCard(item, category, subsectionTitle = null) {
    const unavailable = isAvailableForCurrentMode(item) ? null : mode;
    return (
      <OrderMenuCard
        item={item}
        image={getDishImage(item, category, subsectionTitle)}
        quantity={item.id ? quantityByPlatId.get(item.id) || 0 : 0}
        onOpen={() => handleItemClick(item, category, subsectionTitle)}
        modeUnavailable={unavailable}
      />
    );
  }

  function renderCategoryItems(category) {
    if (category.subsections?.length > 0) {
      return category.subsections.map((sub) => {
        const subsectionImage = getSubsectionImage(sub.title);

        return (
          <div key={sub.title} className="order-section__subsection">
            <div className="order-section__subsection-head">
              <h3 className="order-section__subtitle">{sub.title}</h3>
              {subsectionImage ? (
                <div className="order-section__subsection-banner">
                  <img src={subsectionImage} alt="" loading="lazy" />
                </div>
              ) : null}
            </div>
            <ul className="order-section__list">
              {sub.items.map((item) => (
                <li key={`${sub.title}-${item.name}`}>
                  {renderOrderMenuCard(item, category, sub.title)}
                </li>
              ))}
            </ul>
          </div>
        );
      });
    }

    return (
      <ul className="order-section__list">
        {(category.items || []).map((item) => (
          <li key={item.name}>
            {renderOrderMenuCard(item, category)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <main className="page commander-page">
      <PublicNavbar />

      <div className="commander-page__body">
          <nav className="order-nav order-nav--mobile" aria-label="Catégories">
            <div className="order-nav__scroll">
              {visibleCategories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#order-${cat.id}`}
                  className={activeCategory === cat.id ? "is-active" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategory(cat.id);
                    document.getElementById(`order-${cat.id}`)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  {cat.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="order-shop">
            <div className="order-shop__catalog order-shop__catalog--framed">
              <header className="order-shop-header">
                <div className="order-shop-header__brand">
                  <p className="order-shop-header__kicker">La Maison Orientale</p>
                  <h1>Commander</h1>
                  <p className="order-shop-header__lead">À emporter ou en livraison</p>
                </div>
                <label className="order-shop-search order-shop-search--footer">
                  <span className="visually-hidden">Rechercher un plat</span>
                  <input
                    type="search"
                    placeholder="Rechercher un plat…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </header>

              <div className="order-shop__columns">
                <OrderCategoryNav
                  categories={visibleCategories}
                  activeId={activeCategory}
                  onSelect={setActiveCategory}
                />

                <div className="order-shop__menu">
                  {!loaded ? (
                    <p className="menu-ops-loading" aria-live="polite">
                      Chargement de la carte…
                    </p>
                  ) : null}
                  {loaded && visibleCategories.length === 0 ? (
                    <p className="order-shop__empty-search">
                      Aucun plat ne correspond à votre recherche.
                    </p>
                  ) : null}
                  {visibleCategories.map((category, index) => (
                    <section
                      key={category.id}
                      id={`order-${category.id}`}
                      className={`order-section order-section--${index % 2 === 0 ? "burgundy" : "pine"}`}
                    >
                      <div className="order-section__head">
                        <h2 className="order-section__title">{category.title}</h2>
                        {category.note ? (
                          <p className="order-section__note">{category.note}</p>
                        ) : null}
                      </div>
                      <div className="order-section__body">{renderCategoryItems(category)}</div>
                    </section>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-cart-column">
              <OrderCartPanel
                items={items}
                totalPrice={totalPrice}
                deliveryFee={cartTotals.deliveryFee}
                orderTotal={cartTotals.total}
                totalItems={totalItems}
                mode={mode}
                onModeChange={handleModeChange}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                suggestions={cartSuggestions}
                onAddSuggestion={(item) =>
                  addItem({ id: item.id, name: item.name, price: item.price })
                }
                onCheckout={() => {
                  setError("");
                  setFieldErrors({});
                  const orderError = validateCheckoutOrder(totalPrice, mode, orderPolicy);
                  if (orderError) {
                    setError(orderError);
                    return;
                  }
                  setStep("checkout");
                }}
                minimumOrderMessage={minimumOrderMessage}
                minimumOrderBanner={minimumOrderBanner}
                checkout={step === "checkout"}
                checkoutProps={{
                  form,
                  onFormChange: handleFormChange,
                  fieldErrors,
                  mode,
                  onModeChange: handleModeChange,
                  items,
                  totalPrice,
                  deliveryFee: cartTotals.deliveryFee,
                  orderTotal: cartTotals.total,
                  paymentMethod,
                  onPaymentMethodChange: setPaymentMethod,
                  checkoutFocus,
                  onClearCheckoutFocus: () => setCheckoutFocus(null),
                  onBack: () => setStep("browse"),
                  onSubmit: handleSubmit,
                  loading,
                  error,
                  maxDeliveryKm: DEFAULT_MAX_DELIVERY_KM,
                  emailExample: EMAIL_FORMAT_EXAMPLE,
                  phoneExample: PHONE_LOCAL_EXAMPLE,
                }}
              />
            </div>
          </div>

          {totalItems > 0 ? (
            <div className="order-cart-bar">
              <button
                type="button"
                className="order-cart-bar__btn"
                onClick={() => {
                  if (step === "checkout") {
                    document.querySelector(".order-cart-column")?.scrollIntoView({ behavior: "smooth" });
                    return;
                  }
                  document.querySelector(".order-cart")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {step === "checkout"
                  ? `Paiement · ${cartTotals.total.toFixed(2).replace(".", ",")} €`
                  : `Panier (${totalItems}) · ${cartTotals.total.toFixed(2).replace(".", ",")} €`}
              </button>
            </div>
          ) : null}

          {modeToast ? (
            <div className="order-mode-toast" role="status" aria-live="polite">
              {modeToast === "LIVRAISON"
                ? `Mode livraison activé${
                    orderPolicy.fraisLivraison > 0
                      ? ` (+ ${orderPolicy.fraisLivraison.toFixed(2).replace(".", ",")} € de frais)`
                      : ""
                  }`
                : "Mode emporter activé — retrait au restaurant"}
            </div>
          ) : null}

          <OrderModeChangeModal
            open={Boolean(modeModal)}
            targetMode={modeModal?.targetMode}
            cartItems={modeModal?.cartItems ?? []}
            incompatibleItems={modeModal?.incompatibleItems ?? []}
            onConfirm={confirmModeChange}
            onCancel={cancelModeChange}
          />

          <DishCustomizeModal
            open={Boolean(customizeTarget)}
            item={customizeTarget?.item}
            categoryTitle={customizeTarget?.category?.title}
            image={customizeTarget?.image}
            onConfirm={handleCustomizeConfirm}
            onClose={() => setCustomizeTarget(null)}
          />
        </div>

      <SiteFooter />
    </main>
  );
}

export default CommanderPage;
