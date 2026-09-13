export type Category = "Starters" | "Pizza" | "Pasta" | "Mains" | "Desserts";

export type BadgeType = "vegetarian" | "spicy" | "gluten-free" | "signature";

export type Nutrition = {
  serving: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugars: string;
  sodium: string;
};

export type DishVariant = {
  id: string;
  label: string;
  price: number;
  nutrition: Nutrition;
};

export type Dish = {
  slug: string;
  number: string;
  name: string;
  kicker: string;
  category: Category;
  shortDescription: string;
  description: string;
  image: string;
  imagePosition?: string;
  prepTime: string;
  badges: { label: string; type: BadgeType }[];
  allergens: string[];
  ingredients: string[];
  variants: DishVariant[];
  soldOut?: boolean;
  featured?: boolean;
};
