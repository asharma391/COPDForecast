import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { extname, resolve, sep } from 'node:path';

const baseline = 'd3c2c072a93fe5911aa83a7cf5790abb4fac432c';
const legacy = new Map(
  ['index.html', 'script.js', 'style.css'].map((name) => [
    name,
    execFileSync('git', ['show', `${baseline}:${name}`]),
  ]),
);
const types = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
};
const root = resolve('dist');
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
    let body;
    let filename;
    if (path.startsWith('/baseline/')) {
      filename = path.slice('/baseline/'.length) || 'index.html';
      body = legacy.get(filename);
      if (!body) throw new Error('not found');
    } else if (path.startsWith('/COPDForecast/')) {
      filename = path.slice('/COPDForecast/'.length) || 'index.html';
      const full = resolve(root, filename);
      if (!full.startsWith(root + sep)) throw new Error('not found');
      body = await readFile(full);
    } else throw new Error('not found');
    res.writeHead(200, {
      'Content-Type': types[extname(filename)] || 'application/octet-stream',
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(4173, '127.0.0.1', () =>
  console.log('Regression server on http://127.0.0.1:4173'),
);
