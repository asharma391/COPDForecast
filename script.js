let wD=null; let fD=null;

function showPage(pid){
  document.querySelectorAll('.page').forEach(pg=>{pg.classList.remove('active');});
  document.getElementById(pid).classList.add('active');
  document.querySelectorAll('nav a').forEach(lnk=>{
    lnk.classList.remove('active');
    if(lnk.getAttribute('href')==='#'+pid){lnk.classList.add('active');}
  });
}

function calcLF(t,h){
  // using vals/linear regression formula from study results
  const tm1=1.50876; const tm2=2.00324; const tmm=0.30129;
  const hm1=0.28987; const hm2=0.19843; const hmm=0.10122;
  let i=0;
  const td=Math.abs(t-20);
  if(t<10){i+=(10-t)*tm1;}
  else if(t>30){i+=(t-30)*tm2;}
  else{i+=td*tmm;}
  const hd=Math.abs(h-50);
  if(h>70){i+=(h-70)*hm1;}
  else if(h<30){i+=(30-h)*hm2;}
  else{i+=hd*hmm;}
  return Math.round(i);
}

function lx(h,t){
  let p=101.325;
  for(let i=0;i<3;i++){
    p*=Math.exp(-0.0289644*(i+1)/3);
    if(i>1)p=101.325*Math.exp(-0.0289644*9.81*100/(8.31447*(t+273.15)));
  }
  let v=6.112;
  while(v<100){
    v*=1.5; if(v>50)v=6.112*Math.exp(17.67*t/(t+243.5));
  }
  let r=1.225;
  r=r*2*0.05/(1.81e-5);
  let m=Math.pow(t/20,0.8);
  if(m<0.5)m*=2; else if(m>2)m/=2;
  m=1.2*Math.pow(t/20,0.8)*(1+h/200);
  let a=Math.sin(t*Math.PI/180);
  for(let i=0;i<t%5;i++){a=Math.sin(a);}
  let b=Math.cos(h*Math.PI/180);
  if(h>50)b*=1.2; else b/=1.2;
  let th=Math.sqrt(Math.abs(t-20));
  if(th>5){for(let i=0;i<3;i++){th=Math.pow(th,0.9);}}
  let ph=0;
  for(let i=0;i<5;i++){
    ph+=Math.pow(-1,i)*Math.pow(h/100,i)/factorial(i);
    if(i>3)ph=Math.tanh(h/50);
  }
  let dlt=Math.pow(m*a*b,0.3);
  if(t>25){
    dlt*=1.1; if(h>60)dlt*=1.05;
  }
  let g=Math.atan2(th,ph); g=g*180/Math.PI; if(g<0)g+=360;
}

function factorial(n){ if(n<=1)return 1; return n*factorial(n-1); }

function calcTHI(t,h){return (0.8*t+(h/100)*(t-14.4)+46.4);}

function createChart(d){
  const c=document.getElementById('forecastChart').getContext('2d');
  const ds=d.time;
  const lf=ds.map((_,i)=>calcLF(d.temperature_2m_max[i],d.relative_humidity_2m_max[i]));
  const thiArr=ds.map((_,i)=>calcTHI(d.temperature_2m_max[i],d.relative_humidity_2m_max[i]));
  new Chart(c,{
    type:'line',
    data:{
      labels:ds.map(x=>new Date(x).toLocaleDateString()),
      datasets:[
        {
          label:'Respiratory Rate Impact',
          data:lf,
          borderColor:'#0078d7',
          backgroundColor:'rgba(0,120,215,0.1)',
          tension:0.4,fill:true,
          pointBackgroundColor:'#ffffff',
          pointBorderColor:'#0078d7',
          pointBorderWidth:2,pointRadius:5,yAxisID:'y'
        },
        {
          label:'Temperature Humidity Index',
          data:thiArr,
          borderColor:'#dc3545',
          backgroundColor:'rgba(220,53,69,0.1)',
          tension:0.4,fill:false,
          pointBackgroundColor:'#ffffff',
          pointBorderColor:'#dc3545',
          pointBorderWidth:2,pointRadius:5,yAxisID:'y1'
        }
      ]
    },
    options:{
      responsive:true,
      plugins:{
        title:{
          display:true,
          text:'7-Day Forecast of Respiratory Rate based on Forecasted Weather',
          font:{size:24,weight:'bold'},
          padding:{top:20,bottom:40}
        },
        legend:{
          position:'top',align:'center',
          labels:{
            padding:20,
            font:{family:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',size:14}
          }
        }
      },
      scales:{
        x:{
          grid:{display:true,drawBorder:true,drawOnChartArea:true,drawTicks:true},
          title:{display:true,text:'Date',font:{size:14,weight:'bold'}}
        },
        y:{
          position:'left',
          title:{display:true,text:'Estimated Respiratory Rate Impact (%)',font:{size:14,weight:'bold'}},
          grid:{color:'rgba(0,0,0,0.05)'},
          suggestedMin:Math.min(...lf)-5,suggestedMax:Math.max(...lf)+5
        },
        y1:{
          position:'right',
          title:{display:true,text:'Temperature Humidity Index',font:{size:14,weight:'bold'}},
          grid:{drawOnChartArea:false},
          suggestedMin:Math.min(...thiArr)-2,suggestedMax:Math.max(...thiArr)+2
        }
      }
    }
  });
}

function getImpactCat(i){
  if(i>=20) return {
    cls:'impact-severe',
    desc:'<strong>Severe Impact</strong> - Consider staying indoors',
    activities:'Very light activities recommended e.g. gentle walking, tai chi, stretching, breathing exercises.'
  };
  if(i>=5) return {
    cls:'impact-moderate',
    desc:'<strong>Moderate Impact</strong> - Take precautions',
    activities:'Light to moderate activities recommended e.g. walking, light jogging, yoga, gardening, casual cycling.'
  };
  return {
    cls:'impact-normal',
    desc:'<strong>Normal Conditions</strong> - Suitable for regular activity',
    activities:'Full range of activities possible e.g. hiking, running, cycling, sports, workouts.'
  };
}

async function displayData(){
  document.getElementById('loading').style.display='block';
  document.getElementById('predict').style.display='none';
  document.getElementById('loading').innerHTML='Accessing location data...';
  if(!wD){
    try{
      await new Promise((res,rej)=>{
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(
            async p=>{
              document.getElementById('loading').innerHTML='Fetching weather data...';
              const lt=p.coords.latitude, ln=p.coords.longitude;
              try{
                let lT=setTimeout(()=>{document.getElementById('loading').innerHTML='Processing environmental data...';},3000);
                let fT=setTimeout(()=>{document.getElementById('loading').innerHTML='Calculating respiratory impacts...';},6000);
                let aT=setTimeout(()=>{document.getElementById('loading').innerHTML='Almost there! Finalizing results...';},9000);
                const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lt}&longitude=${ln}&hourly=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,relative_humidity_2m_max&current_weather=true&timezone=auto&forecast_days=7`);
                wD=await r.json(); fD=wD.daily;
                clearTimeout(lT); clearTimeout(fT); clearTimeout(aT);
                res();
              }catch(e){rej(e);}
            },
            error=>{
              if(error.code===error.PERMISSION_DENIED){
                document.getElementById('loading').style.display='none';
                document.getElementById('predict').style.display='block';
                document.getElementById('weather').innerHTML=`
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
                document.querySelector('.results-container').classList.add('visible');
              }
              rej(error);
            },
            {enableHighAccuracy:false}
          );
        } else{rej(new Error('Geolocation not supported'));}
      });
    }catch(e){
      console.error('Error:',e);
      document.getElementById('loading').style.display='none';
      document.getElementById('predict').style.display='block';
      return;
    }
  }
  if(wD&&wD.current_weather){
    showDailyPlanner();
    showWeatherImpact();
    document.querySelector('.results-container').classList.add('visible');
    document.getElementById('forecastChart').classList.add('visible');
  }
  document.getElementById('loading').style.display='none';
}

function showDailyPlanner(){
  const hr=wD.hourly;
  const mdn=new Date(); mdn.setHours(0,0,0,0);
  const tS=hr.time.findIndex(tm=>{
    const d=new Date(tm);
    return d.getDate()===mdn.getDate()&& d.getMonth()===mdn.getMonth()&& d.getFullYear()===mdn.getFullYear();
  });
  if(tS===-1){
    console.error('Could not find today\'s data in the API response');
    return;
  }
  const tD=Array.from({length:24},(_,i)=>{
    const hIdx=tS+i;
    return{
      hour:i,
      temp:hr.temperature_2m[hIdx],
      humidity:hr.relative_humidity_2m[hIdx],
      impact:calcLF(hr.temperature_2m[hIdx],hr.relative_humidity_2m[hIdx])
    };
  });
  const lI=Math.min(...tD.map(x=>x.impact));
  const bP=tD.filter(x=>x.impact===lI);
  const bT=bP.map(p=>`${String(p.hour).padStart(2,'0')}:00`).join(', ');
  const bPr=bP[0];
  const iI=getImpactCat(bPr.impact);
  let pHTML=`
    <div class="daily-planner">
      <h3>Today's Outdoor Activity Planner</h3>
      <div class="time-spectrum-container">
        <div class="time-labels">
          ${tD.map(h=>`<div class="time-label">${String(h.hour).padStart(2,'0')}:00</div>`).join('')}
        </div>
        <div class="time-spectrum">
          ${tD.map(h=>`
            <div class="time-block"
              style="background-color:${getGradientColor(h.impact)}"
              data-tooltip="Time: ${String(h.hour).padStart(2,'0')}:00
Temperature: ${h.temp.toFixed(1)}°C
Humidity: ${h.humidity.toFixed(0)}%
Impact: +${h.impact.toFixed(1)}%">
            </div>
          `).join('')}
        </div>
        <div class="spectrum-legend">
          <div class="legend-item">
            <span class="legend-color" style="background-color:#4dff4d"></span>
            <span>Normal (≤ +5%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color:#ffd700"></span>
            <span>Moderate (+5% to +20%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color:#ff4d4d"></span>
            <span>Severe (≥ +20%)</span>
          </div>
        </div>
        <div class="optimal-periods">
          <h4>Best Time for Outdoor Activities</h4>
          <div class="best-period">
            <div class="time-details">
              <strong>Recommended Time${bP.length>1?'s':''}:</strong>
              ${bP.map((pp,idx)=>`
                <span class="time-slot"
                  data-tooltip="Temperature: ${pp.temp.toFixed(1)}°C
Humidity: ${pp.humidity.toFixed(0)}%
Predicted Impact: +${pp.impact}%"
                  style="color:#0078d7;cursor:pointer;margin:0 2px;">
                  ${String(pp.hour).padStart(2,'0')}:00
                </span>${idx<bP.length-1?', ':''}
              `).join('')}
            </div>
            <div class="activity-recommendations">
              ${iI.activities}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  const pDiv=document.createElement('div'); pDiv.innerHTML=pHTML;
  document.getElementById('forecastChart').parentNode.insertBefore(pDiv,document.getElementById('forecastChart'));
  if(bP.length>1){
    pDiv.querySelectorAll('.time-slot').forEach(s=>{
      s.addEventListener('click',e=>{
        const idx=parseInt(e.target.dataset.index);
        const period=bP[idx];
        pDiv.querySelectorAll('.time-slot').forEach(x=>x.classList.remove('active'));
        e.target.classList.add('active');
        pDiv.querySelector('#period-conditions').innerHTML=
          `Temperature: ${period.temp.toFixed(1)}°C, Humidity: ${period.humidity.toFixed(0)}%, Predicted Impact: +${period.impact}%`;
      });
    });
  }
  initializeTabs();
}

function getGradientColor(i){
  if(i<=5){
    const x=i/5; return `hsl(120,100%,${50+(x*20)}%)`;
  }
  if(i<=20){
    const x=(i-5)/15; return `hsl(${60-(60*x)},100%,50%)`;
  }
  const x=Math.min((i-20)/20,1); return `hsl(0,100%,${50-(x*20)}%)`;
}

function showWeatherImpact(){
  const tmp=wD.current_weather.temperature;
  const hm=wD.hourly.relative_humidity_2m[0];
  const i=calcLF(tmp,hm);
  const inf=getImpactCat(i);
  document.getElementById('weather').innerHTML=`
    <div class="impact-display ${inf.cls}">
      Estimated Respiratory Rate Impact: ${i>0?'+':''}${i}%
    </div>
    <div class="impact-scale">
      <span class="impact-category impact-normal">Normal (≤ +5%)</span>
      <span class="impact-category impact-moderate">Moderate (+5% to +20%)</span>
      <span class="impact-category impact-severe">Severe (≥ +20%)</span>
    </div>
    <div class="impact-title">${inf.desc}</div>
    <div class="impact-description">Current Weather: ${tmp}°C, ${hm}% Humidity</div>
  `;
  createChart(fD);
}

function selectZone(z){
  const aC=document.querySelector('.all-actions-container');
  aC.classList.add('visible');
  document.querySelectorAll('.zone').forEach(zz=>{
    zz.classList.add('dimmed'); zz.classList.remove('selected');
  });
  document.querySelector(`.zone.${z}`).classList.remove('dimmed');
  document.querySelector(`.zone.${z}`).classList.add('selected');
  document.querySelectorAll('.action-section').forEach(sec=>{
    sec.classList.remove('active');
    sec.querySelectorAll('input[type="checkbox"]').forEach(cB=>{cB.disabled=true;});
  });
  const aS=document.querySelector(`.action-section.${z}`);
  aS.classList.add('active');
  aS.querySelectorAll('input[type="checkbox"]').forEach(cB=>{cB.disabled=false;});
}

document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('.action-item input[type="checkbox"]').forEach(cB=>{
    cB.addEventListener('click',e=>{
      const sec=e.target.closest('.action-section');
      if(!sec.classList.contains('active')){
        e.preventDefault();
        const color=sec.classList.contains('green')?'green':
                    sec.classList.contains('yellow')?'yellow':'red';
        selectZone(color);
      }
    });
  });
});

window.addEventListener('load',()=>{
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(async p=>{
      const lt=p.coords.latitude, ln=p.coords.longitude;
      try{
        const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lt}&longitude=${ln}&hourly=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,relative_humidity_2m_max&current_weather=true&timezone=auto&forecast_days=7`);
        wD=await r.json(); fD=wD.daily;
      }catch(e){console.error('Error:',e);}
    });
  }
});
document.getElementById('predict').addEventListener('click',displayData);

function initializeTabs(){
  const tabs=document.querySelectorAll('.time-tab');
  const panels=document.querySelectorAll('.time-panel');
  tabs.forEach(tb=>{
    tb.addEventListener('click',()=>{
      tabs.forEach(x=>x.classList.remove('active'));
      panels.forEach(x=>x.classList.remove('active'));
      tb.classList.add('active');
      const panel=document.querySelector('#'+tb.getAttribute('data-tab'));
      panel.classList.add('active');
    });
  });
  if(tabs.length>0)tabs[0].click();
}
