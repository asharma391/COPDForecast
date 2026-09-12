import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { readFileSync } from 'node:fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { weather } from '../support/weather-fixture';

async function prepare(page: Page, mode: 'ok' | 'denied' | 'offline' = 'ok') {
  await page.clock.setFixedTime(new Date('2026-09-12T16:00:00-04:00'));
  await page.addInitScript((denied) => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (
          success: PositionCallback,
          failure?: PositionErrorCallback,
        ) => {
          if (denied)
            failure?.({
              code: 1,
              PERMISSION_DENIED: 1,
            } as GeolocationPositionError);
          else
            success({
              coords: { latitude: 43.6532, longitude: -79.3832 },
            } as GeolocationPosition);
        },
      },
    });
  }, mode === 'denied');
  await page.route('https://cdn.jsdelivr.net/npm/chart.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: readFileSync('node_modules/chart.js/dist/chart.umd.js'),
    }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    mode === 'offline' ? route.abort() : route.fulfill({ json: weather }),
  );
}

async function compareScreenshots(
  legacy: Page,
  current: Page,
  label: string,
  info: TestInfo,
) {
  // CSS and canvas animations must settle identically in both pages.
  await Promise.all([
    legacy.waitForTimeout(1600),
    current.waitForTimeout(1600),
  ]);
  await Promise.all([legacy.mouse.move(0, 0), current.mouse.move(0, 0)]);
  const options = { fullPage: true, animations: 'disabled' as const };
  const [before, after] = await Promise.all([
    legacy.screenshot(options),
    current.screenshot(options),
  ]);
  const a = PNG.sync.read(before),
    b = PNG.sync.read(after);
  if (a.width !== b.width || a.height !== b.height) {
    await info.attach(`${label}-original`, {
      body: before,
      contentType: 'image/png',
    });
    await info.attach(`${label}-packaged`, {
      body: after,
      contentType: 'image/png',
    });
  }
  expect({ width: b.width, height: b.height }).toEqual({
    width: a.width,
    height: a.height,
  });
  const diff = new PNG({ width: a.width, height: a.height });
  const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
    threshold: 0.1,
  });
  if (changed) {
    await info.attach(`${label}-original`, {
      body: before,
      contentType: 'image/png',
    });
    await info.attach(`${label}-packaged`, {
      body: after,
      contentType: 'image/png',
    });
    await info.attach(`${label}-difference`, {
      body: PNG.sync.write(diff),
      contentType: 'image/png',
    });
  }
  expect(changed, `${label}: changed pixels relative to the original`).toBe(0);
}

test('all pages and action-plan interactions match the original', async ({
  context,
  page,
}, info) => {
  const legacy = await context.newPage();
  await Promise.all([prepare(legacy), prepare(page)]);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await Promise.all([legacy.goto('/baseline/'), page.goto('/COPDForecast/')]);
  for (const section of ['calculator', 'action-plan', 'resources', 'about']) {
    for (const target of [legacy, page])
      await target.locator(`nav a[href="#${section}"]`).click();
    await expect(page.locator('.page.active')).toHaveAttribute('id', section);
    expect(await page.locator(`#${section}`).innerText()).toBe(
      await legacy.locator(`#${section}`).innerText(),
    );
    await compareScreenshots(legacy, page, section, info);
  }
  for (const target of [legacy, page])
    await target.locator('nav a[href="#action-plan"]').click();
  for (const zone of ['green', 'yellow', 'red']) {
    for (const target of [legacy, page]) {
      await target.locator(`.zone.${zone}`).click();
      await target.locator(`.action-section.${zone} input`).first().check();
    }
    await expect(
      page.locator(`.action-section.${zone} input`).first(),
    ).toBeChecked();
    await expect(
      page.locator('.action-section:not(.active) input').first(),
    ).toBeDisabled();
    await compareScreenshots(legacy, page, `${zone}-zone`, info);
  }
  expect(errors).toEqual([]);
});

test('weather, planner and real Chart.js rendering match the original', async ({
  context,
  page,
}, info) => {
  const legacy = await context.newPage();
  await Promise.all([prepare(legacy), prepare(page)]);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const target of [legacy, page]) {
    await target.goto(target === legacy ? '/baseline/' : '/COPDForecast/');
    await target.locator('#predict').click();
    await expect(target.locator('#forecastChart')).toBeVisible();
    await expect(target.locator('.time-block')).toHaveCount(24);
  }
  expect(await page.locator('.results-container').innerText()).toBe(
    await legacy.locator('.results-container').innerText(),
  );
  await compareScreenshots(legacy, page, 'forecast', info);
  expect(errors).toEqual([]);
});

for (const mode of ['denied', 'offline'] as const) {
  test(`${mode} location/weather flow preserves existing behavior`, async ({
    context,
    page,
  }, info) => {
    const legacy = await context.newPage();
    await Promise.all([prepare(legacy, mode), prepare(page, mode)]);
    for (const target of [legacy, page]) {
      await target.goto(target === legacy ? '/baseline/' : '/COPDForecast/');
      await target.locator('#predict').click();
      await expect(target.locator('#predict')).toBeVisible();
      await expect(target.locator('#loading')).toBeHidden();
    }
    if (mode === 'denied')
      await expect(page.getByText('Location Access Required')).toBeVisible();
    await compareScreenshots(legacy, page, mode, info);
  });
}
