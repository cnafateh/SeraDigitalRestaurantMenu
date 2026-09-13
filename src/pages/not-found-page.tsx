import { RouteLink } from "../hooks/use-route";
import { ArrowLeftIcon } from "../components/icons";

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <span>404</span>
      <p className="eyebrow">Off the menu</p>
      <h1>We couldn’t find that dish.</h1>
      <RouteLink href="/"><ArrowLeftIcon /> Return to the menu</RouteLink>
    </main>
  );
}
