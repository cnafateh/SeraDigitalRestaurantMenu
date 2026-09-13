import { getDish } from "./data/menu";
import { useRoute } from "./hooks/use-route";
import { DishPage } from "./pages/dish-page";
import { MenuPage } from "./pages/menu-page";
import { NotFoundPage } from "./pages/not-found-page";

export function App() {
  const path = useRoute();

  if (path === "/" || path === "/menu") return <MenuPage />;

  if (path.startsWith("/dish/")) {
    const slug = decodeURIComponent(path.slice("/dish/".length));
    const dish = getDish(slug);
    return dish ? <DishPage dish={dish} /> : <NotFoundPage />;
  }

  return <NotFoundPage />;
}
