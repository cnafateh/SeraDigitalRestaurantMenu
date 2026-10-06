import { useRoute } from "./hooks/use-route";
import { AdminPage } from "./pages/admin-page";
import { ExperiencePage } from "./pages/experience-page";

export function App() {
  const path = useRoute();
  if (path.startsWith("/admin")) return <AdminPage />;
  return <ExperiencePage path={path} />;
}
