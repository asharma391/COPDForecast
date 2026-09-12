import type { WeatherForecast } from '../../src/services/weather';

export const weather: WeatherForecast = {
  current_weather: { temperature: 22 },
  hourly: {
    time: Array.from(
      { length: 168 },
      (_, i) =>
        `2026-09-${String(12 + Math.floor(i / 24)).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:00`,
    ),
    temperature_2m: Array.from({ length: 168 }, (_, i) => 10 + (i % 24)),
    relative_humidity_2m: Array.from({ length: 168 }, () => 50),
  },
  daily: {
    time: Array.from({ length: 7 }, (_, i) => `2026-09-${12 + i}`),
    temperature_2m_max: [22, 24, 28, 32, 35, 19, 18],
    relative_humidity_2m_max: [50, 60, 70, 80, 85, 55, 45],
  },
};
