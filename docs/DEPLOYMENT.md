# GitHub Pages deployment

The production URL is <https://asharma391.github.io/copd-forecast/>. Vite's `base` is `./`, so stylesheet and JavaScript links resolve relative to the deployed page. Repository renames and nested deployment paths do not require a rebuild with a different prefix.

GitHub Pages uses GitHub Actions as its build source. `.github/workflows/ci.yml` installs locked dependencies, checks types/lint/formatting, runs unit tests, builds and runs browser regression tests. Pull requests run these checks without deployment permissions. Successful pushes to `main` upload the tested `dist/` directory and deploy that exact artifact to the `github-pages` environment. A manual workflow run on `main` can redeploy it.

Only the deploy job receives Pages write and OIDC permissions. Concurrency serializes production deployments. Development files, tests, Git history, and node_modules are excluded from the deployed artifact. Built JavaScript, CSS, and HTML are intentionally public.

## Local production check

```sh
npm ci
npm run build
npm run preview
```

Do not serve the source checkout directly as production: browsers cannot execute TypeScript. Any static host can serve `dist/` at its root or under a subdirectory. Directory URLs must include a trailing slash (or the host must redirect to one).

## Recovery

Revert a faulty packaging commit while retaining the build configuration and rerun CI, or redeploy a previously successful Pages artifact from GitHub. To restore the original static implementation completely, restore the three original site files from the baseline commit and switch Pages back to deployment from `main` at `/`. Never change the deployment source to branch mode while `index.html` still references TypeScript source.

For a post-deployment browser comparison against the original, build locally and set `PACKAGED_SITE_URL=https://asharma391.github.io/copd-forecast/` when running `npm run test:e2e`. This uses deterministic weather/location fixtures against the live HTML, JavaScript and CSS.
