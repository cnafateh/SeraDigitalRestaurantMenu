import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api } from "../lib/api";
import { RouteLink } from "../hooks/use-route";
import {
  templateNames,
  type MenuItem,
  type Template,
  type Venue,
} from "../types/platform";

const emptyVenue = (): Venue => ({
  id: "",
  name: "",
  tagline: "",
  description: "",
  location: "",
  hours: "",
  currency: "EUR",
  template: "pizzeria",
  heroImage: "",
  published: false,
});
const emptyItem = (venueId: string): MenuItem => ({
  id: "00000000-0000-0000-0000-000000000000",
  venueId,
  slug: "",
  category: "",
  name: "",
  subtitle: "",
  description: "",
  image: "",
  ingredients: [],
  allergens: [],
  tags: [],
  variants: [{ label: "Regular", price: 0 }],
  featured: false,
  available: true,
  sortOrder: 0,
});
const split = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedId, setSelectedId] = useState("forno");
  const [venue, setVenue] = useState<Venue>(emptyVenue());
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [isNewVenue, setIsNewVenue] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Dashboard · Sera";
    api
      .session()
      .then(() => setAuthenticated(true))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    if (!authenticated) return;
    api
      .adminVenues()
      .then((data) => {
        setVenues(data);
        if (!data.some((v) => v.id === selectedId))
          setSelectedId(data[0]?.id ?? "");
      })
      .catch((e: Error) => setError(e.message));
  }, [authenticated]);
  useEffect(() => {
    if (!authenticated || !selectedId || isNewVenue) return;
    api
      .adminMenu(selectedId)
      .then((data) => {
        setVenue(data.venue);
        setItems(data.items);
        setEditing(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [authenticated, selectedId, isNewVenue]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.login(password);
      setAuthenticated(true);
      setPassword("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await api.logout();
    setAuthenticated(false);
    setVenues([]);
  }
  async function saveVenue(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api.saveVenue(venue, isNewVenue);
      setVenue(result);
      setSelectedId(result.id);
      setIsNewVenue(false);
      setVenues(await api.adminVenues());
      setMessage("Venue saved. Your public menu is ready to preview.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function saveItem(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.saveItem(editing, isNewItem);
      const data = await api.adminMenu(venue.id);
      setItems(data.items);
      setEditing(null);
      setMessage("Menu item saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function deleteItem() {
    if (!editing || isNewItem || !window.confirm(`Delete ${editing.name}?`))
      return;
    setBusy(true);
    setError("");
    try {
      await api.deleteItem(editing.id);
      setItems(items.filter((i) => i.id !== editing.id));
      setEditing(null);
      setMessage("Menu item deleted.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File, field: "heroImage" | "image") {
    setBusy(true);
    setError("");
    try {
      const result = await api.upload(file);
      if (field === "heroImage")
        setVenue((v) => ({ ...v, heroImage: result.url }));
      else setEditing((i) => (i ? { ...i, image: result.url } : i));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (checking) return <div className="admin-loading">Opening dashboard…</div>;
  if (!authenticated)
    return (
      <main className="admin-login">
        <div className="login-art">
          <span className="brand-mark">
            SERA<span>✳</span>
          </span>
          <h1>
            Your menu,
            <br />
            <em>your way.</em>
          </h1>
          <p>Beautiful experiences begin behind the scenes.</p>
        </div>
        <form onSubmit={login} className="login-form">
          <p className="micro-label">THE STUDIO / PRIVATE ACCESS</p>
          <h2>Welcome back.</h2>
          <p>Sign in to shape your menu.</p>
          <label>
            Admin password
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy}>
            Enter dashboard <span>→</span>
          </button>
          <RouteLink href="/">← Back to experiences</RouteLink>
        </form>
      </main>
    );
  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark">
            SERA<span>✳</span>
          </span>
          <small>STUDIO</small>
        </div>
        <div className="sidebar-label">YOUR SPACES</div>
        <nav aria-label="Venues">
          {venues.map((v) => (
            <button
              key={v.id}
              className={selectedId === v.id && !isNewVenue ? "active" : ""}
              onClick={() => {
                setIsNewVenue(false);
                setSelectedId(v.id);
                setMessage("");
              }}
            >
              <span>{v.name.slice(0, 1)}</span>
              <div>
                {v.name}
                <small>{templateNames[v.template]}</small>
              </div>
            </button>
          ))}
        </nav>
        <button
          className="new-venue"
          onClick={() => {
            setVenue(emptyVenue());
            setItems([]);
            setEditing(null);
            setIsNewVenue(true);
            setMessage("");
          }}
        >
          ＋ New venue
        </button>
        <div className="sidebar-bottom">
          <RouteLink href="/">↗ View collection</RouteLink>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="micro-label">MENU MANAGEMENT</p>
            <h1>
              {isNewVenue ? "Create a new space" : venue.name || "Your space"}
            </h1>
          </div>
          {!isNewVenue && (
            <RouteLink
              href={`/menu/${venue.id}?preview=1`}
              className="preview-button"
            >
              Preview live menu ↗
            </RouteLink>
          )}
        </header>
        <div className="admin-content">
          {message && (
            <div className="form-success" role="status">
              {message}
            </div>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <div className="admin-tabs">
            <a href="#identity">Identity & template</a>
            <a href="#menu-items">Menu items</a>
          </div>
          <section id="identity" className="admin-panel">
            <div className="panel-title">
              <div>
                <p className="micro-label">01 / THE LOOK</p>
                <h2>Make it yours.</h2>
              </div>
              <p>Every change here shapes your public menu.</p>
            </div>
            <form onSubmit={saveVenue}>
              <div className="form-grid">
                <Field label="Venue name">
                  <input
                    value={venue.name}
                    onChange={(e) =>
                      setVenue({ ...venue, name: e.target.value })
                    }
                    required
                    maxLength={100}
                  />
                </Field>
                <Field label="Menu URL">
                  <div className="input-prefix">
                    <span>/menu/</span>
                    <input
                      value={venue.id}
                      disabled={!isNewVenue}
                      onChange={(e) =>
                        setVenue({
                          ...venue,
                          id: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      required
                      minLength={2}
                    />
                  </div>
                </Field>
                <Field label="Tagline">
                  <input
                    value={venue.tagline}
                    onChange={(e) =>
                      setVenue({ ...venue, tagline: e.target.value })
                    }
                    maxLength={200}
                  />
                </Field>
                <Field label="Location">
                  <input
                    value={venue.location}
                    onChange={(e) =>
                      setVenue({ ...venue, location: e.target.value })
                    }
                  />
                </Field>
                <Field label="Opening hours">
                  <input
                    value={venue.hours}
                    onChange={(e) =>
                      setVenue({ ...venue, hours: e.target.value })
                    }
                  />
                </Field>
                <Field label="Currency code">
                  <input
                    value={venue.currency}
                    onChange={(e) =>
                      setVenue({
                        ...venue,
                        currency: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={3}
                    required
                  />
                </Field>
                <Field label="Description" wide>
                  <textarea
                    value={venue.description}
                    onChange={(e) =>
                      setVenue({ ...venue, description: e.target.value })
                    }
                    rows={3}
                  />
                </Field>
              </div>
              <div className="template-picker">
                <span className="field-label">Choose a template</span>
                <div className="template-options">
                  {(Object.keys(templateNames) as Template[]).map(
                    (template) => (
                      <button
                        key={template}
                        type="button"
                        className={`template-option template-option--${template} ${venue.template === template ? "active" : ""}`}
                        onClick={() => setVenue({ ...venue, template })}
                      >
                        <span className="template-swatch">✳</span>
                        <strong>{templateNames[template]}</strong>
                        <small>
                          {venue.template === template
                            ? "Selected"
                            : "Select style"}
                        </small>
                      </button>
                    ),
                  )}
                </div>
              </div>
              <ImageField
                label="Hero image"
                value={venue.heroImage}
                onChange={(value) => setVenue({ ...venue, heroImage: value })}
                onUpload={(file) => upload(file, "heroImage")}
              />
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={venue.published}
                  onChange={(e) =>
                    setVenue({ ...venue, published: e.target.checked })
                  }
                />{" "}
                Published and visible in the collection
              </label>
              <button className="save-button" disabled={busy}>
                {busy
                  ? "Saving…"
                  : isNewVenue
                    ? "Create venue →"
                    : "Save venue →"}
              </button>
            </form>
          </section>
          {!isNewVenue && (
            <section id="menu-items" className="admin-panel">
              <div className="panel-title">
                <div>
                  <p className="micro-label">02 / THE MENU</p>
                  <h2>The good stuff.</h2>
                </div>
                <button
                  className="add-button"
                  onClick={() => {
                    setEditing(emptyItem(venue.id));
                    setIsNewItem(true);
                    setMessage("");
                  }}
                >
                  ＋ Add item
                </button>
              </div>
              <div className="item-list">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setEditing(item);
                      setIsNewItem(false);
                      setMessage("");
                    }}
                  >
                    <img src={item.image || venue.heroImage} alt="" />
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.category} ·{" "}
                        {item.available ? "Available" : "Sold out"}
                      </small>
                    </div>
                    <span>
                      {item.variants[0]?.price} {venue.currency}
                    </span>
                    <b>↗</b>
                  </button>
                ))}
                {!items.length && (
                  <p>
                    No items yet. Add your first dish to bring the menu to life.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
      {editing && (
        <div
          className="editor-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <section
            className="item-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="item-editor-title"
          >
            <header>
              <div>
                <p className="micro-label">MENU ITEM</p>
                <h2 id="item-editor-title">
                  {isNewItem ? "Add something good" : `Edit ${editing.name}`}
                </h2>
              </div>
              <button
                aria-label="Close editor"
                onClick={() => setEditing(null)}
              >
                ✕
              </button>
            </header>
            <form onSubmit={saveItem}>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="form-grid">
                <Field label="Name">
                  <input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        name: e.target.value,
                        ...(isNewItem
                          ? {
                              slug: e.target.value
                                .toLowerCase()
                                .trim()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-|-$/g, ""),
                            }
                          : {}),
                      })
                    }
                    required
                  />
                </Field>
                <Field label="URL slug">
                  <input
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, ""),
                      })
                    }
                    required
                  />
                </Field>
                <Field label="Category">
                  <input
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                    required
                    placeholder="Pizza, Drinks…"
                  />
                </Field>
                <Field label="Short line">
                  <input
                    value={editing.subtitle}
                    onChange={(e) =>
                      setEditing({ ...editing, subtitle: e.target.value })
                    }
                  />
                </Field>
                <Field label="Description" wide>
                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    rows={3}
                  />
                </Field>
                <Field label="Ingredients, separated by commas" wide>
                  <input
                    key={editing.id}
                    defaultValue={editing.ingredients.join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        ingredients: split(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Allergens, separated by commas">
                  <input
                    key={editing.id}
                    defaultValue={editing.allergens.join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        allergens: split(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Tags, separated by commas">
                  <input
                    key={editing.id}
                    defaultValue={editing.tags.join(", ")}
                    onChange={(e) =>
                      setEditing({ ...editing, tags: split(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Sort order">
                  <input
                    type="number"
                    value={editing.sortOrder}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        sortOrder: Number(e.target.value),
                      })
                    }
                  />
                </Field>
              </div>
              <ImageField
                label="Dish image"
                value={editing.image}
                onChange={(value) => setEditing({ ...editing, image: value })}
                onUpload={(file) => upload(file, "image")}
              />
              <div className="variant-editor">
                <div>
                  <span className="field-label">Sizes & prices</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        variants: [
                          ...editing.variants,
                          { label: "New size", price: 0 },
                        ],
                      })
                    }
                  >
                    ＋ Add size
                  </button>
                </div>
                {editing.variants.map((variant, index) => (
                  <div className="variant-row" key={index}>
                    <input
                      aria-label={`Size ${index + 1}`}
                      value={variant.label}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          variants: editing.variants.map((v, n) =>
                            n === index ? { ...v, label: e.target.value } : v,
                          ),
                        })
                      }
                      required
                    />
                    <input
                      aria-label={`Price ${index + 1}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          variants: editing.variants.map((v, n) =>
                            n === index
                              ? { ...v, price: Number(e.target.value) }
                              : v,
                          ),
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      aria-label="Remove size"
                      disabled={editing.variants.length === 1}
                      onClick={() =>
                        setEditing({
                          ...editing,
                          variants: editing.variants.filter(
                            (_, n) => n !== index,
                          ),
                        })
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) =>
                    setEditing({ ...editing, featured: e.target.checked })
                  }
                />{" "}
                Feature this item
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={editing.available}
                  onChange={(e) =>
                    setEditing({ ...editing, available: e.target.checked })
                  }
                />{" "}
                Currently available
              </label>
              <div className="editor-actions">
                {!isNewItem && (
                  <button
                    type="button"
                    className="delete-button"
                    onClick={deleteItem}
                  >
                    Delete item
                  </button>
                )}
                <button className="save-button" disabled={busy}>
                  {busy ? "Saving…" : "Save item →"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`form-field ${wide ? "form-field--wide" : ""}`}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
function ImageField({
  label,
  value,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="image-field">
      <span className="field-label">{label}</span>
      <div>
        {value && <img src={value} alt="Preview" />}
        <label className="upload-button">
          Upload image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
        <input
          aria-label={`${label} URL`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste an image URL"
        />
      </div>
    </div>
  );
}
