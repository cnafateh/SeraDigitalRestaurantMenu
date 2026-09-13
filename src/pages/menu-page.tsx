import { useEffect, useMemo, useState } from "react";
import { FoodCard } from "../components/food-card";
import { CloseIcon, SearchIcon } from "../components/icons";
import { SiteHeader } from "../components/site-header";
import { categories, dishes } from "../data/menu";
import type { Category } from "../types/menu";

type Filter = "All" | Category;

export function MenuPage() {
  const [category, setCategory] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  useEffect(() => { document.title = "Sera · Seasonal Dinner Menu"; }, []);

  const visibleDishes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return dishes.filter((dish) => {
      const categoryMatches = category === "All" || dish.category === category;
      const queryMatches = !normalized || [dish.name, dish.category, dish.shortDescription, ...dish.ingredients].join(" ").toLowerCase().includes(normalized);
      return categoryMatches && queryMatches;
    });
  }, [category, query]);

  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="menu-hero">
        <div className="menu-hero__copy">
          <p className="eyebrow">Season 04 · Early autumn</p>
          <h1>Dinner,<br/><em>made slowly.</em></h1>
          <p>Italian foundations, Nordic produce and a wood-fired oven at the center of the room.</p>
        </div>
        <div className="menu-hero__aside">
          <span>Kitchen hours</span>
          <strong>17:00—23:30</strong>
          <small>Last seating at 22:15</small>
        </div>
      </section>

      <section className="menu-browser" aria-labelledby="menu-heading">
        <div className="menu-browser__heading">
          <div><p className="eyebrow">À la carte</p><h2 id="menu-heading">Explore the menu</h2></div>
          <span>{visibleDishes.length.toString().padStart(2, "0")} dishes</span>
        </div>

        <div className="menu-tools">
          <label className="search-field">
            <SearchIcon />
            <span className="sr-only">Search dishes or ingredients</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes or ingredients" type="search" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><CloseIcon /></button>}
          </label>

          <div className="category-tabs" role="tablist" aria-label="Menu categories">
            {categories.map((item) => (
              <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
        </div>

        {visibleDishes.length > 0 ? (
          <div className="dish-grid">
            {visibleDishes.map((dish, index) => <FoodCard key={dish.slug} dish={dish} priority={index < 2} />)}
          </div>
        ) : (
          <div className="empty-menu">
            <span>Nothing matched</span>
            <h3>Try another ingredient or category.</h3>
            <button type="button" onClick={() => { setQuery(""); setCategory("All"); }}>Reset filters</button>
          </div>
        )}
      </section>

      <footer className="site-footer">
        <div><span className="wordmark">SERA</span><p>Contemporary neighbourhood dining.</p></div>
        <div><span>Helsinki · Finland</span><span>Demo menu · Portfolio project</span></div>
      </footer>
    </main>
  );
}
