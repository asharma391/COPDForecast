# Architecture

The application retains its original HTML document and CSS, with ES modules replacing the original global script. Vite bundles those modules and the pinned Chart.js dependency into a static deployment. There is no client framework, hydration layer, backend, or persistent user data store.

```text
index.html
  └─ src/main.ts
      ├─ ui/navigation.ts       existing page switching
      ├─ ui/action-plan.ts      zone selection and checkboxes
      └─ ui/calculator.ts       location, loading state and results
          ├─ services/weather.ts     typed Open-Meteo client
          ├─ domain/impact.ts        original equations and categories
          ├─ ui/daily-planner.ts     hourly activity planning
          └─ ui/forecast-chart.ts    Chart.js configuration

src/styles/site.css             original stylesheet, byte-for-byte
src/ui/dom.ts                   required-element lookup helpers
```

## Data flow

The browser requests geolocation on page load, preserving the original preload behavior. The calculator also requests it when clicked if cached weather is unavailable. Coordinates are passed to the original Open-Meteo forecast endpoint. The response is cached in memory. The original temperature/humidity calculations produce the current impact, daily chart values, and hourly planner. Weather types describe the fields consumed by the application; they are compile-time contracts, not runtime API validation.

Only `showPage` and `selectZone` are exposed on `window` for the existing inline HTML handlers. Other modules use explicit imports. Chart.js 4.5.1 is packaged locally, matching the CDN version resolved during migration, so rendering no longer depends on an unversioned CDN script.

## Preservation boundary

The packaging baseline is commit `d3c2c072a93fe5911aa83a7cf5790abb4fac432c`. README, license, all CSS bytes, all HTML content, model coefficients, thresholds, rounding, user-facing strings and chart options are preserved. HTML changes are limited to stylesheet and script loading. The unused `lx` calculation and its private `factorial` helper were omitted: neither is called by the original application and neither contributes to displayed predictions. An unused planner string was likewise removed.

The model tests establish software compatibility, not scientific or clinical validity. This packaging does not update clinical claims or expand the model's scope.

## Existing limitations

These behaviors predate the packaging and remain outside its scope:

- The model has discontinuities at temperature/humidity branch boundaries; tests preserve them exactly.
- Current humidity uses the first hourly value, as in the original implementation.
- The UI's normal-condition legend includes 5%, while category selection treats exactly 5% as moderate.
- Multiple equally optimal hours have a pre-existing click handler referencing absent index/panel markup; tooltips and displayed hour recommendations still match the original.
- HTTP payloads are not validated, request timers are not cleaned up on every failure path, and repeated programmatic calculation can reuse an existing chart canvas.
- The original mobile layout and overflow behavior are retained.

Addressing these is a separate product change requiring new expectations and updated compatibility tests.
