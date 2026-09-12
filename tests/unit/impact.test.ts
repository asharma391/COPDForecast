import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { calcLF, calcTHI, getImpactCat } from '../../src/domain/impact';
import { baselineFile } from '../support/baseline';

const original = runInNewContext(
  `${baselineFile('script.js')}\n({ calcLF, calcTHI, getImpactCat })`,
  {
    document: {
      addEventListener() {},
      getElementById: () => ({ addEventListener() {} }),
    },
    window: { addEventListener() {} },
  },
) as {
  calcLF: typeof calcLF;
  calcTHI: typeof calcTHI;
  getImpactCat: typeof getImpactCat;
};

describe('prediction model compatibility (not clinical validation)', () => {
  it('retains predictions across 24,341 temperature/humidity pairs', () => {
    for (let temperature = -40; temperature <= 80; temperature += 0.5) {
      for (let humidity = 0; humidity <= 100; humidity++) {
        expect(calcLF(temperature, humidity)).toBe(
          original.calcLF(temperature, humidity),
        );
        expect(calcTHI(temperature, humidity)).toBe(
          original.calcTHI(temperature, humidity),
        );
      }
    }
  });
  it('preserves exact behavior on both sides of every model boundary', () => {
    for (const t of [
      9.999, 10, 10.001, 19.999, 20, 20.001, 29.999, 30, 30.001,
    ]) {
      for (const h of [
        29.999, 30, 30.001, 49.999, 50, 50.001, 69.999, 70, 70.001,
      ]) {
        expect(calcLF(t, h)).toBe(original.calcLF(t, h));
      }
    }
  });
  it('keeps category boundaries and all recommendation text unchanged', () => {
    for (const impact of [-1, 0, 4.999, 5, 5.001, 24.999, 25, 25.001, 100]) {
      expect(getImpactCat(impact)).toEqual(original.getImpactCat(impact));
    }
  });
});
