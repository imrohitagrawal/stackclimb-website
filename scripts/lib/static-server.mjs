/* A confined, loopback-only static server for build-time rendering.
 *
 * Extracted from scripts/og-card.mjs when that file passed D8's 250-line
 * ceiling — modularize, never trim the comments that say why.
 *
 * Two defects were reproduced in its first version and are fixed here:
 *   GET /..%2Fpackage.json  -> 200, serving the repository's own package.json
 *   listen(port)            -> bound to "::", every interface, not loopback
 * A build tool that briefly serves arbitrary repository files to the local
 * network is not acceptable even for the seconds it runs.
 */
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff',
};

export function serve(root, port) {
  /* Confined and loopback-only. A first version did `path.join(root, decodeURIComponent(url))`
     and `listen(port)`, which is two defects, both reproduced before being fixed:
       GET /..%2Fpackage.json  -> 200, serving the repo's package.json
       bound to "::"           -> every interface, not just loopback
     A build tool that briefly serves arbitrary repository files to the local
     network is not acceptable even for the seconds it runs. */
  const ROOT_ABS = path.resolve(root);
  const srv = createServer((q, r) => {
    let rel;
    try {
      rel = decodeURIComponent(new URL(q.url, 'http://localhost').pathname);
    } catch {
      r.writeHead(400); return r.end('bad request');
    }
    let p = path.resolve(ROOT_ABS, '.' + path.posix.normalize('/' + rel));
    const inside = (f) => f === ROOT_ABS || f.startsWith(ROOT_ABS + path.sep);
    if (!inside(p)) { r.writeHead(403); return r.end('forbidden'); }
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!fs.existsSync(p)) p = p + '.html';
    if (!inside(p) || !fs.existsSync(p)) { r.writeHead(404); return r.end('not found'); }
    const e = path.extname(p);
    const ct = TYPES[e] || 'application/octet-stream';
    r.writeHead(200, { 'content-type': ct });
    fs.createReadStream(p).pipe(r);
  });
  return new Promise((res) => srv.listen(port, '127.0.0.1', () => res(srv)));
}
