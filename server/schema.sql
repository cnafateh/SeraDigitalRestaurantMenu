CREATE TABLE IF NOT EXISTS venues (
  id text PRIMARY KEY,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  hours text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'EUR',
  template text NOT NULL CHECK (template IN ('pizzeria','traditional','fastfood','cafe','gelato')),
  hero_image text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id text NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  slug text NOT NULL,
  category text NOT NULL,
  name text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  ingredients jsonb NOT NULL DEFAULT '[]',
  allergens jsonb NOT NULL DEFAULT '[]',
  tags jsonb NOT NULL DEFAULT '[]',
  variants jsonb NOT NULL DEFAULT '[]',
  featured boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(venue_id, slug)
);
CREATE INDEX IF NOT EXISTS menu_items_venue_order_idx ON menu_items (venue_id, sort_order);
