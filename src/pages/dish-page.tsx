import { useEffect, useMemo, useState } from "react";
import { DietaryBadge } from "../components/badge";
import { ArrowLeftIcon, ChevronIcon, ClockIcon } from "../components/icons";
import { SiteHeader } from "../components/site-header";
import { dishes } from "../data/menu";
import { RouteLink } from "../hooks/use-route";
import type { Dish } from "../types/menu";

export function DishPage({ dish }: { dish: Dish }) {
  const defaultVariant = dish.variants[Math.min(1, dish.variants.length - 1)];
  const [variantId, setVariantId] = useState(defaultVariant.id);
  const variant = dish.variants.find((item) => item.id === variantId) ?? defaultVariant;
  const alternatives = useMemo(() => dishes.filter((item) => item.slug !== dish.slug && !item.soldOut).slice(0, 2), [dish.slug]);

  useEffect(() => {
    setVariantId(dish.variants[Math.min(1, dish.variants.length - 1)].id);
    document.title = `${dish.name} · Sera`;
  }, [dish]);

  return (
    <main className="detail-page">
      <SiteHeader dark />

      <article className="detail-layout">
        <div className="detail-media">
          <img src={dish.image} alt={dish.name} width="1280" height="853" />
          <span className="detail-media__number">{dish.number}</span>
          <RouteLink className="floating-back" href="/"><ArrowLeftIcon /> Menu</RouteLink>
          <span className="detail-media__category">{dish.category}</span>
        </div>

        <div className="detail-panel">
          <section className="detail-overview">
            <p className="eyebrow">{dish.kicker}</p>
            <div className="detail-title"><h1>{dish.name}</h1><strong>${variant.price}</strong></div>
            <p className="detail-description">{dish.description}</p>
            <div className="detail-meta">
              <span><ClockIcon />{dish.prepTime}</span>
              <div className="badge-list">{dish.badges.map((badge) => <DietaryBadge key={badge.label} {...badge} />)}</div>
            </div>
            <div className="allergen-strip"><span>Allergens</span><p>{dish.allergens.join(" · ")}</p></div>
          </section>

          <section className="detail-block" aria-labelledby="portion-heading">
            <div className="block-title"><div><p className="eyebrow">Choose one</p><h2 id="portion-heading">Portion</h2></div><span>Nutrition updates with your selection</span></div>
            <fieldset className={`variant-grid${dish.variants.length === 1 ? " variant-grid--single" : ""}`} aria-labelledby="portion-heading">
              {dish.variants.map((item) => (
                <label className={`variant-option${item.id === variant.id ? " is-selected" : ""}`} key={item.id}>
                  <input type="radio" name="portion" value={item.id} checked={item.id === variant.id} onChange={() => setVariantId(item.id)} />
                  <span>{item.label}</span><strong>${item.price}</strong>
                </label>
              ))}
            </fieldset>
          </section>

          <section className="detail-block" aria-labelledby="ingredients-heading">
            <div className="block-title"><div><p className="eyebrow">What’s inside</p><h2 id="ingredients-heading">Ingredients</h2></div><span>{dish.ingredients.length} key ingredients</span></div>
            <ul className="ingredient-chips">{dish.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul>
          </section>

          <section className="detail-block nutrition-block" aria-labelledby="nutrition-heading">
            <div className="block-title"><div><p className="eyebrow">Per portion</p><h2 id="nutrition-heading">Nutrition facts</h2></div><span className="selection-pill">{variant.label}</span></div>
            <div className="nutrition-lead" aria-live="polite" aria-atomic="true">
              <div><span>Serving size</span><strong>{variant.nutrition.serving}</strong></div>
              <div><span>Energy</span><p><strong>{variant.nutrition.calories}</strong><small>kcal</small></p></div>
            </div>
            <dl className="macro-list">
              <div><dt>Protein</dt><dd>{variant.nutrition.protein}</dd></div>
              <div><dt>Carbohydrates</dt><dd>{variant.nutrition.carbs}</dd></div>
              <div><dt>Total fat</dt><dd>{variant.nutrition.fat}</dd></div>
            </dl>
            <details className="nutrition-more" open>
              <summary><span>More nutrition<small>Fiber, sugars & sodium</small></span><ChevronIcon /></summary>
              <dl>
                <div><dt>Dietary fiber</dt><dd>{variant.nutrition.fiber}</dd></div>
                <div><dt>Total sugars</dt><dd>{variant.nutrition.sugars}</dd></div>
                <div><dt>Sodium</dt><dd>{variant.nutrition.sodium}</dd></div>
              </dl>
            </details>
            <p className="nutrition-disclaimer">Values are estimated from standard recipes and may vary slightly by preparation.</p>
          </section>
        </div>
      </article>

      <section className="more-dishes" aria-labelledby="more-heading">
        <div className="more-dishes__heading"><div><p className="eyebrow">Still looking?</p><h2 id="more-heading">Continue exploring</h2></div><RouteLink href="/">View full menu</RouteLink></div>
        <div className="more-dishes__grid">
          {alternatives.map((item) => (
            <RouteLink href={`/dish/${item.slug}`} className="mini-dish" key={item.slug}>
              <img src={item.image} alt="" width="1280" height="853" loading="lazy" />
              <div><span>{item.category}</span><h3>{item.name}</h3><p>From ${Math.min(...item.variants.map((choice) => choice.price))}</p></div>
            </RouteLink>
          ))}
        </div>
      </section>
    </main>
  );
}
