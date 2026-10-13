// Readme census: node audit.mjs [outfile]  -> lines, broken links, child modules the readme never names.
import fs from 'fs'; import path from 'path';
const root = process.cwd();
const skip = /node_modules|[\\/]\.git|[\\/]sessions[\\/]\d{4}|[\\/]ai[\\/]\d{4}-|[\\/]salvage|[\\/]made[\\/]/;
const out = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (skip.test(p)) continue;
    if (e.isDirectory()) walk(p);
    else if (e.name === 'readme.md') out.push(p);
  }
}
for (const t of ['public/framework', 'Server', 'Servex']) walk(path.join(root, t));
// a site route like /x/doc/foo/ (or /x/md/doc/foo/) is the file x/doc/foo.md
const exists = p => {
  p = p.split('#')[0].split('?')[0];
  const q = p.replace(/[\\/]+$/, '').replace(/[\\/]md([\\/])/, '$1');
  return [p, q, q + '.md', q + '.js'].some(x => { try { return fs.existsSync(x); } catch { return false; } });
};
function resolve(href, dir) {
  href = decodeURI(href);
  if (/^(https?:|mailto:|#)/.test(href)) return null;
  const h = href.split('#')[0].split('?')[0]; if (!h) return null;
  if (h.startsWith('/')) {
    const c = [path.join(root, 'public', h), path.join(root, h)];
    if (c.some(exists)) return null;
    return h;
  }
  return exists(path.join(dir, h)) ? null : h;
}
const rows = [];
for (const f of out) {
  const dir = path.dirname(f), txt = fs.readFileSync(f, 'utf8'), lines = txt.split('\n').length;
  const links = [...txt.matchAll(/\]\(([^)\s]+)\)/g)].map(m => m[1]);
  const broken = [...new Set(links.map(l => resolve(l, dir)).filter(Boolean))];
  const kids = fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory() && !/^(doc|docs|node_modules|made|salvage|assets|img|images|lib|parts)$/.test(e.name) && !skip.test(path.join(dir, e.name)) && !e.name.startsWith('.') && !/^\d{4}-/.test(e.name))
    .filter(e => ['page.js', 'readme.md', e.name + '.js'].some(x => fs.existsSync(path.join(dir, e.name, x)))).map(e => e.name);
  const missing = kids.filter(k => !txt.toLowerCase().includes(k.toLowerCase()));
  rows.push({ file: path.relative(root, f).split(path.sep).join('/'), lines, broken, missing });
}
fs.writeFileSync(process.argv[2] || 'audit.json', JSON.stringify(rows, null, 1));
const over = rows.filter(r => r.lines > 100), bl = rows.filter(r => r.broken.length), ms = rows.filter(r => r.missing.length);
console.log(`readmes ${rows.length}; over100 ${over.length}; with broken links ${bl.length} (${bl.reduce((a, r) => a + r.broken.length, 0)} links); with unindexed children ${ms.length} (${ms.reduce((a, r) => a + r.missing.length, 0)} modules)`);
