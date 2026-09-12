# Regression strategy

## Immutable original

Tests load original HTML, JavaScript and CSS from Git history, rather than keeping a second application copy in the source tree. The baseline commit is `d3c2c072a93fe5911aa83a7cf5790abb4fac432c`. CI fetches the complete history.

## Unit and contract tests

- Byte-for-byte equality for README, license and stylesheet.
- Exact HTML equality after only the two intended asset-loader replacements.
- Both model equations compared against the original JavaScript over 24,341 temperature/humidity pairs, plus fractional values around branch boundaries.
- Impact thresholds, descriptions and activity recommendations compared at category boundaries.
- Exact weather request URL and network-failure propagation.

## Browser parity

Playwright serves the original and the production bundle side by side on localhost. Both receive the same fixed clock, location, weather fixture and Chart.js version. For each browser/viewport configuration it compares all four pages, all three action-plan zones, weather results, the hourly planner, the real chart, denied location and offline requests. Screenshots are compared directly on the same machine with zero changed pixels permitted after pixelmatch's anti-aliasing tolerance. Failed comparisons attach both screenshots and a visual diff to the HTML report. This avoids committing operating-system-specific screenshot baselines.

The matrix includes desktop Chromium, mobile Chromium, desktop Firefox and mobile WebKit. These exercise browser engines and viewport layouts; they do not claim validation on every physical device. Checks for client exceptions cover normal navigation, action-plan and calculation flows.

The tests intentionally do not redefine pre-existing product behavior documented in [ARCHITECTURE.md](ARCHITECTURE.md).
