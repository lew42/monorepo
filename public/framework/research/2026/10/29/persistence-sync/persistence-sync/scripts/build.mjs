// Build the tool dataset and the app's data file.
// Run from the repo root: node persistence-sync/scripts/build.mjs
// No dependencies. Never crashes on a bad op line: it skips and reports it.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // persistence-sync/
const REPO = path.resolve(ROOT, '..'); // repo root
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const relRepo = (p) => path.relative(REPO, p).split(path.sep).join('/');
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const list = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(ext)).sort().map((f) => path.join(dir, f)) : []);

export const kebab = (s) => String(s).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const norm = (s) => String(s ?? '').replace(/`/g, '').trim().toLowerCase();

// ---------- 1. Fold op logs ----------

export function readOps(files) {
  const ops = [], skipped = [];
  files.forEach((file, fi) => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, li) => {
      if (!line.trim()) return;
      let op;
      try { op = JSON.parse(line); } catch { skipped.push(`${rel(file)}:${li + 1} (bad JSON)`); return; }
      if (!op || typeof op !== 'object' || !['set', 'add', 'del'].includes(op.op) || !op.id || !op.key) {
        skipped.push(`${rel(file)}:${li + 1} (missing op/id/key)`); return;
      }
      ops.push({ ...op, _order: [fi, li] });
    });
  });
  const time = (op) => { const t = Date.parse(op.at); return Number.isNaN(t) ? Infinity : t; };
  ops.sort((a, b) => time(a) - time(b) || a._order[0] - b._order[0] || a._order[1] - b._order[1]);
  return { ops, skipped };
}

// List items match by value.id when present, else by value ("yjs" matches {id:"yjs"}).
const itemKey = (x) => (x && typeof x === 'object' && x.id != null ? String(x.id) : typeof x === 'string' ? x : JSON.stringify(x));
const sameItem = (a, b) => itemKey(a) === itemKey(b);

export function fold(ops) {
  const recs = new Map();
  for (const op of ops) {
    const id = kebab(op.id);
    if (!recs.has(id)) recs.set(id, { id });
    const r = recs.get(id);
    if (op.op === 'set') {
      r[op.key] = op.value;
    } else if (op.op === 'add') {
      if (!Array.isArray(r[op.key])) r[op.key] = r[op.key] === undefined ? [] : [r[op.key]];
      const i = r[op.key].findIndex((x) => sameItem(x, op.value));
      if (i >= 0) r[op.key][i] = op.value; else r[op.key].push(op.value);
    } else if (op.op === 'del') {
      if (op.value === undefined) delete r[op.key];
      else if (Array.isArray(r[op.key])) r[op.key] = r[op.key].filter((x) => !sameItem(x, op.value));
    }
    const meta = r._meta || (r._meta = { by: [], src: [], updated: null });
    if (op.by && !meta.by.includes(op.by)) meta.by.push(op.by);
    if (op.src && !meta.src.includes(op.src)) meta.src.push(op.src);
    if (op.at && (!meta.updated || op.at > meta.updated)) meta.updated = op.at;
  }
  return recs;
}

// ---------- 2. Metrics CSV ----------

export function parseCSV(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x !== '')) rows.push(row);
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const NUM = ['stars', 'forks', 'open_issues_incl_prs', 'stars_per_year', 'weekly_downloads', 'npm_dependents'];
function metricsOf(row) {
  const m = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === 'tool' || v === '') continue;
    if (k === 'category') m.csv_category = v;
    else if (NUM.includes(k)) m[k] = Number.isFinite(+v) ? +v : v;
    else if (k === 'archived') m.archived = v === 'true';
    else if (k === 'flags') m.flags = v.split(/\s+/).filter(Boolean);
    else m[k] = v;
  }
  return m;
}

// Id mapping table: under the taxonomy heading that mentions "id mapping".
// Every non-id cell in a row (tool name, repo, package, alias...) maps to that row's id.
export function idMapFromTaxonomy(md) {
  const map = new Map();
  if (!md) return map;
  let inMap = 0, head = null; // inMap = heading level of the current "id mapping" section, 0 when outside
  for (const line of md.split('\n')) {
    const h = line.match(/^(#+)\s+(.*)/);
    if (h) {
      if (/\bid map/i.test(h[2])) inMap = h[1].length;
      else if (inMap && h[1].length <= inMap) inMap = 0;
      head = null; continue;
    }
    if (!inMap || !line.trim().startsWith('|')) { head = null; continue; }
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    if (!head) { head = cells.map(norm); continue; }
    let idCol = head.findIndex((x) => /^(tool |record |canonical )?id$/.test(x));
    if (idCol < 0) idCol = head.findIndex((x) => /\bid\b/.test(x) && !/csv|name|alias/.test(x));
    if (idCol < 0) idCol = head.length - 1;
    const id = kebab(norm(cells[idCol]));
    if (!id) continue;
    cells.forEach((c, i) => { if (i !== idCol) c.split(/[,;]/).map(norm).filter(Boolean).forEach((k) => map.set(k, id)); });
  }
  return map;
}

// Candidate ids for a CSV row, strongest first. Rows are matched in rounds (all rows try
// candidate 0, then candidate 1, ...) so a weak guess never takes an id another row names exactly.
function csvCandidates(row) {
  const pkg = row.primary_package || '', repo = row.repo || '';
  return [kebab(row.tool), kebab(row.tool.replace(/\(.*?\)/g, '')), kebab(pkg), kebab(pkg.replace(/^@[^/]+\//, '')), kebab(repo.split('/')[1] || ''), kebab(repo)]
    .filter((c, i, a) => c && a.indexOf(c) === i);
}

export function assignCsvIds(rows, idMap, known) {
  const ids = new Array(rows.length).fill(null), via = new Array(rows.length).fill('name'), taken = new Set();
  rows.forEach((row, i) => {
    for (const k of [row.tool, row.repo, row.primary_package].map(norm)) if (k && idMap.has(k)) { ids[i] = idMap.get(k); via[i] = 'table'; taken.add(ids[i]); return; }
  });
  const cands = rows.map(csvCandidates);
  for (let round = 0; round < 6; round++) {
    rows.forEach((row, i) => {
      const c = cands[i][round];
      if (ids[i] == null && c && known.has(c) && !taken.has(c)) { ids[i] = c; via[i] = 'ops'; taken.add(c); }
    });
  }
  rows.forEach((row, i) => {
    if (ids[i] != null) return;
    const plain = kebab(row.tool.replace(/\(.*?\)/g, '')), full = kebab(row.tool); // "Hocuspocus (Yjs server)" -> hocuspocus
    ids[i] = !taken.has(plain) ? plain : !taken.has(full) ? full : `${full}-${i}`;
    taken.add(ids[i]);
  });
  return { ids, via };
}

// Structured vocabulary from taxonomy.md for the app: categories (with their family), subcategories,
// layers, decision axes (question, "Applies to", options with definition / users / sources), feature tags,
// status values and compatibility rules. Tolerant: anything it cannot find stays an empty list.
export function parseTaxonomy(md) {
  const T = { ready: false, families: [], categories: [], subcategories: [], layers: [], axes: [], features: [], statuses: [], rules: [] };
  if (!md) return T;
  T.ready = !/\((?:in progress|being (?:generated|written|filled)[^)]*|member lists are being generated)\)|status: skeleton/i.test(md);
  const id = (x) => kebab(String(x ?? '').replace(/`/g, ''));
  const cellsOf = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const option = (text) => { // "definition. Users: A, B. (notes/x.md Q1)"
    let src = '', users = '';
    const m = text.match(/\s*\(((?:notes|lessons|lew42)\/[^()]*(?:\([^()]*\)[^()]*)*)\)\s*$/);
    if (m) { src = m[1]; text = text.slice(0, m.index); }
    const u = text.match(/\s*(?:Few named users|Users?):\s*([\s\S]*?)\.?\s*$/);
    if (u) { users = u[1]; text = text.slice(0, u.index); }
    return { desc: text.trim(), users: users.trim(), src: src.trim() };
  };
  let sec = '', sub = '', head = null, axis = null, inStatus = false;
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    let h;
    if ((h = line.match(/^##\s+(.*)/))) { sec = h[1].toLowerCase(); sub = ''; head = null; axis = null; inStatus = false; continue; }
    if ((h = line.match(/^###\s+(.*)/))) { sub = h[1].trim(); head = null; axis = /axes|strateg/.test(sec) ? T.axes.find((a) => a.id === id(sub)) || null : null; continue; }
    if (line.trim().startsWith('|')) {
      const cells = cellsOf(line);
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      if (!head) { head = cells.map((c) => c.toLowerCase()); continue; }
      const key = id(cells[0]), di = head.findIndex((x, i) => i > 0 && /def|desc|mean|what|question|cover/.test(x)), desc = cells[di > 0 ? di : 1] || '';
      if (!key || /id map/.test(sec)) continue;
      if (/subcategor/.test(head[0])) T.subcategories.push({ id: key, desc, category: id(cells[head.indexOf('category')] ?? '') });
      else if (/layer/.test(sec)) T.layers.push({ id: key, desc });
      else if (/categor/.test(sec)) { if (!T.families.includes(sub)) T.families.push(sub); T.categories.push({ id: key, desc, family: sub }); }
      else if (/axes|strateg/.test(sec)) T.axes.push({ id: key, question: desc, applies: [], options: [] });
      else if (/feature/.test(sec)) T.features.push({ id: key, desc });
      continue;
    }
    head = null;
    if (/^status values/i.test(line.trim())) { inStatus = true; continue; }
    if ((h = line.match(/^Applies to:\s*(.*)$/i)) && axis) { axis.applies = h[1].replace(/\.$/, '').split(',').map(id).filter(Boolean); continue; }
    const b = line.match(/^-\s+`([^`]+)`:\s*(.*)$/);
    if (b && axis) axis.options.push({ id: id(b[1]), ...option(b[2]) });
    else if (b && inStatus) T.statuses.push({ id: id(b[1]), desc: b[2] });
    else if (b && /categor/.test(sec) && /how to tell/i.test(sub)) { const c = T.categories.find((x) => x.id === id(b[1])); if (c) c.more = b[2]; }
    else if (/compat/.test(sec) && (h = line.match(/^-\s+(.*)$/))) T.rules.push({ kind: sub, text: h[1], ids: [...h[1].matchAll(/`([^`]+)`/g)].map((x) => id(x[1].split(':')[0])) });
  }
  return T;
}

// ---------- 3. Docs ----------

// Every markdown file in the repo (skipping dot-folders and node_modules), with a path relative to
// the repo root and the time it last changed: the last commit for a clean tracked file, else mtime.
function walkMd(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(p, out);
    else if (e.name.endsWith('.md') && fs.statSync(p).size < 4e6) out.push(p);
  }
  return out;
}

function changedTimes(files) {
  const git = (...args) => execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  let dirty = null;
  try { dirty = new Set(git('status', '--porcelain', '--untracked-files=all').split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop())); } catch {}
  return files.map((f) => {
    const r = relRepo(f), mtime = fs.statSync(f).mtime.toISOString();
    if (!dirty || dirty.has(r)) return mtime;
    try { const t = git('log', '-1', '--format=%cI', '--', r).trim(); return t ? new Date(t).toISOString() : mtime; } catch { return mtime; }
  });
}

function collectDocs() {
  const files = walkMd(REPO).sort();
  const times = changedTimes(files);
  return files.map((file, i) => {
    const md = read(file);
    const title = (md.match(/^#\s+(.+)$/m) || [])[1]?.trim() || path.basename(file, '.md');
    return { path: relRepo(file), title, updated: times[i], md };
  });
}

// Which docs mention a tool: count word-boundary hits of its display name (and its id when hyphenated).
function mentions(tools, docs) {
  const out = {};
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const t of tools) {
    const name = String(t.name || t.id).replace(/\(.*?\)/g, '').trim();
    const terms = [name, t.id.includes('-') ? t.id : null].filter((x) => x && x.length > 1);
    const res = terms.map((s) => new RegExp(`(?<![\\w@/-])${esc(s)}(?![\\w-])`, s === t.id ? 'gi' : 'g')); // names are case-sensitive: "Solid", "React" are also plain words
    const hits = [];
    for (const d of docs) {
      const n = res.reduce((sum, re) => sum + (d.md.match(re) || []).length, 0);
      if (n) hits.push([d.path, n]);
    }
    if (hits.length) out[t.id] = hits.sort((a, b) => b[1] - a[1]);
  }
  return out;
}

// design/decisions.json: an array of {id, title, question, context, options[{id,label,summary}], recommended, kind, refs}.
// Missing file: decisions is null and the app shows a placeholder. Bad JSON or entries without id/options are reported, never fatal.
export function readDecisions(file) {
  const text = read(file), notes = [];
  if (text == null) return { decisions: null, designNotes: notes };
  let v;
  try { v = JSON.parse(text); } catch (e) { return { decisions: null, designNotes: [`design/decisions.json: bad JSON (${e.message})`] }; }
  const arrIn = Array.isArray(v) ? v : Array.isArray(v?.decisions) ? v.decisions : null;
  if (!arrIn) return { decisions: null, designNotes: ['design/decisions.json: expected an array'] };
  const seen = new Set(), out = [];
  arrIn.forEach((d, i) => {
    if (!d || typeof d !== 'object' || !d.id || !Array.isArray(d.options) || !d.options.length) { notes.push(`design/decisions.json: entry ${i + 1} needs id and options`); return; }
    const id = String(d.id).replace(/[^A-Za-z0-9_\-.~:@+]/g, '-').slice(0, 200); // ArtifactData doc ids allow these characters only
    if (seen.has(id)) { notes.push(`design/decisions.json: duplicate id ${id}`); return; }
    seen.add(id); out.push({ ...d, id });
  });
  return { decisions: out, designNotes: notes };
}

// ---------- design pages ----------
// The Design tab is a hub of four short lists. Their data is made here so the app only has to show it:
//   takeaways: design/takeaways.json [{id, group, line, detail, code, see[]}]; without it, the bullets of takeaways.md.
//   phase1:    design/phase-1.md split at its "## " headings (outside code fences) into sections.
//   fixes:     the numbered list of design/fixes.md ({n, title, why, effort, tests}) plus its "Notes for later".
// Missing or odd input is reported in design_notes, never fatal.
const stripMd = (t) => String(t ?? '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').trim();
const GROUPS = ['keep', 'change', 'adopt', 'avoid'];

export function readTakeaways(jsonFile, mdText) {
  const notes = [], text = read(jsonFile);
  let arrIn = null;
  if (text != null) {
    try { const v = JSON.parse(text); arrIn = Array.isArray(v) ? v : Array.isArray(v?.takeaways) ? v.takeaways : null; if (!arrIn) notes.push('design/takeaways.json: expected an array'); }
    catch (e) { notes.push(`design/takeaways.json: bad JSON (${e.message})`); }
  }
  if (arrIn) {
    const seen = new Set(), items = [];
    arrIn.forEach((t, i) => {
      if (!t || typeof t !== 'object' || !t.id || !t.line) { notes.push(`design/takeaways.json: entry ${i + 1} needs id and line`); return; }
      const id = String(t.id).replace(/[^A-Za-z0-9_\-.~:@+]/g, '-');
      if (seen.has(id)) { notes.push(`design/takeaways.json: duplicate id ${id}`); return; }
      seen.add(id);
      const g = String(t.group || '').trim().split(/[\s(]/)[0].toLowerCase();
      items.push({ ...t, id, group: GROUPS.includes(g) ? g : g || 'keep' });
    });
    if (items.length) return { takeaways: { source: 'json', items }, notes };
  }
  // Fallback: the bullets under **Keep**, **Change**, **Adopt (...)**, **Avoid** in takeaways.md.
  const items = []; let group = '';
  for (const line of String(mdText || '').split('\n')) {
    const h = line.match(/^\*\*(\w+)[^*]*\*\*\s*$/);
    if (h) { group = h[1].toLowerCase(); continue; }
    const b = line.match(/^[-*]\s+(.*\S)/);
    if (b && group) items.push({ id: `${group}-${items.filter((x) => x.group === group).length + 1}`, group, line: b[1], detail: '', code: '', see: [] });
  }
  if (!items.length) return { takeaways: null, notes };
  notes.push('takeaways: design/takeaways.json not usable, showing the bullets of takeaways.md');
  return { takeaways: { source: 'md', items }, notes };
}

export function splitPhase1(md) {
  const lines = String(md || '').split('\n'), parts = [{ title: '', body: [] }];
  let fence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) fence = !fence;
    const h = !fence && line.match(/^## (.+?)\s*$/);
    if (h) parts.push({ title: h[1], body: [line] }); else parts.at(-1).body.push(line);
  }
  const intro = parts.shift().body.join('\n');
  const sections = parts.map((p, i) => {
    const m = p.title.match(/^(\d+)\.\s*(.*)$/), body = p.body.join('\n').replace(/\n\s*---\s*$/, '').trim();
    return { n: m ? +m[1] : i + 1, name: m ? m[2] : p.title, md: body };
  });
  const title = (intro.match(/^#\s+(.+)$/m) || [])[1] || 'Phase 1 design';
  const legend = stripMd((intro.split(/\n\s*\n/).find((x) => /^Legend:/.test(x.trim())) || '').replace(/\s+/g, ' '));
  let line = ''; for (const sent of legend.match(/[^.]+\.(\s|$)/g) || []) { if (line && (line + sent).length > 170) break; line += sent; }
  return { phase1: sections.length ? { title, line: line.trim(), sections } : null, notes: sections.length ? [] : ['design/phase-1.md: no "## " sections found'] };
}

export function parseFixes(md) {
  const notes = [], items = [], later = [];
  let inLater = false;
  for (const line of String(md || '').split('\n')) {
    if (/^##\s+Notes for later/i.test(line)) { inLater = true; continue; }
    if (/^#{1,2}\s/.test(line) && inLater) inLater = false;
    if (inLater) { const b = line.match(/^[-*]\s+(.*\S)/); if (b) later.push(b[1]); continue; }
    const m = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*(?:Why:\s*)?(.*?)\s*\*\*([SML])\*\*\s*(?:·\s*(.*?))?\s*$/);
    if (m) items.push({ n: +m[1], title: m[2].replace(/\.$/, ''), why: m[3].trim(), effort: m[4], tests: (m[5] || '').split(/\s*,\s*/).filter(Boolean) });
    else if (/^\d+\.\s/.test(line)) notes.push(`design/fixes.md: could not read "${line.slice(0, 50)}"`);
  }
  const first = stripMd((String(md || '').split(/\n\s*\n/).find((x) => /^Ranked/.test(x.trim())) || '').replace(/\s+/g, ' '));
  const line = (first.match(/Effort:.*?week\./) || first.match(/^[^.]+\./) || [''])[0];
  return { fixes: items.length ? { line, items, later } : null, notes };
}

// ---------- main ----------

function main() {
  const opsFiles = list(path.join(ROOT, 'data', 'ops'), '.jsonl');
  const { ops, skipped } = readOps(opsFiles);
  const recs = fold(ops);
  const opIds = new Set(recs.keys());

  const taxonomyMd = read(path.join(ROOT, 'taxonomy.md'));
  const idMap = idMapFromTaxonomy(taxonomyMd);
  const csvText = read(path.join(ROOT, 'notes', 'adoption_metrics.csv'));
  const rows = csvText ? parseCSV(csvText) : [];
  const csvRows = rows.filter((r) => r.tool);
  const { ids, via } = assignCsvIds(csvRows, idMap, opIds);
  const csvOnly = [], how = { table: 0, ops: 0, name: 0 }, taken = new Set(ids);
  csvRows.forEach((row, i) => {
    const id = ids[i];
    how[via[i]]++;
    if (!recs.has(id)) { recs.set(id, { id }); csvOnly.push(`${id} (${row.tool})`); }
    const r = recs.get(id);
    r.metrics = { ...(r.metrics || {}), ...metricsOf(row) };
    if (r.name == null) r.name = row.tool;
  });
  const opsNoMetrics = [...opIds].filter((id) => !taken.has(id));

  // Likely id mismatches: an op id with no metrics that looks like a CSV-only id.
  const csvOnlyIds = csvOnly.map((s) => s.split(' ')[0]);
  const squash = (s) => s.replace(/-(js|sdk|client|server|core|orm|db)$/g, '').replace(/-/g, '');
  const nearMiss = opsNoMetrics.flatMap((o) => csvOnlyIds.filter((c) => squash(c) === squash(o) || (o.length > 3 && c.length > 3 && (c.startsWith(o) || o.startsWith(c)))).map((c) => `${o} ~ ${c}`));

  const tools = [...recs.values()].sort((a, b) => a.id.localeCompare(b.id));
  for (const t of tools) if (t.name == null) t.name = t.id;

  const docs = collectDocs();
  const built_at = new Date().toISOString();
  // Design tab: design/*.md ride along in docs (design/takeaways.md, phase-1.md, fixes.md); decisions.json is embedded here.
  const { decisions, designNotes } = readDecisions(path.join(REPO, 'design', 'decisions.json'));
  const docText = (p) => docs.find((d) => d.path === p)?.md || '';
  const tk = readTakeaways(path.join(REPO, 'design', 'takeaways.json'), docText('design/takeaways.md')), p1 = splitPhase1(docText('design/phase-1.md')), fx = parseFixes(docText('design/fixes.md'));
  designNotes.push(...tk.notes, ...p1.notes, ...fx.notes);
  const data = {
    built_at, tools, taxonomy_md: taxonomyMd, taxonomy: parseTaxonomy(taxonomyMd), docs, mentions: mentions(tools, docs), decisions, takeaways: tk.takeaways, phase1: p1.phase1, fixes: fx.fixes,
    build: { ops_files: opsFiles.map(rel), ops: ops.length, skipped, csv_rows: rows.length, csv_only: csvOnly, ops_without_metrics: opsNoMetrics, near_miss: nearMiss, design_notes: designNotes },
  };

  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'data', 'tools.jsonl'), tools.map((t) => JSON.stringify(t)).join('\n') + (tools.length ? '\n' : ''));
  fs.mkdirSync(path.join(ROOT, 'app'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'app', 'data.js'), `// Generated by scripts/build.mjs at ${built_at}. Do not edit.\nwindow.RESEARCH = ${JSON.stringify(data)};\n`);

  // hosted.html: one self-contained file (CSS, data, JS inlined; no doctype/html/head/body because the
  // host wraps it) for publishing as a hosted page. Local use stays index.html + data.js.
  const app = (f) => read(path.join(ROOT, 'app', f)) || '';
  const head = (app('index.html').match(/<title>[\s\S]*?<\/title>/) || ['<title>Research</title>'])[0];
  const bodyHtml = (app('index.html').match(/<body>([\s\S]*?)<script/) || ['', ''])[1].trim();
  const inline = (s) => s.replace(/<\/(script|style)/gi, '<\\/$1');
  fs.writeFileSync(path.join(ROOT, 'app', 'hosted.html'), `${head}\n<meta name="claude:viewport-fit-sides" content="cover">\n<!-- Generated by scripts/build.mjs at ${built_at}. Do not edit. -->\n<style>\n${app('app.css')}</style>\n${bodyHtml}\n<script>window.RESEARCH = ${JSON.stringify(data).replace(/</g, '\\u003c')};</script>\n<script>\n${inline(app('app.js'))}</script>\n`);

  // Live documents for the published page's database (collection "live"), ready for
  // ArtifactData set with file_path: app/live/status.json, owner.json, build.json.
  const liveDir = path.join(ROOT, 'app', 'live');
  fs.mkdirSync(liveDir, { recursive: true });
  for (const [k, p] of [['status', 'STATUS.md'], ['owner', 'OWNER.md']]) {
    const d = docs.find((x) => x.path === p);
    if (d) fs.writeFileSync(path.join(liveDir, `${k}.json`), JSON.stringify({ md: d.md, updated_at: d.updated }) + '\n');
  }
  fs.writeFileSync(path.join(liveDir, 'build.json'), JSON.stringify({ built_at }) + '\n');

  const short = (a, n = 40) => (a.length > n ? a.slice(0, n).join(', ') + `, ... (+${a.length - n})` : a.join(', '));
  console.log(`ops files: ${opsFiles.length} (${opsFiles.map(rel).join(', ') || 'none'})`);
  console.log(`ops folded: ${ops.length}, malformed lines skipped: ${skipped.length}${skipped.length ? '\n  ' + skipped.join('\n  ') : ''}`);
  console.log(`csv rows: ${csvRows.length}; id via taxonomy table: ${how.table}, via existing op id: ${how.ops}, via name fallback: ${how.name} (taxonomy id-map entries: ${idMap.size})`);
  console.log(`tools: ${tools.length} (with ops: ${opIds.size})`);
  if (opIds.size) console.log(`csv rows with no op record (${csvOnly.length}): ${short(csvOnly)}`);
  console.log(`op records with no csv metrics (${opsNoMetrics.length}): ${short(opsNoMetrics) || '-'}`);
  if (nearMiss.length) console.log(`possible id mismatches (op id ~ csv id), map these in the taxonomy id table: ${nearMiss.join(', ')}`);
  const tops = {}; docs.forEach((d) => { const k = d.path.includes('/') ? d.path.split('/')[0] : '(root)'; tops[k] = (tops[k] || 0) + 1; });
  console.log(`docs embedded: ${docs.length} (${(JSON.stringify(docs).length / 1024).toFixed(0)} KB): ${Object.entries(tops).map(([k, n]) => `${k} ${n}`).join(', ')}`);
  const tx = data.taxonomy;
  console.log(`taxonomy: ${tx.categories.length} categories in ${tx.families.length} families, ${tx.subcategories.length} subcategories, ${tx.layers.length} layers, ${tx.axes.length} axes (${tx.axes.reduce((n, a) => n + a.options.length, 0)} options), ${tx.features.length} features, ${tx.statuses.length} statuses, ${tx.rules.length} rules${tx.ready ? '' : ' (marked in progress)'}`);
  const dFiles = ['takeaways.md', 'phase-1.md', 'fixes.md'].map((f) => `${f}${docs.some((d) => d.path === `design/${f}`) ? '' : ' (missing)'}`).join(', ');
  console.log(`design: takeaways ${tk.takeaways ? `${tk.takeaways.items.length} (from ${tk.takeaways.source})` : 'none'}, phase 1 sections ${p1.phase1 ? p1.phase1.sections.length : 'none'}, fixes ${fx.fixes ? fx.fixes.items.length : 'none'}`);
  console.log(`design tab: ${dFiles}; decisions: ${decisions ? decisions.length : 'none'}${designNotes.length ? '\n  ' + designNotes.join('\n  ') : ''}`);
  console.log(`wrote data/tools.jsonl, app/data.js and app/hosted.html`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
