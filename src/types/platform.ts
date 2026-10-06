export type Template =
  "pizzeria" | "traditional" | "fastfood" | "cafe" | "gelato";
export type Venue = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  location: string;
  hours: string;
  currency: string;
  template: Template;
  heroImage: string;
  published: boolean;
};
export type Variant = { label: string; price: number };
export type MenuItem = {
  id: string;
  venueId: string;
  slug: string;
  category: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  ingredients: string[];
  allergens: string[];
  tags: string[];
  variants: Variant[];
  featured: boolean;
  available: boolean;
  sortOrder: number;
};
export type Menu = { venue: Venue; items: MenuItem[] };
export const templateNames: Record<Template, string> = {
  pizzeria: "Pizzeria",
  traditional: "Traditional",
  fastfood: "Fast food",
  cafe: "Café",
  gelato: "Gelato & juice",
};
