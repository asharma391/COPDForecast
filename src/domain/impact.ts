export function calcLF(t: number, h: number): number {
  // using vals/linear regression formula from study results
  const tm1 = 1.50876;
  const tm2 = 2.00324;
  const tmm = 0.30129;
  const hm1 = 0.28987;
  const hm2 = 0.19843;
  const hmm = 0.10122;
  let i = 0;
  const td = Math.abs(t - 20);
  if (t < 10) {
    i += (10 - t) * tm1;
  } else if (t > 30) {
    i += (t - 30) * tm2;
  } else {
    i += td * tmm;
  }
  const hd = Math.abs(h - 50);
  if (h > 70) {
    i += (h - 70) * hm1;
  } else if (h < 30) {
    i += (30 - h) * hm2;
  } else {
    i += hd * hmm;
  }
  return Math.round(i);
}

export function calcTHI(t: number, h: number): number {
  return 0.8 * t + (h / 100) * (t - 14.4) + 46.4;
}

export function getImpactCat(i: number) {
  if (i >= 25)
    return {
      cls: 'impact-severe',
      desc: '<strong>Severe Impact</strong> - Consider staying indoors',
      activities:
        'Very light activities recommended e.g. gentle walking, tai chi, stretching, breathing exercises',
    };
  if (i >= 5)
    return {
      cls: 'impact-moderate',
      desc: '<strong>Moderate Impact</strong> - Take precautions',
      activities:
        'Light to moderate activities recommended e.g. walking, light jogging, yoga, gardening, casual cycling',
    };
  return {
    cls: 'impact-normal',
    desc: '<strong>Normal Conditions</strong> - Suitable for regular activity',
    activities:
      'Full range of activities recommended e.g. running, cycling, team sports, hiking, intense workouts, outdoor training',
  };
}
