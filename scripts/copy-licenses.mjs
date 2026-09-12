import { copyFile, readFile, writeFile } from 'node:fs/promises';

await copyFile('LICENSE', 'dist/LICENSE');
const notices = await Promise.all(
  ['chart.js', '@kurkle/color'].map(async (name) => {
    const license = await readFile(`node_modules/${name}/LICENSE.md`, 'utf8');
    return `${name}\n${'='.repeat(name.length)}\n\n${license}`;
  }),
);
await writeFile('dist/THIRD_PARTY_LICENSES.txt', notices.join('\n\n'));
