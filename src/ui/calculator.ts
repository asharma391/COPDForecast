import { calcLF, getImpactCat } from '../domain/impact';
import { fetchWeather, type WeatherForecast } from '../services/weather';
import { byId, element } from './dom';
import { createChart } from './forecast-chart';
import { showDailyPlanner } from './daily-planner';

let wD: WeatherForecast | null = null;

async function displayData() {
  byId('loading').style.display = 'block';
  byId('predict').style.display = 'none';
  byId('loading').innerHTML = 'Accessing location data...';
  if (!wD) {
    try {
      await new Promise<void>((res, rej) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (p) => {
              byId('loading').innerHTML = 'Fetching weather data...';
              const lt = p.coords.latitude,
                ln = p.coords.longitude;
              try {
                const lT = setTimeout(() => {
                  byId('loading').innerHTML =
                    'Processing environmental data...';
                }, 3000);
                const fT = setTimeout(() => {
                  byId('loading').innerHTML =
                    'Calculating respiratory impacts...';
                }, 6000);
                const aT = setTimeout(() => {
                  byId('loading').innerHTML =
                    'Almost there! Finalizing results...';
                }, 9000);
                wD = await fetchWeather(lt, ln);
                clearTimeout(lT);
                clearTimeout(fT);
                clearTimeout(aT);
                res();
              } catch (e) {
                rej(e);
              }
            },
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                byId('loading').style.display = 'none';
                byId('predict').style.display = 'block';
                byId('weather').innerHTML = `
                  <div class="location-error">
                    <p><strong>Location Access Required</strong></p>
                    <p>Please enable location access to use this calculator. To enable:</p>
                    <ol>
                      <li>Click the toggle icon to the left of the website URL</li>
                      <li>Select "Allow" for location access</li>
                      <li>Refresh the page and try again</li>
                    </ol>
                    <p>We use this data to fetch local weather data for the calculation.</p>
                  </div>
                `;
                element('.results-container').classList.add('visible');
              }
              rej(error);
            },
            { enableHighAccuracy: false },
          );
        } else {
          rej(new Error('Geolocation not supported'));
        }
      });
    } catch (e) {
      console.error('Error:', e);
      byId('loading').style.display = 'none';
      byId('predict').style.display = 'block';
      return;
    }
  }
  if (wD && wD.current_weather) {
    showDailyPlanner(wD);
    showWeatherImpact(wD);
    element('.results-container').classList.add('visible');
    byId('forecastChart').classList.add('visible');
  }
  byId('loading').style.display = 'none';
}

function showWeatherImpact(wD: WeatherForecast) {
  const tmp = wD.current_weather.temperature;
  const hm = wD.hourly.relative_humidity_2m[0];
  const i = calcLF(tmp, hm);
  const inf = getImpactCat(i);
  byId('weather').innerHTML = `
    <div class="impact-display ${inf.cls}">
      Estimated Respiratory Rate Impact: ${i > 0 ? '+' : ''}${i}%
    </div>
    <div class="impact-scale">
      <span class="impact-category impact-normal">Normal (≤ +5%)</span>
      <span class="impact-category impact-moderate">Moderate (+5% to +25%)</span>
      <span class="impact-category impact-severe">Severe (≥ +25%)</span>
    </div>
    <div class="impact-title">${inf.desc}</div>
    <div class="impact-description">Current Weather: ${tmp}°C, ${hm}% Humidity</div>
  `;
  createChart(wD.daily);
}

window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (p) => {
      const lt = p.coords.latitude,
        ln = p.coords.longitude;
      try {
        wD = await fetchWeather(lt, ln);
      } catch (e) {
        console.error('Error:', e);
      }
    });
  }
});
byId('predict').addEventListener('click', displayData);
