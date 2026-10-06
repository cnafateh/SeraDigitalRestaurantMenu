# Sera Studio

A self-hosted digital menu platform for restaurants, cafés, fast food concepts and gelato bars. Guests get a responsive, food-first menu; operators get a private dashboard to edit their venue, template, products, prices, availability and photography.

## What is included

- Five visual templates: pizzeria, traditional restaurant, fast food, café and gelato/juice bar
- A complete 12-pizza Italian demo menu, plus four smaller sample venues
- Search, category filters, dedicated item pages, size/price selection and allergen information
- Dashboard for venue identity, template selection, publishing, menu items and image uploads
- ASP.NET Core 10 minimal API, PostgreSQL, React 19, TypeScript and Vite 8
- Self-hosted WebP photography and a single-image Docker deployment
- Motion effects with a reduced-motion fallback, semantic controls and visible keyboard focus

The catalog in `server/seed.json` is imported automatically **only when the venues table is empty**. `server/generate_seed.py` rebuilds that file. Demo prices and allergen lists are illustrative; a real venue must review them before publishing.

## Quick start

1. Copy `.env.example` to `.env`.
2. Set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_NETWORK` for your existing PostgreSQL container and Docker network. Set an `SERA_ADMIN_PASSWORD` of at least 12 characters.
3. Run `docker compose up --build -d`.
4. Open `http://localhost:3000` for the collection and `http://localhost:3000/admin` for the dashboard.

The default Compose stack builds one container containing both the frontend and API. It joins the external `DB_NETWORK`, where `DB_HOST` must resolve to your existing PostgreSQL service. It does not start a database or Nginx container. Uploaded images and authentication keys are stored in named Docker volumes. Set `SERA_PORT` in `.env` if port 3000 is occupied. Put the site behind HTTPS for public deployment.

### Deploy the published image

`ghcr.io/cnafateh/seradigitalrestaurantmenu:latest` contains both the built frontend and ASP.NET API. It listens on container port **80** and needs a reachable PostgreSQL server. Set these environment variables in your deployment platform:

| Variable | Value |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Credentials for the existing PostgreSQL server; `DB_HOST` is its name or alias on the shared Docker network |
| `DATABASE_URL` | Optional alternative Npgsql connection string; takes precedence over the `DB_*` variables |
| `SERA_ADMIN_PASSWORD` | A unique password of at least 12 characters |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | `true` when serving through an HTTPS reverse proxy |

Use `/health` for the container health check. Persist `/app/uploads` and `/root/.aspnet/DataProtection-Keys` across replacements. The database user needs permission to create tables and an index on first startup; seed data is imported when the venues table is empty. If the database settings are absent or PostgreSQL cannot be reached, the app exits during startup and the container cannot become healthy. Check the container logs for the connection error.

For a server with PostgreSQL and a reverse proxy already running in Docker, set the `DB_*` variables, `DB_NETWORK`, `NPM_NETWORK`, and `SERA_ADMIN_PASSWORD` in `.env`, then run:

```bash
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

The production Compose file joins your existing database and proxy networks. Point the reverse proxy at `sera-menu:80` on `NPM_NETWORK`. It does not publish a host port. `DB_HOST` must be a container name or network alias reachable on `DB_NETWORK`, rather than `localhost`.

If upgrading from the earlier Nginx deployment, stop and remove its old `sera-restaurant-menu` container or old Compose stack in your deployment panel. The new `app` container replaces it. A log mentioning `nginx` and `upstream "api"` comes from that retired image; the current image runs ASP.NET directly and answers `/health` on port 80.

### Use an existing PostgreSQL server

The API accepts either the separate `DB_*` variables or an Npgsql connection string in `DATABASE_URL`. Both Compose files use the separate variables and join your external database network. Neither creates a PostgreSQL container or database. The API creates its tables and index inside the database you provide, so its user needs schema creation permissions on first startup. Back up the existing database and uploads volume together.

### Local development

```bash
npm ci
npm run dev
```

In another terminal, start PostgreSQL and the API:

```bash
# Set DATABASE_URL (or the DB_* variables) and SERA_ADMIN_PASSWORD first.
dotnet run --project server/Sera.Api.csproj --urls http://localhost:5000
```

Vite proxies `/api` and `/uploads` to the API on port 5000. `npm run build` and `dotnet build server/Sera.Api.csproj` verify both applications. The API container uses a configurable `NUGET_SOURCE` build argument for package restore.

## Routes and API

| Route | Purpose |
| --- | --- |
| `/` | Browse the five demo concepts |
| `/menu/{venueId}` | Public venue menu |
| `/dish/{venueId}/{slug}` | Product details |
| `/admin` | Private management dashboard |
| `/api/menu/{venueId}` | Published venue and items |
| `/api/admin/*` | Authenticated venue, item and upload operations |

The dashboard uses an HTTP-only, same-site authentication cookie. Write requests require a same-origin custom header; login is rate limited. Uploads accept WebP, PNG and JPEG files up to 10 MB, with randomized server filenames. Keep the admin password private and use HTTPS on any public server.

## Design notes

The visual system gives each concept its own palette and hero composition while keeping navigation and editing consistent. Search and categories remain close to the menu content. Motion uses transforms and opacity, and the reduced-motion preference disables decorative movement. These choices follow [WCAG 2.2 navigation and focus guidance](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), [W3C reduced-motion technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39), and [web.dev animation performance guidance](https://web.dev/articles/animations-and-performance/).

## Project structure

```text
server/             ASP.NET API, schema and repeatable demo catalog
Dockerfile          Published all-in-one frontend and API image
src/pages/          Public collection, menu, item and dashboard screens
src/types/          Shared frontend model
src/lib/            API client
src/platform.css    Templates, layout and motion
public/images/      Local WebP menu photography
```
