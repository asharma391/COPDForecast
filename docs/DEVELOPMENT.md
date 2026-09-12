# Development

COPDForecast is a static browser application built with Vite and strict TypeScript. It requires Node.js 22.12 or later and npm. It has no application server, database, credentials, or environment variables.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Browser geolocation works on localhost or HTTPS. Weather requests go directly to Open-Meteo.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development with module reloads |
| `npm run typecheck` | Strict TypeScript checks |
| `npm run lint` | ESLint checks |
| `npm run format:check` | Check source and tooling formatting |
| `npm test` | Content, model, and weather-client regression tests |
| `npm run build` | Type-check and bundle the static site into `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm run test:e2e` | Compare the production site with the original commit in real browsers |
| `npm run check` | Run the complete validation pipeline |

Before the first browser test run:

```sh
npx playwright install chromium firefox webkit
npm run check
```

Linux CI uses `npx playwright install --with-deps chromium firefox webkit`. Regression tests read the original files from Git commit `d3c2c072a93fe5911aa83a7cf5790abb4fac432c`; use a full clone, or `git fetch --unshallow` for a shallow checkout. Build before running browser tests independently. Tests require port 4173 and stub weather and geolocation, so they need neither live API access nor location permission.

The unchanged README remains the original project introduction. Contributor and architecture details live in `docs/`.

To use an existing Chrome installation for the Chromium viewport checks, run `PLAYWRIGHT_CHROMIUM_CHANNEL=chrome npx playwright test --project=desktop-chromium --project=mobile-chromium`. CI uses the pinned Playwright browser builds.
