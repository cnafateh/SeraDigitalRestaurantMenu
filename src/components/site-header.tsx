import { RouteLink } from "../hooks/use-route";

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`site-header${dark ? " site-header--dark" : ""}`}>
      <RouteLink className="wordmark" href="/" aria-label="Sera menu home">SERA</RouteLink>
      <div className="service-meta" aria-label="Restaurant service information">
        <span className="open-status"><i />Open now</span>
        <span className="service-divider" />
        <span>DINNER · TABLE 12</span>
      </div>
    </header>
  );
}
