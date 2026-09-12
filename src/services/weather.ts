/** The Open-Meteo fields consumed by the original site. */
export interface DailyForecast {
  time: string[];
  temperature_2m_max: number[];
  relative_humidity_2m_max: number[];
}
export interface WeatherForecast {
  current_weather: { temperature: number };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
  };
  daily: DailyForecast;
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherForecast> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,relative_humidity_2m_max&current_weather=true&timezone=auto&forecast_days=7`,
  );
  return response.json();
}
