# Contributing

See [development setup](docs/DEVELOPMENT.md), [architecture](docs/ARCHITECTURE.md), and [regression testing](docs/TESTING.md).

1. Create a branch and install dependencies with `npm ci`.
2. Keep changes focused. Preserve the original README, site content and stylesheet unless the change explicitly calls for a product update.
3. Run `npm run check` before opening a pull request.
4. Explain the behavior changed and the validation performed. Include screenshots for intentional visual changes.

Model coefficient, category, recommendation and clinical wording changes require explicit rationale and separate review. Existing compatibility tests are not evidence of clinical validation. Dependency upgrades should retain a reproducible lockfile and pass the browser comparison suite.
