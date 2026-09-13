import { RouteLink } from "../hooks/use-route";
import type { Dish } from "../types/menu";
import { DietaryBadge } from "./badge";
import { ArrowRightIcon } from "./icons";

export function FoodCard({ dish, priority = false }: { dish: Dish; priority?: boolean }) {
  const lowestPrice = Math.min(...dish.variants.map((variant) => variant.price));
  const hasVariants = dish.variants.length > 1;

  const content = (
    <article className={`menu-card${dish.featured ? " menu-card--featured" : ""}${dish.soldOut ? " menu-card--sold-out" : ""}`}>
      <div className="menu-card__media">
        <img src={dish.image} alt={dish.name} width="1280" height="853" loading={priority ? "eager" : "lazy"} style={{ objectPosition: dish.imagePosition ?? "50% 50%" }} />
        <span className="menu-card__number">{dish.number}</span>
        <span className="menu-card__category">{dish.category}</span>
        {dish.soldOut && <div className="sold-out-stamp" role="status"><span>Sold out</span><small>Back tomorrow</small></div>}
      </div>
      <div className="menu-card__content">
        <div className="menu-card__title-row">
          <div><p className="eyebrow">{dish.kicker}</p><h2>{dish.name}</h2></div>
          <div className="menu-card__price" aria-label={`${hasVariants ? "Price starts at" : "Price"} ${lowestPrice} dollars`}><span>{hasVariants ? "From" : ""}</span><strong>${lowestPrice}</strong></div>
        </div>
        <p className="menu-card__description">{dish.shortDescription}</p>
        <div className="menu-card__footer">
          <div className="badge-list">{dish.badges.slice(0, 2).map((badge) => <DietaryBadge key={badge.label} {...badge} />)}</div>
          <span className="view-cue" aria-hidden="true">{dish.soldOut ? "Unavailable" : "Details"}{!dish.soldOut && <ArrowRightIcon />}</span>
        </div>
      </div>
    </article>
  );

  if (dish.soldOut) return <div className="menu-card-link" aria-disabled="true">{content}</div>;
  return <RouteLink className="menu-card-link" href={`/dish/${dish.slug}`} aria-label={`View details for ${dish.name}`}>{content}</RouteLink>;
}
