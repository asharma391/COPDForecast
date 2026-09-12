import { afterEach, expect, it, vi } from 'vitest';
import { fetchWeather } from '../../src/services/weather';

afterEach(() => vi.unstubAllGlobals());
it('retains the exact upstream query, including coordinates, time zone and forecast fields', async () => {
  const response = {
    current_weather: { temperature: 20 },
    daily: {},
    hourly: {},
  };
  const fetchMock = vi.fn().mockResolvedValue({ json: async () => response });
  vi.stubGlobal('fetch', fetchMock);
  expect(await fetchWeather(43.6532, -79.3832)).toBe(response);
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
    'https://api.open-meteo.com/v1/forecast?latitude=43.6532&longitude=-79.3832&hourly=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,relative_humidity_2m_max&current_weather=true&timezone=auto&forecast_days=7',
  );
});
it('propagates network failures to the existing UI error handler', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  await expect(fetchWeather(0, 0)).rejects.toThrow('offline');
});
