import { Link } from "react-router-dom";

function EditorialSection({
  label,
  title,
  paragraphs,
  linkTo,
  linkLabel,
  imageSrc,
  imageAlt,
  reverse = false,
  alt = false,
}) {
  const content = (
    <div className="editorial__content">
      {label && <p className="editorial__label">{label}</p>}
      <h2 className="editorial__title">{title}</h2>
      {paragraphs.map((text, index) => (
        <p key={index} className="editorial__text">
          {text}
        </p>
      ))}
      {linkTo && linkLabel && (
        <Link to={linkTo} className="editorial__link">
          {linkLabel}
        </Link>
      )}
    </div>
  );

  const media = (
    <div className="editorial__media">
      <img src={imageSrc} alt={imageAlt} loading="lazy" />
    </div>
  );

  return (
    <section
      className={`editorial ${reverse ? "editorial--reverse" : ""} ${alt ? "editorial--alt" : ""}`}
    >
      <div className="editorial__inner">
        {reverse ? (
          <>
            {media}
            {content}
          </>
        ) : (
          <>
            {content}
            {media}
          </>
        )}
      </div>
    </section>
  );
}

export default EditorialSection;
