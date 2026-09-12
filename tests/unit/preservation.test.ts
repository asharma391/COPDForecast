import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { baselineFile } from '../support/baseline';

const read = (path: string) => readFileSync(path, 'utf8');

describe('original content contract', () => {
  it('preserves the README and license byte for byte', () => {
    for (const file of ['README.md', 'LICENSE'])
      expect(read(file)).toBe(baselineFile(file));
  });
  it('preserves every original CSS rule and its order', () => {
    expect(read('src/styles/site.css')).toBe(baselineFile('style.css'));
  });
  it('changes only stylesheet and application loader references in the HTML', () => {
    const expected = baselineFile('index.html')
      .replace('href="style.css"', 'href="/src/styles/site.css"')
      .replace(
        '    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n    <script src="script.js"></script>',
        '    <script type="module" src="/src/main.ts"></script>',
      );
    expect(read('index.html')).toBe(expected);
  });
});
