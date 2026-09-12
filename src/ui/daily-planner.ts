import type { WeatherForecast } from '../services/weather';
import { calcLF, getImpactCat } from '../domain/impact';
import { byId, element } from './dom';

export function showDailyPlanner(wD: WeatherForecast) {
  const hr = wD.hourly;
  const mdn = new Date();
  mdn.setHours(0, 0, 0, 0);
  const tS = hr.time.findIndex((tm) => {
    const d = new Date(tm);
    return (
      d.getDate() === mdn.getDate() &&
      d.getMonth() === mdn.getMonth() &&
      d.getFullYear() === mdn.getFullYear()
    );
  });
  if (tS === -1) {
    console.error("Could not find today's data in the API response");
    return;
  }
  const tD = Array.from({ length: 24 }, (_, i) => {
    const hIdx = tS + i;
    return {
      hour: i,
      temp: hr.temperature_2m[hIdx],
      humidity: hr.relative_humidity_2m[hIdx],
      impact: calcLF(hr.temperature_2m[hIdx], hr.relative_humidity_2m[hIdx]),
    };
  });
  const lI = Math.min(...tD.map((x) => x.impact));
  const bP = tD.filter((x) => x.impact === lI);
  const bPr = bP[0];
  const iI = getImpactCat(bPr.impact);
  const pHTML = `
    <div class="daily-planner">
      <h3>Today's Outdoor Activity Planner</h3>
      <div class="time-spectrum-container">
        <div class="time-labels">
          ${tD.map((h) => `<div class="time-label">${String(h.hour).padStart(2, '0')}:00</div>`).join('')}
        </div>
        <div class="time-spectrum">
          ${tD
            .map(
              (h) => `
            <div class="time-block"
              style="background-color:${getGradientColor(h.impact)}"
              data-tooltip="Time: ${String(h.hour).padStart(2, '0')}:00
Temperature: ${h.temp.toFixed(1)}°C
Humidity: ${h.humidity.toFixed(0)}%
Impact: +${h.impact.toFixed(1)}%">
            </div>
          `,
            )
            .join('')}
        </div>
        <div class="spectrum-legend">
          <div class="legend-item">
            <span class="legend-color" style="background-color:#4dff4d"></span>
            <span>Normal (≤ +5%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color:#ffd700"></span>
            <span>Moderate (+5% to +25%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color:#ff4d4d"></span>
            <span>Severe (≥ +25%)</span>
          </div>
        </div>
        <div class="optimal-periods">
          <h4>Recommended Time${bP.length > 1 ? 's' : ''} for Outdoor Activities</h4>
          <div class="best-period">
            <div class="time-details">
              ${bP
                .map(
                  (pp, idx) => `
                <span class="time-slot"
                  data-tooltip="Temperature: ${pp.temp.toFixed(1)}°C
Humidity: ${pp.humidity.toFixed(0)}%
Predicted Impact: +${pp.impact}%"
                  style="color:#0078d7;cursor:pointer;margin:0 2px;">
                  ${String(pp.hour).padStart(2, '0')}:00
                </span>${idx < bP.length - 1 ? ', ' : ''}
              `,
                )
                .join('')}
            </div>
            <div class="activity-recommendations">
              ${iI.activities}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  const pDiv = document.createElement('div');
  pDiv.innerHTML = pHTML;
  byId('forecastChart').parentNode!.insertBefore(pDiv, byId('forecastChart'));
  if (bP.length > 1) {
    pDiv.querySelectorAll('.time-slot').forEach((s) => {
      s.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const idx = parseInt(target.dataset.index!);
        const period = bP[idx];
        pDiv
          .querySelectorAll('.time-slot')
          .forEach((x) => x.classList.remove('active'));
        target.classList.add('active');
        element('#period-conditions', pDiv).innerHTML =
          `Temperature: ${period.temp.toFixed(1)}°C, Humidity: ${period.humidity.toFixed(0)}%, Predicted Impact: +${period.impact}%`;
      });
    });
  }
  initializeTabs();
}

export function getGradientColor(i: number) {
  if (i <= 5) {
    const x = i / 5;
    return `hsl(120,100%,${50 + x * 20}%)`;
  }
  if (i <= 25) {
    const x = (i - 5) / 20;
    return `hsl(${60 - 60 * x},100%,50%)`;
  }
  const x = Math.min((i - 25) / 20, 1);
  return `hsl(0,100%,${50 - x * 20}%)`;
}

function initializeTabs() {
  const tabs = document.querySelectorAll<HTMLElement>('.time-tab');
  const panels = document.querySelectorAll('.time-panel');
  tabs.forEach((tb) => {
    tb.addEventListener('click', () => {
      tabs.forEach((x) => x.classList.remove('active'));
      panels.forEach((x) => x.classList.remove('active'));
      tb.classList.add('active');
      const panel = element('#' + tb.getAttribute('data-tab'));
      panel.classList.add('active');
    });
  });
  if (tabs.length > 0) tabs[0].click();
}
