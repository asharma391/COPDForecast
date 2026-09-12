import Chart from 'chart.js/auto';
import { calcLF, calcTHI } from '../domain/impact';
import type { DailyForecast } from '../services/weather';
import { byId } from './dom';

// Preserve the original options, including the legacy drawBorder property.
const legacyGrid = {
  display: true,
  drawBorder: true,
  drawOnChartArea: true,
  drawTicks: true,
};

export function createChart(d: DailyForecast) {
  const c = byId<HTMLCanvasElement>('forecastChart').getContext('2d')!;
  const ds = d.time;
  const lf = ds.map((_, i) =>
    calcLF(d.temperature_2m_max[i], d.relative_humidity_2m_max[i]),
  );
  const thiArr = ds.map((_, i) =>
    calcTHI(d.temperature_2m_max[i], d.relative_humidity_2m_max[i]),
  );
  new Chart(c, {
    type: 'line',
    data: {
      labels: ds.map((x) => new Date(x).toLocaleDateString()),
      datasets: [
        {
          label: 'Respiratory Rate Impact',
          data: lf,
          borderColor: '#0078d7',
          backgroundColor: 'rgba(0,120,215,0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#0078d7',
          pointBorderWidth: 2,
          pointRadius: 5,
          yAxisID: 'y',
        },
        {
          label: 'Temperature Humidity Index',
          data: thiArr,
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220,53,69,0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#dc3545',
          pointBorderWidth: 2,
          pointRadius: 5,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '7-Day Forecast of Respiratory Rate based on Forecasted Weather',
          font: { size: 24, weight: 'bold' },
          padding: { top: 20, bottom: 40 },
        },
        legend: {
          position: 'top',
          align: 'center',
          labels: {
            padding: 20,
            font: {
              family:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              size: 14,
            },
          },
        },
      },
      scales: {
        x: {
          grid: legacyGrid,
          title: {
            display: true,
            text: 'Date',
            font: { size: 14, weight: 'bold' },
          },
        },
        y: {
          position: 'left',
          title: {
            display: true,
            text: 'Estimated Respiratory Rate Impact (%)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { color: 'rgba(0,0,0,0.05)' },
          suggestedMin: Math.min(...lf) - 5,
          suggestedMax: Math.max(...lf) + 5,
        },
        y1: {
          position: 'right',
          title: {
            display: true,
            text: 'Temperature Humidity Index',
            font: { size: 14, weight: 'bold' },
          },
          grid: { drawOnChartArea: false },
          suggestedMin: Math.min(...thiArr) - 2,
          suggestedMax: Math.max(...thiArr) + 2,
        },
      },
    },
  });
}
