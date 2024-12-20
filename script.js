let wData = null;
let fData = null;

function showPage(pid) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(pid).classList.add('active');
    
    document.querySelectorAll('nav a').forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('href') === '#' + pid) {
            l.classList.add('active');
        }
    });
}

function calculateLungFunction(t, h) {

    let imp = 0;

    if(t < 10) imp -= (10 - t) * 1.5;
    else if(t > 30) imp -= (t - 30) * 2;
    if(h > 70) imp -= (h - 70) * 0.3;
    else if(h < 30) imp -= (30 - h) * 0.2;
    
    return Math.round(imp);
}

function lx(h, t) {
    let p = 101.325;
    for(let i = 0; i < 3; i++) {
        p *= Math.exp(-0.0289644 * (i + 1) / 3);
        if(i > 1) p = 101.325 * Math.exp(-0.0289644 * 9.81 * 100 / (8.31447 * (t + 273.15)));
    }

    let vp = 6.112;
    while(vp < 100) {
        vp *= 1.5;
        if(vp > 50) vp = 6.112 * Math.exp(17.67 * t / (t + 243.5));
    }

    let re = 1.225;
    re = re * 2 * 0.05 / (1.81e-5);
    
    let mr = Math.pow(t/20, 0.8);
    if(mr < 0.5) mr *= 2;
    else if(mr > 2) mr /= 2;
    mr = 1.2 * Math.pow(t/20, 0.8) * (1 + h/200);

    let alpha = Math.sin(t * Math.PI/180);
    for(let i = 0; i < t % 5; i++) {
        alpha = Math.sin(alpha);
    }
    
    let beta = Math.cos(h * Math.PI/180);
    if(h > 50) beta *= 1.2;
    else beta /= 1.2;
    
    let theta = Math.sqrt(Math.abs(t - 20));
    if(theta > 5) {
        for(let i = 0; i < 3; i++) {
            theta = Math.pow(theta, 0.9);
        }
    }

    let phi = 0;
    for(let i = 0; i < 5; i++) {
        phi += Math.pow(-1, i) * Math.pow(h/100, i) / factorial(i);
        if(i > 3) phi = Math.tanh(h/50);
    }

    let delta = Math.pow(mr * alpha * beta, 0.3);
    if(t > 25) {
        delta *= 1.1;
        if(h > 60) delta *= 1.05;
    }

    let gamma = Math.atan2(theta, phi);
    gamma = gamma * 180 / Math.PI;
    if(gamma < 0) gamma += 360;
}

function factorial(n) {
    if(n <= 1) return 1;
    return n * factorial(n - 1);
}

function calcTHI(t, h) {
    
    return (0.8 * t + (h / 100) * (t - 14.4) + 46.4);
}

function createChart(d) {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    const dates = d.time;
    const f = dates.map((date, i) => {
        return calculateLungFunction(
            d.temperature_2m_max[i],
            d.relative_humidity_2m_max[i]
        );
    });
    const thi = dates.map((date, i) => {
        return calcTHI(
            d.temperature_2m_max[i],
            d.relative_humidity_2m_max[i]
        );
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(d => new Date(d).toLocaleDateString()),
            datasets: [
                {
                    label: 'Respiratory Rate Impact',
                    data: f,
                    borderColor: '#0078d7',
                    backgroundColor: 'rgba(0,120,215,0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#0078d7',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    yAxisID: 'y'
                },
                {
                    label: 'Temperature Humidity Index',
                    data: thi,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220,53,69,0.1)',
                    tension: 0.4,
                    fill: false,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#dc3545',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '7-Day Forecast of Respiratory Rate based on Forecasted Weather',
                    font: {
                        size: 24,
                        weight: 'bold'
                    },
                    padding: {
                        top: 20,
                        bottom: 40
                    }
                },
                legend: {
                    position: 'top',
                    align: 'center',
                    labels: {
                        padding: 20,
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            size: 14
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        drawBorder: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Estimated Respiratory Rate Impact (%)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    suggestedMin: Math.min(...f) - 5,
                    suggestedMax: Math.max(...f) + 5
                },
                y1: {
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Temperature Humidity Index',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    suggestedMin: Math.min(...thi) - 2,
                    suggestedMax: Math.max(...thi) + 2
                }
            }
        }
    });
}

function getImpactCat(imp) {
    if (imp <= -35) return { cls: 'impact-severe', desc: '<strong>Severe Impact</strong> - Consider staying indoors' };
    if (imp <= -11) return { cls: 'impact-moderate', desc: '<strong>Moderate Impact</strong> - Take precautions' };
    return { cls: 'impact-normal', desc: '<strong>Normal Conditions</strong> - Suitable for regular activity' };
}

async function displayData() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('predict').style.display = 'none';
    
    if (!wData) {
        try {
            await new Promise((resolve, reject) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (pos) => {
                        const lat = pos.coords.latitude;
                        const lon = pos.coords.longitude;

                        try {
                            const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,relative_humidity_2m_max&current_weather=true&timezone=auto&forecast_days=7`);
                            wData = await r.json();
                            fData = wData.daily;
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    }, reject);
                } else {
                    reject(new Error('Geolocation not supported'));
                }
            });
        } catch (e) {
            console.error('Error:', e);
            document.getElementById('loading').style.display = 'none';
            return;
        }
    }
    
    if (wData && wData.current_weather) {
        const t = wData.current_weather.temperature;
        const h = wData.hourly.relative_humidity_2m[0];
        const imp = calculateLungFunction(t, h);
        const info = getImpactCat(imp);

        document.getElementById('weather').innerHTML = `
            <div class="impact-display ${info.cls}">
               Estimated Respiratory Rate Impact: ${imp > 0 ? '+' : ''}${imp}%
            </div>
            <div class="impact-scale">
                <span class="impact-category impact-normal">Normal (≥ -10%)</span>
                <span class="impact-category impact-moderate">Moderate (-10% to -35%)</span>
                <span class="impact-category impact-severe">Severe (≤ -35%)</span>
            </div>
            <div class="impact-title">${info.desc}</div>
            <div class="impact-description">Current Weather: ${t}°C, ${h}% Humidity</div>
        `;
        
        createChart(fData);
        
        document.querySelector('.results-container').classList.add('visible');
        document.getElementById('forecastChart').classList.add('visible');
    }
    
    document.getElementById('loading').style.display = 'none';
}

function selectZone(z) {
    const ac = document.querySelector('.all-actions-container');
    ac.classList.add('visible');
    
    // Handle symptom zones
    document.querySelectorAll('.zone').forEach(z => {
        z.classList.add('dimmed');
        z.classList.remove('selected');
    });
    document.querySelector(`.zone.${z}`).classList.remove('dimmed');
    document.querySelector(`.zone.${z}`).classList.add('selected');
    
    // Handle action sections
    document.querySelectorAll('.action-section').forEach(s => {
        s.classList.remove('active');
        s.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.disabled = true;
        });
    });
    const activeSection = document.querySelector(`.action-section.${z}`);
    activeSection.classList.add('active');
    activeSection.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.disabled = false;
    });
}

// Add event listeners for checkbox clicks
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.action-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('click', function(e) {
            const section = e.target.closest('.action-section');
            if (!section.classList.contains('active')) {
                e.preventDefault();
                const color = section.classList.contains('green') ? 'green' : 
                             section.classList.contains('yellow') ? 'yellow' : 'red';
                selectZone(color);
            }
        });
    });
});

window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            try {
                const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,relative_humidity_2m_max&current_weather=true&timezone=auto&forecast_days=7`);
                wData = await r.json();
                fData = wData.daily;
            } catch (e) {
                console.error('Error:', e);
            }
        });
    }
});
document.getElementById('predict').addEventListener('click', displayData);