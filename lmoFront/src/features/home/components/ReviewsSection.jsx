import { useEffect, useState } from "react";
import useRestaurantInfo from "../../../common/hooks/useRestaurantInfo";
import { homeReviews } from "../data/reviewsData";

const PAGE_COUNT = 3;

function Stars({ value }) {
  return (
    <span className="reviews__stars" aria-label={`${value} sur 5`}>
      {"★★★★★".slice(0, value)}
    </span>
  );
}

function ReviewsSection() {
  const { info } = useRestaurantInfo();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => {
      setVisible(mq.matches ? 1 : 3);
      setIndex(0);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const maxIndex = Math.max(0, homeReviews.length - visible);
  const shown = homeReviews.slice(index, index + visible);

  const pageForIndex = (i) => {
    if (maxIndex === 0) return 0;
    return Math.min(PAGE_COUNT - 1, Math.floor((i / maxIndex) * PAGE_COUNT));
  };

  const indexForPage = (page) => {
    if (maxIndex === 0) return 0;
    if (page <= 0) return 0;
    if (page >= PAGE_COUNT - 1) return maxIndex;
    return Math.round((page / (PAGE_COUNT - 1)) * maxIndex);
  };

  const activePage = pageForIndex(index);

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section" aria-labelledby="reviews-title">
      <div className="reviews-section__inner">
        <h2 id="reviews-title" className="reviews-section__title">
          Avis de nos clients
        </h2>
        <p className="reviews-section__subtitle">
          Ce qu&apos;ils disent de La Maison Orientale à Quaregnon
        </p>

        <div className="reviews-summary">
          <div className="reviews-summary__score">
            <span className="reviews-summary__brand">Google Avis</span>
            <div className="reviews-summary__row">
              <strong className="reviews-summary__number">
                {info.googleRating.score}
              </strong>
              <Stars value={5} />
              <span className="reviews-summary__count">
                ({info.googleRating.countLabel})
              </span>
            </div>
          </div>
          <a
            href={info.googleReviewsUrl}
            className="btn btn--gold"
            target="_blank"
            rel="noreferrer"
          >
            Laissez-nous un avis sur Google
          </a>
        </div>

        <div className="reviews-carousel">
          <button
            type="button"
            className="reviews-carousel__arrow"
            aria-label="Avis précédents"
            onClick={goPrev}
            disabled={index === 0}
          >
            ‹
          </button>

          <div className="reviews-carousel__grid">
            {shown.map((review) => (
              <article key={review.id} className="review-card">
                <header className="review-card__header">
                  <span className="review-card__avatar" aria-hidden="true">
                    {review.name.charAt(0)}
                  </span>
                  <div>
                    <p className="review-card__name">{review.name}</p>
                    <p className="review-card__when">{review.when}</p>
                  </div>
                </header>
                <Stars value={review.rating} />
                <p className="review-card__text">{review.text}</p>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="reviews-carousel__arrow"
            aria-label="Avis suivants"
            onClick={goNext}
            disabled={index >= maxIndex}
          >
            ›
          </button>
        </div>

        <div className="reviews-carousel__dots">
          {Array.from({ length: PAGE_COUNT }).map((_, page) => (
            <button
              key={page}
              type="button"
              className={
                page === activePage
                  ? "reviews-carousel__dot reviews-carousel__dot--active"
                  : "reviews-carousel__dot"
              }
              onClick={() => setIndex(indexForPage(page))}
              aria-label={`Groupe d'avis ${page + 1}`}
              aria-current={page === activePage ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;
