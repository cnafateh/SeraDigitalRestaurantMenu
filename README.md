# Sera Studio

A self-hosted digital menu platform for restaurants, cafés, fast food concepts and gelato bars. Guests get a responsive, food-first menu; operators get a private dashboard to edit their venue, template, products, prices, availability and photography.

## What is included

- Five visual templates: pizzeria, traditional restaurant, fast food, café and gelato/juice bar
- A complete 12-pizza Italian demo menu, plus four smaller sample venues
- Search, category filters, dedicated item pages, size/price selection and allergen information
- Dashboard for venue identity, template selection, publishing, menu items and image uploads
- ASP.NET Core 10 minimal API, PostgreSQL 17, React 19, TypeScript and Vite 8
- Self-hosted WebP photography, Nginx reverse proxy and Docker Compose
- Motion effects with a reduced-motion fallback, semantic controls and visible keyboard focus

The catalog in `server/seed.json` is imported automatically **only when the venues table is empty**. `server/generate_seed.py` rebuilds that file. Demo prices and allergen lists are illustrative; a real venue must review them before publishing.

## Quick start

1. Copy `.env.example` to `.env`.
2. Set a unique `POSTGRES_PASSWORD` and an `SERA_ADMIN_PASSWORD` of at least 12 characters.
3. Run `docker compose up --build -d`.
4. Open `http://localhost:3000` for the collection and `http://localhost:3000/admin` for the dashboard.

The web, API and database run in separate containers. PostgreSQL data, uploaded images and authentication keys are stored in named Docker volumes. Change `SERA_PORT` in `.env` if port 3000 is occupied. Put the site behind HTTPS for public deployment.

### Use an existing PostgreSQL server

The API accepts a standard Npgsql connection string through `DATABASE_URL`. Set that environment variable on the API deployment, pointing to your own server. The Docker Compose file includes a local PostgreSQL service for a one-command demo; an external deployment can omit that service and pass `DATABASE_URL` directly to the API container. The database user needs permission to create the two tables and index on first startup. Back up the database and uploads volume together.

### Local development

```bash
npm ci
npm run dev
```

In another terminal, start PostgreSQL and the API:

```bash
# Set DATABASE_URL and SERA_ADMIN_PASSWORD in your environment first.
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
src/pages/          Public collection, menu, item and dashboard screens
src/types/          Shared frontend model
src/lib/            API client
src/platform.css    Templates, layout and motion
public/images/      Local WebP menu photography
```
