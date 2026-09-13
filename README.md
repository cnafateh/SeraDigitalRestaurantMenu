# Sera — Digital Restaurant Menu

A polished, mobile-first restaurant menu concept built as a portfolio-ready frontend project. Sera combines editorial art direction with practical menu UX: category browsing, ingredient search, dietary states, variable pricing and portion-aware nutrition.

## Highlights

- Responsive menu experience for mobile, tablet and desktop
- Six realistic demo dishes across five categories
- Instant category filtering and ingredient-aware search
- Dedicated, refresh-safe route for every available dish
- Variable portion pricing with synchronized nutrition values
- Structured ingredients, allergens and dietary badges
- Consistent sold-out state without layout shift
- Keyboard-visible focus states and semantic controls
- Local, optimized WebP imagery with no remote dependencies
- Lightweight static production build served by Nginx
- Multi-stage Docker build and SPA routing fallback

Original image-generation briefs are documented in `IMAGE_PROMPTS.md`.

## Tech stack

- React 19
- TypeScript
- Vite
- Handcrafted modern CSS
- Nginx Alpine
- Docker Compose

The production container only serves static assets. There is no Node.js process, API, database or authentication at runtime.

## Run with Docker

Docker Desktop is the only requirement.

```powershell
docker compose up --build -d
```

Open `http://localhost:3000`.

```powershell
docker compose ps
docker compose logs -f sera-menu
docker compose down
```

To use a different host port:

```powershell
$env:SERA_PORT=8081
docker compose up --build -d
```

No artificial CPU or memory limit is applied to the container.

## Run without Docker

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Full menu, search, categories and sold-out state |
| `/menu` | Menu alias |
| `/dish/margherita` | Margherita details and three sizes |
| `/dish/diavola` | Diavola details and two sizes |
| `/dish/truffle-tagliatelle` | Pasta details and two portions |
| `/dish/mediterranean-sea-bass` | Main course details |
| `/dish/burrata-heirloom-tomatoes` | Starter details and sharing portion |

Direct navigation and browser refresh work on every route through Nginx's SPA fallback.

## Project structure

```text
src/
├── components/   Reusable visual components
├── data/         Typed menu content
├── hooks/        Lightweight client-side routing
├── pages/        Menu, dish details and 404 views
├── types/        Shared domain types
├── App.tsx       Route composition
└── styles.css    Complete responsive design system
```

## Design approach

- Editorial typography and food-led imagery establish a premium restaurant character without sacrificing readability.
- The first viewport exposes menu context and browsing tools immediately; there is no marketing gate before the menu.
- Cards use a consistent component model for variable pricing, dietary badges, details affordance and sold-out treatment.
- Dish pages layer information by importance: overview, portion, ingredients, primary nutrition and collapsible secondary values.
- The 375–390 px mobile experience remains the baseline while larger layouts make purposeful use of space.

## License

MIT
