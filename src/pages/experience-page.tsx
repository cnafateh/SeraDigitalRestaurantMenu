import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { RouteLink } from "../hooks/use-route";
import {
  templateNames,
  type Menu,
  type MenuItem,
  type Venue,
} from "../types/platform";

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en", { style: "currency", currency }).format(value);

export function ExperiencePage({ path }: { path: string }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const segments = path.split("?")[0].split("/").filter(Boolean);
  const venueId =
    segments[0] === "menu"
      ? segments[1]
      : segments[0] === "dish"
        ? segments[1]
        : null;
  const dishSlug = segments[0] === "dish" ? segments[2] : null;
  const preview = new URLSearchParams(path.split("?")[1] ?? "").has("preview");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    (venueId
      ? (preview ? api.adminMenu(venueId) : api.menu(venueId)).then((data) => {
          if (active) setMenu(data);
        })
      : api.venues().then((data) => {
          if (active) setVenues(data.filter((v) => v.published));
        })
    )
      .catch((cause: Error) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [venueId, preview]);

  if (loading)
    return (
      <div className="loading-screen">
        <span className="brand-mark">
          SERA<span>✳</span>
        </span>
        <p>Preparing the experience...</p>
      </div>
    );
  if (error)
    return (
      <div className="loading-screen">
        <h1>Something went wrong.</h1>
        <p>{error}</p>
        <RouteLink href="/">Back to collection</RouteLink>
      </div>
    );
  if (venueId && menu) {
    const dish = dishSlug
      ? menu.items.find((item) => item.slug === dishSlug)
      : null;
    return dishSlug ? (
      dish ? (
        <DishView menu={menu} dish={dish} preview={preview} />
      ) : (
        <div className="loading-screen">
          <h1>Dish not found.</h1>
          <RouteLink href={`/menu/${venueId}`}>Back to menu</RouteLink>
        </div>
      )
    ) : (
      <VenueMenu key={venueId} menu={menu} preview={preview} />
    );
  }
  return <Collection venues={venues} />;
}

function Collection({ venues }: { venues: Venue[] }) {
  useEffect(() => {
    document.title = "Sera Studio · Digital menus with character";
  }, []);
  return (
    <main className="collection-page">
      <header className="collection-nav">
        <a className="brand-mark" href="/">
          SERA<span>✳</span>
        </a>
        <div>
          <span>THE MENU STUDIO</span>
          <RouteLink href="/admin">Dashboard ↗</RouteLink>
        </div>
      </header>
      <section className="collection-intro">
        <div className="intro-orbit" aria-hidden="true">
          <span>✳</span>
        </div>
        <p className="eyebrow">Five moods. One platform.</p>
        <h1>
          Every menu
          <br />
          <em>has a story.</em>
        </h1>
        <p>
          Explore a collection of digital dining experiences, each shaped around
          the character of its kitchen.
        </p>
        <a
          href="#experiences"
          className="round-link"
          aria-label="Explore menus"
        >
          ↓
        </a>
      </section>
      <section id="experiences" className="collection-list">
        <div className="section-heading">
          <span>01 / THE COLLECTION</span>
          <h2>Choose your appetite.</h2>
          <p>
            Different concepts, thoughtfully designed around the same flexible
            platform.
          </p>
        </div>
        <div className="venue-grid">
          {venues.map((venue, index) => (
            <RouteLink
              href={`/menu/${venue.id}`}
              className={`venue-tile venue-tile--${venue.template}`}
              key={venue.id}
            >
              <div className="venue-tile__image">
                <img
                  src={venue.heroImage}
                  alt=""
                  loading={index < 2 ? "eager" : "lazy"}
                />
                <span className="tile-index">0{index + 1}</span>
              </div>
              <div className="venue-tile__body">
                <span>{templateNames[venue.template]}</span>
                <div>
                  <h3>{venue.name}</h3>
                  <span className="tile-arrow">↗</span>
                </div>
                <p>{venue.tagline}</p>
              </div>
            </RouteLink>
          ))}
        </div>
      </section>
      <footer className="collection-footer">
        <span className="brand-mark">
          SERA<span>✳</span>
        </span>
        <p>Made for the moments before the first bite.</p>
        <RouteLink href="/admin">Manage your menu ↗</RouteLink>
      </footer>
    </main>
  );
}

function VenueMenu({ menu, preview }: { menu: Menu; preview: boolean }) {
  const { venue, items } = menu;
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category))],
    [items],
  );
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (category === "All" || item.category === category) &&
          [item.name, item.subtitle, item.description, ...item.ingredients]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
      ),
    [items, category, query],
  );
  useEffect(() => {
    document.title = `${venue.name} · Digital menu`;
  }, [venue.name]);
  return (
    <main className={`venue-page theme-${venue.template}`}>
      {preview && (
        <div className="preview-strip">
          PRIVATE PREVIEW · Changes are visible here after saving in the
          dashboard
        </div>
      )}
      <header className="venue-nav">
        <RouteLink href="/" className="back-link">
          ← <span>All experiences</span>
        </RouteLink>
        <RouteLink href={`/menu/${venue.id}`} className="venue-wordmark">
          {venue.name}
          <i>✳</i>
        </RouteLink>
        <span className="nav-hours">{venue.hours}</span>
      </header>
      <section className="venue-hero">
        <div className="venue-hero__copy">
          <p className="micro-label">
            {venue.location} <span>✳</span> {templateNames[venue.template]}
          </p>
          <h1>{venue.tagline}</h1>
          <p className="venue-description">{venue.description}</p>
          <a className="hero-cta" href="#menu-list">
            Explore the menu <span>↘</span>
          </a>
        </div>
        <div className="venue-hero__image">
          <img src={venue.heroImage} alt="" fetchPriority="high" />
          <span className="hero-image-caption">
            GOOD FOOD, GOOD MOOD · EST. TODAY
          </span>
        </div>
        <div className="hero-deco" aria-hidden="true">
          ✳
        </div>
      </section>
      <div className="ticker" aria-hidden="true">
        <span>
          MADE TO BE CRAVED ✳ FRESHLY PREPARED ✳ SHARED WITH LOVE ✳ MADE TO BE
          CRAVED ✳ FRESHLY PREPARED ✳ SHARED WITH LOVE ✳{" "}
        </span>
      </div>
      <section id="menu-list" className="menu-section">
        <div className="menu-section__intro">
          <p className="micro-label">
            THE GOOD STUFF / {String(items.length).padStart(2, "0")} ITEMS
          </p>
          <h2>
            Find your
            <br />
            <em>favourite.</em>
          </h2>
          <p>
            Browse the full menu. Ingredients and allergens are one tap away.
          </p>
        </div>
        <div className="browse-bar">
          <div className="category-pills" aria-label="Filter menu by category">
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={category === name}
                className={category === name ? "active" : ""}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <label className="menu-search">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Search menu</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the menu"
            />
          </label>
        </div>
        {visible.length ? (
          <div className="product-grid">
            {visible.map((item, index) => (
              <RouteLink
                href={`/dish/${venue.id}/${item.slug}${preview ? "?preview=1" : ""}`}
                className={`product-card ${item.featured ? "product-card--featured" : ""}`}
                key={item.id}
              >
                <div className="product-image">
                  <img
                    src={item.image || venue.heroImage}
                    alt={item.name}
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                  {item.tags[0] && (
                    <span className="product-tag">{item.tags[0]}</span>
                  )}
                  {!item.available && (
                    <span className="sold-out">Sold out</span>
                  )}
                </div>
                <div className="product-info">
                  <div>
                    <span className="micro-label">{item.category}</span>
                    <h3>{item.name}</h3>
                    <p>{item.subtitle || item.description}</p>
                  </div>
                  <div className="product-bottom">
                    <span>
                      From{" "}
                      {money(
                        Math.min(...item.variants.map((v) => v.price)),
                        venue.currency,
                      )}
                    </span>
                    <span className="product-arrow">↗</span>
                  </div>
                </div>
              </RouteLink>
            ))}
          </div>
        ) : (
          <div className="menu-empty">
            <h3>Nothing on this plate yet.</h3>
            <p>Try a different search or category.</p>
            <button
              onClick={() => {
                setCategory("All");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
      <footer className="venue-footer">
        <span>{venue.name} ✳</span>
        <p>
          {venue.location}
          <br />
          {venue.hours}
        </p>
        <RouteLink href="/">Explore more menus ↗</RouteLink>
      </footer>
    </main>
  );
}

function DishView({
  menu,
  dish,
  preview,
}: {
  menu: Menu;
  dish: MenuItem;
  preview: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const venue = menu.venue;
  useEffect(() => {
    document.title = `${dish.name} · ${venue.name}`;
    setSelected(0);
  }, [dish.name, venue.name]);
  return (
    <main className={`dish-view theme-${venue.template}`}>
      {preview && (
        <div className="preview-strip">
          PRIVATE PREVIEW · Changes are visible here after saving in the
          dashboard
        </div>
      )}
      <header className="venue-nav">
        <RouteLink
          href={`/menu/${venue.id}${preview ? "?preview=1" : ""}`}
          className="back-link"
        >
          ← <span>Back to menu</span>
        </RouteLink>
        <span className="venue-wordmark">
          {venue.name}
          <i>✳</i>
        </span>
        <span className="nav-hours">{dish.category}</span>
      </header>
      <div className="dish-view__layout">
        <div className="dish-view__image">
          <img src={dish.image || venue.heroImage} alt={dish.name} />
          <span>FRESH FROM THE KITCHEN ✳</span>
        </div>
        <article className="dish-view__details">
          <p className="micro-label">
            {dish.category} / {String(dish.sortOrder + 1).padStart(2, "0")}
          </p>
          <h1>{dish.name}</h1>
          <p className="dish-subtitle">{dish.subtitle}</p>
          <p className="dish-description">{dish.description}</p>
          <div className="dish-tags">
            {dish.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
            {!dish.available && <span>Currently unavailable</span>}
          </div>
          <div className="dish-block">
            <h2>Choose your size</h2>
            <div className="size-options">
              {dish.variants.map((variant, index) => (
                <button
                  key={index}
                  aria-pressed={selected === index}
                  className={selected === index ? "active" : ""}
                  onClick={() => setSelected(index)}
                >
                  {variant.label}
                  <strong>{money(variant.price, venue.currency)}</strong>
                </button>
              ))}
            </div>
          </div>
          <div className="dish-block">
            <h2>What makes it good</h2>
            <ul className="ingredient-list">
              {dish.ingredients.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div className="allergen-note">
            <strong>Allergens</strong>
            <p>
              {dish.allergens.length
                ? dish.allergens.join(" · ")
                : "No listed allergens in the demo recipe."}
            </p>
            <small>
              Tell the team about allergies before ordering. This demo does not
              replace kitchen advice.
            </small>
          </div>
          <RouteLink
            className="detail-back"
            href={`/menu/${venue.id}${preview ? "?preview=1" : ""}`}
          >
            ← Explore the rest of the menu
          </RouteLink>
        </article>
      </div>
    </main>
  );
}
